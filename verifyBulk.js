import mongoose from 'mongoose';
import Medicine from './models/Medicine.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const cats = [
    'Skin Care Medicines', 
    'Vitamins & Supplements', 
    'Cold & Cough', 
    'Heart & BP Medicines'
  ];
  for (const c of cats) {
    const count = await Medicine.countDocuments({ category: c });
    console.log(`${c}: ${count}`);
  }
  process.exit(0);
}
run();
