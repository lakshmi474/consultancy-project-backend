/**
 * Express Routes for Users API
 * Placeholder routes - implement user authentication and management
 */

import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/users/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, address, city, state, pincode } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Build user with address if provided
    const userPayload = { name, email, phone, password };
    if (address && city && state && pincode) {
      userPayload.addresses = [{
        name,
        phone,
        address,
        city,
        state,
        pincode,
        isDefault: true
      }];
    }
    
    const user = new User(userPayload);
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users - List all users (Admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/toggle-status - Block/Unblock user (Admin)
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


