/**
 * Script to list all users
 * Usage: node scripts/listUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

const listUsers = async () => {
  try {
    // Connect to database
    const uri = process.env.MONGOOSE_URI || `mongodb://${process.env.MONGOOSE_HOST || '127.0.0.1:27017'}/${process.env.MONGOOSE_DB || 'moderex'}`;
    await mongoose.connect(uri);
    console.log('✅ Connected to database\n');

    // Get all users
    const users = await User.find({}).select('email name isAdmin createdAt');
    
    if (users.length === 0) {
      console.log('No users found in the database');
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Admin: ${user.isAdmin ? '✅ YES' : '❌ NO'}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    console.log('\nTo make a user admin, run:');
    console.log('node scripts/makeAdmin.js <email>');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listUsers();
