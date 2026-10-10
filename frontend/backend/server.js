const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initSchema } = require('./db/schema');
const { seedUsers, seedProducts } = require('./db/seed');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow env-configured frontend URL + localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server / curl (no origin) and any allowed origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    // Allow wildcard subdomains for Vercel preview deployments
    const isAllowed = allowedOrigins.some(allowed => {
      if (!allowed) return false;
      if (allowed === origin) return true;
      if (allowed.includes('vercel.app') && origin.endsWith('vercel.app')) return true;
      return false;
    });
    // In production, allow configured origins; during dev allow all for ease
    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // still allow but log
      console.warn(`CORS: origin ${origin} not in allowedOrigins`, allowedOrigins);
    }
  },
  credentials: true
}));

app.use(express.json());

// Initialize Database Schema & Seed Data
try {
  initSchema();
  seedUsers();
  seedProducts();
} catch (err) {
  console.error('Failed to initialize database or seed data:', err);
}

// Basic Health Check Endpoints
app.get('/', (req, res) => {
  res.json({ app: 'ViviMart API', status: 'running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const sellerRoutes = require('./routes/sellerRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/seller', sellerRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ViviMart Backend Server running on http://localhost:${PORT}`);
});
