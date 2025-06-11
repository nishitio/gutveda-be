import express from 'express';
import Lead from '../models/Lead.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public route - Save a new lead (for users to show interest)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, source, productInterest, product, flavor } = req.body;
    const newLead = new Lead({
      name,
      email,
      phone,
      source,
      productInterest,
      product,
      flavor
    });
    await newLead.save();
    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(400).json({ message: error.message });
  }
});

// Public route - Save a cart lead
router.post('/cart', async (req, res) => {
  try {
    console.log('Received cart data:', req.body);
    const { name, email, productFormat, flavor, quantity } = req.body;

    // Validate required fields
    if (!productFormat || !flavor || !quantity || !name || !email) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          productFormat: !productFormat ? 'Product format is required' : null,
          flavor: !flavor ? 'Flavor is required' : null,
          quantity: !quantity ? 'Quantity is required' : null
        }
      });
    }

    // Validate product format
    const validFormats = ['finepowder', 'husk', 'tablets'];
    if (!validFormats.includes(productFormat)) {
      return res.status(400).json({
        message: 'Invalid product format',
        details: {
          productFormat: `Must be one of: ${validFormats.join(', ')}`
        }
      });
    }

    // Validate flavor
    const validFlavors = ['unflavoured', 'orange'];
    if (!validFlavors.includes(flavor)) {
      return res.status(400).json({
        message: 'Invalid flavor',
        details: {
          flavor: `Must be one of: ${validFlavors.join(', ')}`
        }
      });
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity < 1 || quantity > 5) {
      return res.status(400).json({
        message: 'Invalid quantity',
        details: {
          quantity: 'Must be a number between 1 and 5'
        }
      });
    }

    // Check for existing lead with same email, product format, and flavor
    const existingLead = await Lead.findOne({
      email,
      productFormat,
      flavor,
      type: 'cart' // Only consider cart leads for this check
    });

    if (existingLead) {
      return res.status(409).json({
        message: 'You have already added this specific product and flavor combination to your cart.',
        details: 'Duplicate entry'
      });
    }

    // Create new lead
    const newLead = new Lead({
      name,
      email,
      productFormat,
      flavor,
      quantity,
      type: 'cart',
      source: 'website'
    });

    await newLead.save();
    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error saving cart lead:', error);
    res.status(400).json({
      message: 'Failed to save cart lead',
      details: error.message
    });
  }
});

// Protected routes - Require authentication
// Get all leads (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all leads (admin only)
router.delete('/', auth, async (req, res) => {
  try {
    await Lead.deleteMany({});
    res.json({ message: 'All leads cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 