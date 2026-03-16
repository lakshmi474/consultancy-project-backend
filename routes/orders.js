/**
 * Express Routes for Orders API
 * Placeholder routes - implement full order management
 */

import express from 'express';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';

const router = express.Router();

// GET /api/orders - Get user orders or all orders
router.get('/', async (req, res) => {
  try {
    const filter = req.query.userId ? { user: req.query.userId } : {};
    const orders = await Order.find(filter).populate('items.medicine');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.medicine').populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Create the order
    const order = new Order({
      user: orderData.user,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      subtotal: orderData.subtotal,
      deliveryCharge: orderData.deliveryCharge || 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      prescriptionFiles: orderData.prescriptionFiles
    });
    
    await order.save();

    // Decrease the stock for each medicine in the order
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        // Only attempt to update if the ID is a valid MongoDB ObjectId 
        // (to prevent cast errors from mock frontend data)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(item.medicine));
        if (isObjectId) {
          try {
            await Medicine.findByIdAndUpdate(item.medicine, {
              $inc: { stock: -item.quantity }
            });
          } catch (err) {
            console.error('Failed to update stock:', err);
            // Ignore stock update error and proceed
          }
        }
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status (Admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


