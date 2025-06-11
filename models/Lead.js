import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, index: true },
  phone: { type: String },
  source: { type: String, default: 'general' },
  productFormat: { type: String, required: true }, // finepowder, husk, or tablets
  flavor: { type: String, required: true }, // unflavoured or orange
  quantity: { type: Number, required: true, default: 1 },
  type: { type: String, required: true, enum: ['cart', 'contact'], default: 'contact' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Lead', leadSchema); 