// backend/controllers/propertyController.js
import Property from '../models/property.js';
import { Op } from 'sequelize';

// Get all properties with filters
export const getAllProperties = async (req, res) => {
  try {
    const { 
      city, 
      propertyType, 
      type,
      minPrice, 
      maxPrice, 
      bedrooms, 
      search,
      page = 1,
      limit = 12 
    } = req.query;

    const filters = { status: 'available' };

    if (city) {
      filters.city = { [Op.like]: `%${city}%` };
    }

    if (propertyType) {
      filters.propertyType = propertyType;
    }

    if (type) {
      filters.type = type;
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) filters.price[Op.lte] = parseFloat(maxPrice);
    }

    if (bedrooms) {
      filters.bedrooms = parseInt(bedrooms);
    }

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

// Get single property by ID
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

// Get user's properties
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

// Create new property
export const createProperty = async (req, res) => {
  try {
    const userId = req.user.uid;
    const propertyData = {
      ...req.body,
      userId
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
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

// Update property
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

// Delete property
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

// Get featured properties
export const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { 
        featured: true,
        status: 'available'
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