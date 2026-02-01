const Post = require("../models/post.model");
const FlaggedContent = require("../models/flaggedContent.model");
const { errorResponse } = require("../utils/utils");
const { moderateContent, shouldAutoReject } = require("../services/moderation.service");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Get all posts (for home feed)
const getAllPosts = async (req, res) => {
  try {
    const { search = '', type = '' } = req.query;

    let filter = {};
    if (type) {
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await Post.find(filter)
      .populate('userId', 'name profile')
      .populate('likedBy', 'name')
      .populate('comments.userId', 'name profile')
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      posts,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = '' } = req.query;

    let filter = { userId };
    if (type) {
      filter.type = type;
    }

    const posts = await Post.find(filter)
      .populate('userId', 'name profile')
      .populate('likedBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'User posts fetched successfully',
      posts,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Create a new post
const createPost = async (req, res) => {
  try {
    const { id } = req.user || {};
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !file) {
      return errorResponse(res, 400, 'Title and media file are required');
    }

    const isVideo = file.mimetype.startsWith('video');

    const useCloudinary = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_API_KEY &&
      process.env.CLOUDINARY_CLOUD_API_SECRET
    );

    let uploaded = null;

    if (useCloudinary) {
      const uploadPromise = new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            resource_type: isVideo ? 'video' : 'auto',
            folder: 'moderex_posts',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        upload.end(file.buffer);
      });
      uploaded = await uploadPromise;
    } else {
      // Local fallback: save to uploads/posts
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'posts');
      fs.mkdirSync(uploadsDir, { recursive: true });
      const extFromName = (file.originalname && file.originalname.includes('.')) ? file.originalname.split('.').pop() : '';
      const extFromMime = (file.mimetype && file.mimetype.split('/')[1]) || '';
      const ext = (extFromName || extFromMime || (isVideo ? 'mp4' : 'jpg')).toLowerCase();
      const filename = `post-${id}-${Date.now()}.${ext}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, file.buffer);
      uploaded = {
        secure_url: `/uploads/posts/${filename}`,
        public_id: null,
      };
    }

    // Determine final type: video -> 'reel', else use provided or default 'post'
    const finalType = isVideo ? 'reel' : (req.body?.type || 'post');

    // Moderate the post content (title + description)
    const contentToModerate = `${title} ${description || ''}`.trim();
    const moderation = await moderateContent(contentToModerate);

    // Create post object
    const postData = {
      userId: id,
      title,
      description,
      type: finalType,
      moderation,
    };

    if (isVideo) {
      postData.video = {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
    } else {
      postData.image = {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
    }

    const post = await Post.create(postData);
    await post.populate('userId', 'name profile');

    // If content is flagged, create a flagged content record
    if (moderation.flagged) {
      await FlaggedContent.create({
        contentType: 'post',
        contentId: post._id,
        postId: post._id,
        userId: id,
        text: contentToModerate,
        moderation,
        status: shouldAutoReject(moderation) ? 'rejected' : 'pending',
      });

      // If auto-rejected, delete the post immediately
      if (shouldAutoReject(moderation)) {
        await Post.findByIdAndDelete(post._id);

        return errorResponse(
          res,
          400,
          'Post contains inappropriate content and has been rejected'
        );
      }

      console.log(`[Moderation] Post flagged for review: ${post._id}`);
    }

    return res.status(201).json({
      success: true,
      message: moderation.flagged
        ? 'Post created but flagged for review'
        : 'Post created successfully',
      post,
      moderation: moderation.flagged ? { flagged: true } : undefined,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Like a post
const likePost = async (req, res) => {
  try {
    const { id } = req.user || {};
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    const alreadyLiked = post.likedBy.includes(id);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(userId => userId.toString() !== id);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(id);
      post.likes += 1;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      post,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Add comment to post
const addComment = async (req, res) => {
  try {
    const { id } = req.user || {};
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return errorResponse(res, 400, 'Comment text is required');
    }

    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    // Moderate the comment using OpenAI
    const moderation = await moderateContent(text);

    // Create comment object
    const newComment = {
      userId: id,
      text: text.trim(),
      moderation,
    };

    // Add comment to post
    post.comments.push(newComment);
    await post.save();

    // Get the newly added comment (last one in array)
    const addedComment = post.comments[post.comments.length - 1];

    // If content is flagged, create a flagged content record
    if (moderation.flagged) {
      await FlaggedContent.create({
        contentType: 'comment',
        contentId: addedComment._id,
        postId: post._id,
        userId: id,
        text: text.trim(),
        moderation,
        status: shouldAutoReject(moderation) ? 'rejected' : 'pending',
      });

      // If auto-rejected, remove the comment immediately
      if (shouldAutoReject(moderation)) {
        post.comments = post.comments.filter(
          comment => comment._id.toString() !== addedComment._id.toString()
        );
        await post.save();

        return errorResponse(
          res,
          400,
          'Comment contains inappropriate content and has been rejected'
        );
      }

      console.log(`[Moderation] Comment flagged for review: ${addedComment._id}`);
    }

    // Populate user info
    await post.populate('comments.userId', 'name profile');

    return res.status(200).json({
      success: true,
      message: moderation.flagged 
        ? 'Comment added but flagged for review' 
        : 'Comment added successfully',
      post,
      moderation: moderation.flagged ? { flagged: true } : undefined,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { id } = req.user || {};
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    // Check if the user is the owner of the post
    if (post.userId.toString() !== id) {
      return errorResponse(res, 403, 'You are not authorized to delete this post');
    }

    // Delete media from Cloudinary or local storage
    if (post.image?.public_id) {
      await cloudinary.uploader.destroy(post.image.public_id);
    } else if (post.video?.public_id) {
      await cloudinary.uploader.destroy(post.video.public_id, { resource_type: 'video' });
    } else {
      // Local file deletion
      const mediaUrl = post.image?.url || post.video?.url;
      if (mediaUrl && mediaUrl.includes('/uploads/posts/')) {
        const filename = mediaUrl.split('/uploads/posts/')[1];
        const filepath = path.join(__dirname, '..', '..', 'uploads', 'posts', filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    }

    // Delete associated flagged content
    await FlaggedContent.deleteMany({ postId });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.user || {};
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }

    const commentIndex = post.comments.findIndex(
      comment => comment._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return errorResponse(res, 404, 'Comment not found');
    }

    const comment = post.comments[commentIndex];

    // Check if the user is the owner of the comment
    if (comment.userId.toString() !== id) {
      return errorResponse(res, 403, 'You are not authorized to delete this comment');
    }

    // Remove the comment from the array
    post.comments.splice(commentIndex, 1);
    await post.save();

    // Delete associated flagged content
    await FlaggedContent.deleteMany({
      contentType: 'comment',
      contentId: commentId,
    });

    // Populate user info for remaining comments
    await post.populate('comments.userId', 'name profile');

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      post,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  getAllPosts,
  getUserPosts,
  createPost,
  likePost,
  addComment,
  deletePost,
  deleteComment,
};
