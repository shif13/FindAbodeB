// backend/controllers/wishlistController.js - UPDATED
import Wishlist from '../models/wishlist.js';
import Property from '../models/property.js';
import { sendWishlistNotification } from '../utils/emailService.js';
import User from '../models/user.js';

// Get user's wishlist
export const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.uid;

    const wishlist = await Wishlist.findAll({
      where: { userId },
      include: [{
        model: Property,
        as: 'Property'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

// Add property to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { propertyId } = req.body;

    // Check if property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      where: { userId, propertyId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Property already in wishlist'
      });
    }

    // Create wishlist item
    const wishlistItem = await Wishlist.create({
      userId,
      propertyId
    });

    // ============================================
    // 🔥 UPDATE: Increment wishlist count
    // ============================================
    await property.increment('wishlistCount');
    
    // Update featured status after wishlist change
    await property.reload();
    await property.updateFeaturedStatus();

    // Send notification to owner
    const owner = await User.findOne({ where: { firebaseUid: property.userId } });
    const seeker = await User.findOne({ where: { firebaseUid: userId } });
    
    if (owner && seeker) {
      await sendWishlistNotification(property, owner, seeker);
    }

    res.status(201).json({
      success: true,
      message: 'Added to wishlist',
      data: wishlistItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: error.message
    });
  }
};

// Remove property from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { propertyId } = req.params;

    const wishlistItem = await Wishlist.findOne({
      where: { userId, propertyId }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    await wishlistItem.destroy();

    // ============================================
    // 🔥 UPDATE: Decrement wishlist count
    // ============================================
    const property = await Property.findByPk(propertyId);
    if (property && property.wishlistCount > 0) {
      await property.decrement('wishlistCount');
      await property.reload();
      await property.updateFeaturedStatus();
    }

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: error.message
    });
  }
};

// Check if property is in wishlist
export const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { propertyId } = req.params;

    const wishlistItem = await Wishlist.findOne({
      where: { userId, propertyId }
    });

    res.status(200).json({
      success: true,
      inWishlist: !!wishlistItem
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: error.message
    });
  }
};