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

const router = express.Router();

// Public route - Create user after Firebase signup
router.post('/create', createUser);

// Protected routes - Require authentication
router.get('/profile/:uid', authenticate, getUserByUid);
router.put('/profile/:uid', authenticate, updateProfile);

// Admin routes - Require authentication (later add admin check)
router.get('/all', authenticate, getAllUsers);
router.patch('/:id/approve', authenticate, approveUser);
router.patch('/:id/reject', authenticate, rejectUser);
router.delete('/:id', authenticate, deleteUser);
router.patch('/:id/toggle-status', authenticate, toggleUserStatus);

export default router;