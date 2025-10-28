// backend/middleware/checkUserType.js
import User from '../models/user.js';

// Middleware to check if user has required userType
export const checkUserType = (allowedTypes) => {
  return async (req, res, next) => {
    try {
      const firebaseUid = req.user.uid;
      
      // Find user in database
      const user = await User.findOne({ where: { firebaseUid } });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found in database'
        });
      }

      // Check if user type is allowed
      if (!allowedTypes.includes(user.userType)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Only ${allowedTypes.join(', ')} can access this resource.`
        });
      }

      // Check if user is approved (for agent/builder)
      if (user.approvalStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval',
          approvalStatus: user.approvalStatus,
          rejectionReason: user.rejectionReason
        });
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
      console.error('Check user type error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify user permissions',
        error: error.message
      });
    }
  };
};

// Middleware to check if user is admin
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