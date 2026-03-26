import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function run() {
  try {
    console.log("Connecting to:", uri);
    await mongoose.connect(uri);
    console.log("Connected.");
    
    const count = await Order.countDocuments();
    console.log("Total orders in DB:", count);
    
    const orders = await Order.find().limit(5);
    console.log("Recent orders (last 5):");
    orders.forEach(o => {
      console.log(`- Order #${o.orderNumber}: _id=${o._id}, status=${o.status}, prescriptions=${o.prescriptionFiles?.length || 0}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}
run();
