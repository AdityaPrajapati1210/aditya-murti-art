const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Gallery = require('./models/Gallery');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/clay_art_studio';
    await mongoose.connect(dbUri);
    console.log('Connected to Database for seeding...');

    // 1. Seed Admin Account
    // We clear existing users first to ensure we don't duplicate
    await User.deleteMany({});
    console.log('Cleared old users.');

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'jeetendra@clay123';

    await User.create({
      username: adminUsername,
      password: adminPassword,
    });
    console.log(`Admin user created: "${adminUsername}" with password: "${adminPassword}"`);

    // 2. Seed Sample Gallery Items if empty
    // We clear and re-seed to ensure clean baseline image listings
    // await Gallery.deleteMany({});
    // console.log('Cleared old gallery items.');

    // const sampleItems = [
    //   {
    //     title: 'Handmade Lord Ganesha Clay Idol',
    //     description: 'Eco-friendly traditional Lord Ganesha idol sculpted entirely from fine riverbed clay (Mitti). Detailed hand ornaments and fine textures, painted with bio-degradable natural dyes.',
    //     imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d58309df50e?q=80&w=800',
    //     cloudinaryId: 'sample_ganesha',
    //     category: 'Religious Murti',
    //     dimensions: '2.5 Feet',
    //   },
    //   {
    //     title: 'Artisan Terracotta Garden Sculpture',
    //     description: 'A classic heritage style human form sculpture sculpted for outdoor garden spaces. Baked terracotta finish that naturally weathers over time to fit landscape aesthetics.',
    //     imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800',
    //     cloudinaryId: 'sample_garden',
    //     category: 'Durga Maa',
    //     dimensions: '3.5 Feet',
    //   },
    //   {
    //     title: 'Detailed Traditional Durga Idol',
    //     description: 'A major festival sculpture project depicting Goddess Durga killing Mahishasura. Crafted with straw, clay-binding layers, and finished with traditional clay ornaments.',
    //     imageUrl: 'https://images.unsplash.com/photo-1590075865003-e48277aff551?q=80&w=800',
    //     cloudinaryId: 'sample_durga',
    //     category: 'Krishna',
    //     dimensions: '6.0 Feet',
    //   },
    //   {
    //     title: 'Custom Anatomical Bust Sculpture',
    //     description: 'A personalized commission bust order carved carefully in modeling clay, highlighting anatomical precision and lifelike facial expressions.',
    //     imageUrl: 'https://images.unsplash.com/photo-1582555762499-54848d56b8ac?q=80&w=800',
    //     cloudinaryId: 'sample_custom_bust',
    //     category: 'Ganesha',
    //     dimensions: '18 Inches',
    //   }
    // ];

    // await Gallery.insertMany(sampleItems);
    // console.log('Sample gallery items seeded successfully.');

    console.log('Database Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
