const mongoose = require('mongoose');
const Startup = require('../models/Startup');
const startupsData = require('../data/seedData');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edtech_db';
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);

    // Auto-seed if database is currently empty
    try {
      const count = await Startup.countDocuments();
      if (count === 0) {
        console.log('🌱 Database is empty. Auto-seeding top Bangladeshi EdTech startups...');
        await Startup.insertMany(startupsData);
        console.log(`🎉 Auto-seeded ${startupsData.length} startups successfully!`);
      } else {
        console.log(`📊 Found ${count} startups in the database.`);
      }
    } catch (seedErr) {
      console.warn('⚠️ Auto-seed check warning:', seedErr.message);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`⚠️ Running with in-memory fallback data so API remains active.`);
  }
};

module.exports = connectDB;
