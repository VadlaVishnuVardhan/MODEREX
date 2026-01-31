const mongoose = require('mongoose');
const Post = require('./src/models/post.model');
require('dotenv').config();

async function fixPostTypes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/moderex');

    console.log('Connected to database');

    // Find all posts
    const posts = await Post.find({});

    console.log(`Found ${posts.length} posts to check`);

    let updatedCount = 0;

    for (const post of posts) {
      let shouldUpdate = false;
      let newType = post.type;

      if (post.video && post.video.url) {
        // If post has video, type should be 'reel'
        if (post.type !== 'reel') {
          newType = 'reel';
          shouldUpdate = true;
        }
      } else if (post.image && post.image.url) {
        // If post has image and no video, type should be 'post'
        if (post.type !== 'post') {
          newType = 'post';
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        await Post.findByIdAndUpdate(post._id, { type: newType });
        updatedCount++;
        console.log(`Updated post ${post._id}: type set to ${newType}`);
      }
    }

    console.log(`Updated ${updatedCount} posts`);
    console.log('Post type fix completed');

  } catch (error) {
    console.error('Error fixing post types:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

fixPostTypes();
