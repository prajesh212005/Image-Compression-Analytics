require('dotenv').config();
const mongoose = require('mongoose');
const Image = require('../models/Image');
const Analytics = require('../models/Analytics');
const connectDB = require('../config/db');

const initializeDB = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Drop existing collections to start fresh
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }

    // Create indexes for better query performance
    await Image.createIndexes();
    await Analytics.createIndexes();

    console.log('Database initialized successfully!');
    console.log('Collections created:');
    console.log('- images');
    console.log('- analytics');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDB(); 