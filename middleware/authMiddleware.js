// backend/middleware/authMiddleware.js - COMPLETE VERSION
import { verifyToken } from '../config/firebase.js';
import User from '../models/user.js';

// ============================================
// AUTHENTICATE - VERIFY FIREBASE TOKEN
// ============================================
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header must be: Bearer <token>'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify token with Firebase
    const result = await verifyToken(token);

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: result.error
      });
    }

    // Attach user info to request
    req.user = {
      uid: result.uid,
      email: result.email
    };

    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// ============================================
// CHECK IF USER IS A PROVIDER (Can post properties)
// ============================================
export const isProvider = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    
    const user = await User.findOne({ where: { firebaseUid } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    // Check if user is a provider
    if (user.userType !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only providers can post properties.',
        userType: user.userType
      });
    }

    // Check if provider is approved (for agents/builders)
    if (user.providerType === 'agent' || user.providerType === 'builder') {
      if (user.approvalStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval. You cannot post properties yet.',
          approvalStatus: user.approvalStatus,
          rejectionReason: user.rejectionReason
        });
      }
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Attach user data to request
    req.userData = user;
    next();

  } catch (error) {
    console.error('Provider check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify provider status',
      error: error.message
    });
  }
};

// ============================================
// CHECK IF USER IS ADMIN
// ============================================
export const isAdmin = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    
    const user = await User.findOne({ where: { firebaseUid } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.userData = user;
    next();

  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify admin status',
      error: error.message
    });
  }
};

// ============================================
// CHECK IF USER IS SEEKER (optional - for seeker-only features)
// ============================================
export const isSeeker = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    
    const user = await User.findOne({ where: { firebaseUid } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.userType !== 'seeker') {
      return res.status(403).json({
        success: false,
        message: 'This feature is only for seekers'
      });
    }

    req.userData = user;
    next();

  } catch (error) {
    console.error('Seeker check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify seeker status',
      error: error.message
    });
  }
};

// ============================================
// ATTACH USER DATA TO REQUEST (for any authenticated route)
// ============================================
export const attachUserData = async (req, res, next) => {
  try {
    const firebaseUid = req.user.uid;
    
    const user = await User.findOne({ where: { firebaseUid } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    req.userData = user;
    next();

  } catch (error) {
    console.error('Attach user data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
      error: error.message
    });
  }
};