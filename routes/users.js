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

// GET /api/users/profile - Get user profile (authenticated)
router.get('/profile', async (req, res) => {
  try {
    // TODO: Implement profile fetching
    res.json({ message: 'Get user profile - To be implemented (Authenticated)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/profile - Update user profile (authenticated)
router.put('/profile', async (req, res) => {
  try {
    // TODO: Implement profile update
    res.json({ message: 'Update user profile - To be implemented (Authenticated)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


