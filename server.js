// backend/server.js - UPDATED WITH CRON JOBS
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/db.js';

// ====================================
// IMPORT ROUTES
// ====================================
import propertyRoutes from './routes/propertyRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import userRoutes from './routes/userRoutes.js';

// ====================================
// 🔥 NEW: IMPORT CRON JOBS
// ====================================
import { startFeaturedPropertiesCron, runFeaturedRecalculationNow } from './services/cronJobs.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ====================================
// MIDDLEWARE
// ====================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests (for debugging)
app.use((req, res, next) => {
  console.log(`🔥 ${req.method} ${req.url}`);
  next();
});

// ====================================
// ROUTES
// ====================================
app.use('/api/properties', propertyRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);

// ====================================
// HEALTH CHECK
// ====================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ====================================
// ERROR HANDLING
// ====================================
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedUrl: req.url,
    method: req.method
  });
});

// ====================================
// DATABASE & SERVER START
// ====================================
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');

    // 🔥 NEW: Start cron jobs
    startFeaturedPropertiesCron();
    
    // Optional: Run featured recalculation on server start (for immediate effect)
    // Uncomment next line if you want to recalculate immediately on server start
    // await runFeaturedRecalculationNow();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`📍 API Base: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`\n📋 Available Routes:`);
      console.log(`   PROPERTIES:`);
      console.log(`   - GET    /api/properties (Get all properties)`);
      console.log(`   - GET    /api/properties/featured (Get featured)`);
      console.log(`   - GET    /api/properties/:id (Get single property)`);
      console.log(`   - POST   /api/properties (Create - Auth Required)`);
      console.log(`   - PUT    /api/properties/:id (Update - Auth Required)`);
      console.log(`   - DELETE /api/properties/:id (Delete - Auth Required)`);
      console.log(`\n   WISHLIST:`);
      console.log(`   - GET    /api/wishlist (Get user wishlist - Auth Required)`);
      console.log(`   - POST   /api/wishlist (Add to wishlist - Auth Required)`);
      console.log(`   - DELETE /api/wishlist/:propertyId (Remove - Auth Required)`);
      console.log(`\n   USERS:`);
      console.log(`   - POST   /api/users/create (Create user after signup)`);
      console.log(`   - GET    /api/users/profile/:uid (Get profile - Auth Required)`);
      console.log(`   - PUT    /api/users/profile/:uid (Update profile - Auth Required)`);
      console.log(`   - GET    /api/users/all (Get all users - Admin)`);
      console.log(`   - PATCH  /api/users/:id/approve (Approve user - Admin)`);
      console.log(`   - PATCH  /api/users/:id/reject (Reject user - Admin)`);
      console.log(`   - DELETE /api/users/:id (Delete user - Admin)`);
      console.log(`   - PATCH  /api/users/:id/toggle-status (Toggle status - Admin)`);
      console.log(`\n   ADMIN FEATURED:`);
      console.log(`   - PATCH  /api/properties/admin/:id/toggle-featured (Toggle featured - Admin)`);
      console.log(`   - POST   /api/properties/admin/recalculate-featured (Manual recalc - Admin)`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();