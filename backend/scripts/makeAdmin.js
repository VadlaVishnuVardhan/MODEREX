/**
 * Script to make a user an admin
 * Usage: node scripts/makeAdmin.js <email>
 * Example: node scripts/makeAdmin.js user@example.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

const makeAdmin = async (email) => {
  try {
    // Connect to database
    const uri = process.env.MONGOOSE_URI || `mongodb://${process.env.MONGOOSE_HOST || '127.0.0.1:27017'}/${process.env.MONGOOSE_DB || 'moderex'}`;
    await mongoose.connect(uri);
    console.log('✅ Connected to database');

    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node scripts/makeAdmin.js <email>');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('\nAvailable users:');
      const allUsers = await User.find({}).select('email name isAdmin');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) ${u.isAdmin ? '[ADMIN]' : ''}`);
      });
      process.exit(1);
    }

    // Check if already admin
    if (user.isAdmin) {
      console.log(`✅ User ${email} is already an admin`);
    } else {
      // Make user admin
      user.isAdmin = true;
      await user.save();
      console.log(`✅ Successfully made ${email} an admin!`);
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Log out from the application');
    console.log('   2. Log back in');
    console.log('   3. Access the admin dashboard at /admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];
makeAdmin(email);
