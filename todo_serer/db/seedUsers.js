const mongoose = require('mongoose');
const User = require('../models/User');

const defaultUsers = [
  { username: 'Avinash', password: 'Avinash123' },
  { username: 'Dhaya', password: 'Dhaya123' },
  { username: 'Ashok', password: 'Ashok123' },
  { username: 'Arun', password: 'Arun123' },
  { username: 'Cathrine', password: 'Cathrine123' }
];

const seedUsers = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
      await User.insertMany(defaultUsers);
      console.log('✅ Default users seeded successfully');
    } else {
      console.log('ℹ️ Users already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
};

module.exports = seedUsers;