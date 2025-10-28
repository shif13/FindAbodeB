// backend/middleware/authMiddleware.js
import { verifyToken } from '../config/firebase.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const result = await verifyToken(token);

    if (!result.valid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        error: result.error
      });
    }

    req.user = {
      uid: result.uid,
      email: result.email
    };

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: error.message
    });
  }
};