const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Startup = require('./models/Startup');
const startups = require('./data/seedData');

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edtech_db';
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    await Startup.deleteMany({});
    console.log('Cleared existing startups.');

    const created = await Startup.insertMany(startups);
    console.log(`🎉 Successfully seeded ${created.length} Top Bangladeshi EdTech Startups!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
