/**
 * MongoDB Schema for Medicine
 * Install mongoose: npm install mongoose
 * Connect to MongoDB in server.js before using this schema
 */

import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    image: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    composition: {
      type: String,
      required: true,
    },
    usage: {
      type: String,
      required: true,
    },
    sideEffects: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
medicineSchema.index({ name: 'text', brand: 'text', category: 'text' });
medicineSchema.index({ category: 1 });
medicineSchema.index({ prescriptionRequired: 1 });
medicineSchema.index({ price: 1 });

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;


