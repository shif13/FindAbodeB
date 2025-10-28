// backend/routes/propertyRoutes.js
import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  getUserProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties
} from '../controllers/propertyController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:id', getPropertyById);

// Protected routes (require authentication)
router.get('/user/my-properties', authenticate, getUserProperties);
router.post('/', authenticate, createProperty);
router.put('/:id', authenticate, updateProperty);
router.delete('/:id', authenticate, deleteProperty);

export default router;