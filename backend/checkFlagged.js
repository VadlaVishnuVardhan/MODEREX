require('dotenv').config();
const mongoose = require('mongoose');
const FlaggedContent = require('./src/models/flaggedContent.model');

async function checkFlagged() {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI);
    console.log('Connected to database\n');

    const flagged = await FlaggedContent.find({})
      .populate('userId', 'name email')
      .populate('postId', 'title')
      .sort({ createdAt: -1 });

    if (flagged.length === 0) {
      console.log('No flagged content found in the database');
      console.log('This means no comments have been flagged yet.');
      console.log('Try posting a threatening comment like "i will kill him" to see it flagged.');
      process.exit(0);
    }

    console.log(`Found ${flagged.length} flagged content item(s):\n`);

    flagged.forEach((item, i) => {
      console.log(`${i + 1}. ${item.contentType}: "${item.text}"`);
      console.log(`   User: ${item.userId?.name || 'Unknown'} (${item.userId?.email || 'Unknown'})`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Flagged: ${item.moderation?.flagged}`);
      console.log(`   Categories: ${Object.keys(item.moderation?.categories || {}).filter(cat => item.moderation.categories[cat]).join(', ') || 'None'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkFlagged();
