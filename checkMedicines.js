import mongoose from 'mongoose';
import Medicine from './models/Medicine.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const categories = [
        'Tablets & Capsules',
        'Syrups & Drops',
        'Injections',
        'OTC Medicines',
        'First Aid',
        'Diabetes Care',
        'Heart & BP Medicines',
        'Skin Care Medicines',
        'Cold & Cough',
        'Pain Relief',
        'Vitamins & Supplements',
        'Baby Care Medicines',
        'Women Health Medicines',
        'Elderly Care',
        'Ayurvedic / Herbal Medicines',
        'Medical Devices',
    ];
    
    for (const cat of categories) {
      const count = await Medicine.countDocuments({ category: cat });
      console.log(`${cat}: ${count}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
