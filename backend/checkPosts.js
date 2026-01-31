require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./src/models/post.model');

async function checkPosts() {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI);
    console.log('Connected to database\n');

    const posts = await Post.find({}).populate('comments.userId', 'name email');

    if (posts.length === 0) {
      console.log('No posts found in the database');
      console.log('You need to create a post first, then add comments to it.');
      process.exit(0);
    }

    console.log(`Found ${posts.length} post(s):\n`);

    posts.forEach((post, i) => {
      console.log(`${i + 1}. Post: "${post.title || 'No title'}"`);
      console.log(`   Comments: ${post.comments?.length || 0}`);

      if (post.comments?.length > 0) {
        post.comments.forEach((comment, j) => {
          console.log(`     ${j + 1}. ${comment.userId?.name || 'Unknown'}: "${comment.text}"`);
          console.log(`        Moderated: ${comment.moderation ? 'Yes' : 'No'}`);
          if (comment.moderation) {
            console.log(`        Flagged: ${comment.moderation.flagged}`);
            console.log(`        Categories: ${Object.keys(comment.moderation.categories || {}).filter(cat => comment.moderation.categories[cat]).join(', ') || 'None'}`);
          }
        });
      }
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPosts();
