// backend/routes/wishlistRoutes.js
import express from 'express';
import {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
} from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticate);

router.get('/', getUserWishlist);
router.post('/', addToWishlist);
router.delete('/:propertyId', removeFromWishlist);
router.get('/check/:propertyId', checkWishlist);

export default router;