import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import leadsRouter from './routes/leads.js';
import authRouter from './routes/auth.js';

dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 5050;

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.CLIENT_ORIGIN_PROD ? process.env.CLIENT_ORIGIN_PROD.split(',').map(origin => origin.trim()) : [])
  : (process.env.CLIENT_ORIGIN_DEV ? process.env.CLIENT_ORIGIN_DEV.split(',').map(origin => origin.trim()) : []).concat(['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:5173']);

console.log('Allowed Origins:', allowedOrigins);

// Enable CORS for all routes
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// MongoDB Connection
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected successfully');
} catch (err) {
  console.error('MongoDB connection error:', err);
}

// Routes
app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter); // Auth middleware is now handled in the routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 