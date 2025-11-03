// backend/controllers/propertyController.js - COMPLETE VERSION
import Property from '../models/property.js';
import { sendPropertyVisitNotification } from '../utils/emailService.js'; 
import User from '../models/user.js';
import { Op } from 'sequelize';


const cleanPropertyData = (data) => {
  const cleaned = { ...data };
  
  // Fields that should be null if empty
  const optionalFields = [
    'latitude', 'longitude', 'videoUrl', 'ownerName', 
    'ownerPhone', 'ownerEmail', 'leaseDuration', 
    'pricePerSqft', 'depositAmount', 'maintenanceCharges',
    'availableFrom', 'floor', 'totalFloors', 'facing', 'ageOfProperty'
  ];
  
  optionalFields.forEach(field => {
    if (cleaned[field] === '' || cleaned[field] === undefined) {
      cleaned[field] = null;
    }
  });
  
  return cleaned;
};


// Get all properties with filters (PUBLIC)
export const getAllProperties = async (req, res) => {
  try {
    const { 
      city, 
      propertyType,
      listingType,
      minPrice, 
      maxPrice, 
      bedrooms, 
      search,
      page = 1,
      limit = 12 
    } = req.query;

    const filters = { 
      isActive: true,
      approvalStatus: 'approved' // Only show approved properties
    };

    if (city) filters.city = { [Op.like]: `%${city}%` };
    if (propertyType) filters.propertyType = propertyType;
    if (listingType) filters.listingType = listingType;

    // Price filter - check both sale price and rent
    if (minPrice || maxPrice) {
      if (listingType === 'rent') {
        filters.rentPerMonth = {};
        if (minPrice) filters.rentPerMonth[Op.gte] = parseFloat(minPrice);
        if (maxPrice) filters.rentPerMonth[Op.lte] = parseFloat(maxPrice);
      } else {
        filters.price = {};
        if (minPrice) filters.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) filters.price[Op.lte] = parseFloat(maxPrice);
      }
    }

    if (bedrooms) filters.bedrooms = parseInt(bedrooms);

    if (search) {
      filters[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Property.findAndCountAll({
      where: filters,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message
    });
  }
};

// Get single property by ID (PUBLIC)
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment view count
    await property.increment('views');

    if (property.views % 10 === 0) {
  const owner = await User.findOne({ where: { firebaseUid: property.userId } });
  if (owner) {
    await sendPropertyVisitNotification(property, owner);
  }
}

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: error.message
    });
  }
};

// Get user's properties (PROTECTED)
export const getUserProperties = async (req, res) => {
  try {
    const userId = req.user.uid;

    const properties = await Property.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user properties',
      error: error.message
    });
  }
};

// ============================================
// CREATE PROPERTY - UPDATED FOR 2 USER TYPES
// ============================================
export const createProperty = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get user from database
    const user = await User.findOne({ where: { firebaseUid: userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // CHECK IF USER IS A PROVIDER
    if (user.userType !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Only providers (owners, agents, builders) can post properties',
        userType: user.userType,
        hint: 'Please create a provider account to list properties'
      });
    }

    // CHECK PROVIDER APPROVAL STATUS
    if (user.providerType === 'owner') {
      // Owner can post immediately
    }
    else if (user.providerType === 'agent' || user.providerType === 'builder') {
      if (user.approvalStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval. You cannot post properties yet.',
          approvalStatus: user.approvalStatus,
          rejectionReason: user.rejectionReason
        });
      }
    }

    // DETERMINE PROPERTY APPROVAL STATUS
    let propertyApprovalStatus = 'approved'; // Default for owners

    // 🔥 CLEAN THE DATA BEFORE SAVING
    const cleanedData = cleanPropertyData(req.body);

    // CREATE PROPERTY
    const propertyData = {
      ...cleanedData,
      userId,
      approvalStatus: propertyApprovalStatus,
      postedByType: user.providerType // 'owner', 'agent', or 'builder'
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: propertyApprovalStatus === 'pending' 
        ? 'Property submitted for approval' 
        : 'Property created successfully',
      data: property,
      needsApproval: propertyApprovalStatus === 'pending'
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: error.message
    });
  }
};


// Update property (PROTECTED)
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user owns the property
    if (property.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this property'
      });
    }

    await property.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: error.message
    });
  }
};

// Delete property (PROTECTED)
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user owns the property
    if (property.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this property'
      });
    }

    await property.destroy();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: error.message
    });
  }
};

// Get featured properties (PUBLIC)
export const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { 
        isFeatured: true,
        isActive: true,
        approvalStatus: 'approved'
      },
      limit: 6,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured properties',
      error: error.message
    });
  }
};

// ============================================
// ADMIN ROUTES
// ============================================

// Get all properties for admin (including pending)
export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const { approvalStatus, page = 1, limit = 20 } = req.query;
    
    const filters = {};
    if (approvalStatus) filters.approvalStatus = approvalStatus;

    const offset = (page - 1) * limit;

    const { count, rows } = await Property.findAndCountAll({
      where: filters,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message
    });
  }
};

// Approve property (ADMIN)
export const approveProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.approvalStatus = 'approved';
    property.isActive = true;
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property approved successfully',
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve property',
      error: error.message
    });
  }
};

// Reject property (ADMIN)
export const rejectProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.approvalStatus = 'rejected';
    property.isActive = false;
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property rejected',
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject property',
      error: error.message
    });
  }
};


// Add this function
export const toggleFeaturedProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    property.isFeatured = !property.isFeatured;
    await property.save();

    res.status(200).json({
      success: true,
      message: `Property ${property.isFeatured ? 'marked as featured' : 'removed from featured'}`,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
      error: error.message
    });
  }
};