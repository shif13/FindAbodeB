// backend/routes/userRoutes.js
import express from 'express';
import {
  createUser,
  getUserByUid,
  updateProfile,
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
  toggleUserStatus
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/checkUserType.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTE
// ============================================
// Create user after Firebase signup (no auth required)
router.post('/create', createUser);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================
router.get('/profile/:uid', authenticate, getUserByUid);
router.put('/profile/:uid', authenticate, updateProfile);

// ============================================
// ADMIN ROUTES (Admin authentication required)
// ============================================
router.get('/all', authenticate, isAdmin, getAllUsers);
router.patch('/:id/approve', authenticate, isAdmin, approveUser);
router.patch('/:id/reject', authenticate, isAdmin, rejectUser);
router.delete('/:id', authenticate, isAdmin, deleteUser);
router.patch('/:id/toggle-status', authenticate, isAdmin, toggleUserStatus);

export default router;