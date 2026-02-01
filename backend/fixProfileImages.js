const mongoose = require('mongoose');
const User = require('./src/models/user.model');
require('dotenv').config();

const connectDatabase = require('./src/config/database');

const fixProfileImages = async () => {
  try {
    await connectDatabase();
    console.log('Connected to database');

    // Find all users with profile URLs containing localhost
    const usersToUpdate = await User.find({
      'profile.url': { $regex: /^\/uploads\/profile-/ }
    });

    console.log(`Found ${usersToUpdate.length} users with localhost profile URLs`);

    for (const user of usersToUpdate) {
      const oldUrl = user.profile.url;
      // Replace localhost:3000 with production URL
      const newUrl = oldUrl.replace(/^\/uploads/, 'https://moderex.onrender.com/uploads');

      await User.updateOne(
        { _id: user._id },
        { $set: { 'profile.url': newUrl } }
      );

      console.log(`Updated user ${user.email}: ${oldUrl} -> ${newUrl}`);
    }

    console.log('Profile image URLs updated successfully');
    process.exit(0);

  } catch (error) {
    console.error('Error fixing profile images:', error);
    process.exit(1);
  }
};

fixProfileImages();
