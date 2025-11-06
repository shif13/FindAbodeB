// backend/routes/propertyRoutes.js - UPDATED
import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  getUserProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getAllPropertiesAdmin,
  approveProperty,
  rejectProperty,
  toggleFeaturedProperty,
  recalculateAllFeaturedStatuses
} from '../controllers/propertyController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/checkUserType.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.get('/', getAllProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:id', getPropertyById);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================
router.get('/user/my-properties', authenticate, getUserProperties);
router.post('/', authenticate, createProperty);
router.put('/:id', authenticate, updateProperty);
router.delete('/:id', authenticate, deleteProperty);

// ============================================
// ADMIN ROUTES (Admin authentication required)
// ============================================
router.get('/admin/all', authenticate, isAdmin, getAllPropertiesAdmin);
router.patch('/admin/:id/approve', authenticate, isAdmin, approveProperty);
router.patch('/admin/:id/reject', authenticate, isAdmin, rejectProperty);
router.patch('/admin/:id/toggle-featured', authenticate, isAdmin, toggleFeaturedProperty);

// 🔥 NEW: Manual trigger for recalculating featured statuses
router.post('/admin/recalculate-featured', authenticate, isAdmin, recalculateAllFeaturedStatuses);

export default router;