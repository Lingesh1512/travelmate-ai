require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { testConnection } = require('./config/database');

// Routes
const authRoutes = require('./routes/auth.routes');
const destinationRoutes = require('./routes/destination.routes');
const tripRoutes = require('./routes/trip.routes');
const itineraryRoutes = require('./routes/itinerary.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const expenseRoutes = require('./routes/expense.routes');
const packingRoutes = require('./routes/packing.routes');
const budgetRoutes = require('./routes/budget.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const attractionRoutes = require('./routes/attraction.routes');
const plannerRoutes = require('./routes/planner.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ────────────────────────────────────────
// Security Middleware
// ────────────────────────────────────────
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ────────────────────────────────────────
// Core Middleware
// ────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ────────────────────────────────────────
// Health Check
// ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TravelMate AI Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ────────────────────────────────────────
// API Routes
// ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/planner', plannerRoutes);

// ────────────────────────────────────────
// 404 Handler
// ────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ────────────────────────────────────────
// Global Error Handler
// ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ────────────────────────────────────────
// Start Server
// ────────────────────────────────────────
const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 TravelMate AI Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
    console.log(`💊 Health: http://localhost:${PORT}/health`);
  });
};

startServer();
