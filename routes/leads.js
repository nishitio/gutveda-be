import express from 'express';
import Lead from '../models/Lead.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public route - Save a new lead (for users to show interest)
router.post('/', async (req, res) => {
  const lead = new Lead(req.body);
  try {
    const newLead = await lead.save();
    res.status(201).json(newLead);
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error (e.g., duplicate email)
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

// Protected routes - Require authentication
// Get all leads (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clear all leads (admin only)
router.delete('/', auth, async (req, res) => {
  try {
    await Lead.deleteMany({});
    res.json({ message: 'All leads cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 