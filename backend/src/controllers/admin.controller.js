const FlaggedContent = require('../models/flaggedContent.model');
const Post = require('../models/post.model');
const { errorResponse } = require('../utils/utils');

// Get all flagged content
const getFlaggedContent = async (req, res) => {
  try {
    const { status = 'pending', contentType = '' } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }
    if (contentType) {
      filter.contentType = contentType;
    }

    const flaggedContent = await FlaggedContent.find(filter)
      .populate('userId', 'name email profile')
      .populate('postId', 'title type')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      message: 'Flagged content fetched successfully',
      flaggedContent,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Review flagged content (approve or reject)
const reviewFlaggedContent = async (req, res) => {
  try {
    const { flaggedId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    const { id } = req.user;

    if (!['approve', 'reject'].includes(action)) {
      return errorResponse(res, 400, 'Invalid action. Use "approve" or "reject"');
    }

    const flaggedContent = await FlaggedContent.findById(flaggedId);
    if (!flaggedContent) {
      return errorResponse(res, 404, 'Flagged content not found');
    }

    // Update flagged content status
    flaggedContent.status = action === 'approve' ? 'approved' : 'rejected';
    flaggedContent.reviewedBy = id;
    flaggedContent.reviewedAt = new Date();
    await flaggedContent.save();

    // If rejecting a comment, remove it from the post
    if (action === 'reject' && flaggedContent.contentType === 'comment') {
      const post = await Post.findById(flaggedContent.postId);
      if (post) {
        post.comments = post.comments.filter(
          comment => comment._id.toString() !== flaggedContent.contentId.toString()
        );
        await post.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: `Content ${action}ed successfully`,
      flaggedContent,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    const totalFlagged = await FlaggedContent.countDocuments();
    const pending = await FlaggedContent.countDocuments({ status: 'pending' });
    const approved = await FlaggedContent.countDocuments({ status: 'approved' });
    const rejected = await FlaggedContent.countDocuments({ status: 'rejected' });

    // Get category breakdown
    const flaggedContent = await FlaggedContent.find({ status: 'pending' });
    const categoryBreakdown = {};
    
    flaggedContent.forEach(item => {
      if (item.moderation && item.moderation.categories) {
        Object.entries(item.moderation.categories).forEach(([category, isFlagged]) => {
          if (isFlagged) {
            categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
          }
        });
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalFlagged,
        pending,
        approved,
        rejected,
        categoryBreakdown,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const User = require('../models/user.model');

// Handle additional admin actions
const handleFlaggedAction = async (req, res) => {
  try {
    const { flaggedId } = req.params;
    const { action } = req.body; // 'delete', 'warn', 'suspend', 'view'
    const { id } = req.user;

    const flaggedContent = await FlaggedContent.findById(flaggedId);
    if (!flaggedContent) {
      return errorResponse(res, 404, 'Flagged content not found');
    }

    switch (action) {
      case 'delete':
        // Delete the content
        if (flaggedContent.contentType === 'post') {
          await Post.findByIdAndDelete(flaggedContent.postId);
        } else if (flaggedContent.contentType === 'comment') {
          const post = await Post.findById(flaggedContent.postId);
          if (post) {
            post.comments = post.comments.filter(
              comment => comment._id.toString() !== flaggedContent.contentId.toString()
            );
            await post.save();
          }
        }
        // Mark flagged content as rejected
        flaggedContent.status = 'rejected';
        flaggedContent.reviewedBy = id;
        flaggedContent.reviewedAt = new Date();
        await flaggedContent.save();
        break;

      case 'warn':
        // Send warning to user (could implement notification system)
        // For now, just log and mark as reviewed
        console.log(`Warning sent to user ${flaggedContent.userId} for content: ${flaggedContent.text}`);
        flaggedContent.status = 'approved'; // Keep content but warn user
        flaggedContent.reviewedBy = id;
        flaggedContent.reviewedAt = new Date();
        await flaggedContent.save();
        break;

      case 'suspend':
        // Suspend user account
        const user = await User.findById(flaggedContent.userId);
        if (user) {
          user.isSuspended = true;
          user.suspendedAt = new Date();
          user.suspendedBy = id;
          await user.save();
        }
        // Mark flagged content as rejected
        flaggedContent.status = 'rejected';
        flaggedContent.reviewedBy = id;
        flaggedContent.reviewedAt = new Date();
        await flaggedContent.save();
        break;

      case 'view':
        // Return detailed content information
        const detailedContent = await FlaggedContent.findById(flaggedId)
          .populate('userId', 'name email profile')
          .populate('postId', 'title type')
          .populate('reviewedBy', 'name email');
        return res.status(200).json({
          success: true,
          content: detailedContent,
        });

      default:
        return errorResponse(res, 400, 'Invalid action');
    }

    return res.status(200).json({
      success: true,
      message: `${action.charAt(0).toUpperCase() + action.slice(1)} action completed successfully`,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  getFlaggedContent,
  reviewFlaggedContent,
  getAdminStats,
  handleFlaggedAction,
};
