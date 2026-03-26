/**
 * Express Routes for Orders API
 * Placeholder routes - implement full order management
 */

import express from 'express';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';
import { sendOrderNotification } from '../utils/email.js';

const router = express.Router();

// GET /api/orders - Get user orders or all orders
router.get('/', async (req, res) => {
  try {
    const filter = req.query.userId ? { user: req.query.userId } : {};
    const orders = await Order.find(filter).populate('items.medicine').populate('user');
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

// PUT /api/orders/:id/prescription-status - Update prescription status (Admin only)
router.put('/:id/prescription-status', async (req, res) => {
  try {
    const { status, deliveryDate } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { 
        prescriptionStatus: status,
        deliveryDate: deliveryDate || undefined
      },
      { new: true }
    ).populate('user');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Send email notification to user about prescription update
    if (order.user && order.user.email) {
      const type = status === 'Approved' ? 'prescription_approved' : 'prescription_rejected';
      await sendOrderNotification(order, type);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status (Admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const oldOrder = await Order.findById(req.params.id);
    
    if (!oldOrder) return res.status(404).json({ message: 'Order not found' });

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status },
      { new: true }
    ).populate('user');

    // Handle stock restoration if cancelled
    if (status === 'Cancelled' && oldOrder.status !== 'Cancelled') {
      for (const item of updatedOrder.items) {
        const medicineId = item.medicine._id || item.medicine;
        if (medicineId) {
          await Medicine.findByIdAndUpdate(medicineId, {
            $inc: { stock: item.quantity }
          });
        }
      }
    }

    // Notify user of status change
    if (updatedOrder.user && updatedOrder.user.email) {
      await sendOrderNotification(updatedOrder, `status_${status.toLowerCase().replace(/ /g, '_')}`);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders/:id/cancel - Cancel order (User)
router.post('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Only allow cancellation if order is not yet ready/shipped/delivered
    if (['Ready', 'Out for Delivery', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'Cancelled';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      const medicineId = item.medicine._id || item.medicine;
      if (medicineId) {
        await Medicine.findByIdAndUpdate(medicineId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    const populatedOrder = await order.populate('user');
    if (populatedOrder.user && populatedOrder.user.email) {
      await sendOrderNotification(populatedOrder, 'status_cancelled');
    }

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


