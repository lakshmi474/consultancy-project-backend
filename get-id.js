import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const order = await Order.findOne({ prescriptionFiles: { $exists: true, $not: { $size: 0 } } });
  if (order) {
    console.log(`ID:${order._id}`);
    console.log(`NUM:${order.orderNumber}`);
    console.log(`STATUS:${order.prescriptionStatus}`);
  } else {
    console.log("No orders with prescriptions found.");
    const anyOrder = await Order.findOne();
    if (anyOrder) {
      console.log(`ANY_ID:${anyOrder._id}`);
    }
  }
  process.exit(0);
}
run();
