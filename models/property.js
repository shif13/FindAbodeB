// backend/models/property.js - COMPLETE VERSION
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Firebase UID of the owner'
  },
  
  // Basic Info
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  propertyType: {
    type: DataTypes.ENUM('apartment', 'villa', 'house', 'plot', 'commercial'),
    allowNull: false
  },
  listingType: {
    type: DataTypes.ENUM('sale', 'rent'),
    allowNull: false,
    comment: 'Property is for sale or rent (NOT both)'
  },
  
  // For SALE Properties
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Sale price (if listingType = sale)'
  },
  pricePerSqft: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  
  // For RENT Properties
  rentPerMonth: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monthly rent (if listingType = rent)'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  leaseDuration: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., "11 months", "1 year"'
  },
  maintenanceCharges: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  isFurnished: {
    type: DataTypes.ENUM('furnished', 'semi-furnished', 'unfurnished'),
    allowNull: true
  },
  availableFrom: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When property is available for rent'
  },
  
  // Property Details
  bedrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Area in square feet'
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., Ground, 1st, 2nd'
  },
  totalFloors: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  facing: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., North, South, East, West'
  },
  ageOfProperty: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., Under Construction, 1-5 years, 5-10 years'
  },
  
  // Location
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  
  // Media
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of image URLs from Cloudinary'
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Features
  amenities: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of amenities like parking, gym, pool'
  },
  
  // Ownership (if posted by Agent/Builder)
  postedByType: {
    type: DataTypes.ENUM('self', 'agent', 'builder'),
    defaultValue: 'self'
  },
  ownerName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Actual owner name (if posted by agent/builder)'
  },
  ownerPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ownerEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Status & Approval
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved',
    comment: 'Owner properties auto-approved, Agent/Builder need approval'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isSold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Stats
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  contacts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'properties',
  indexes: [
    { fields: ['userId'] },
    { fields: ['listingType'] },
    { fields: ['city'] },
    { fields: ['propertyType'] },
    { fields: ['approvalStatus'] }
  ]
});

export default Property;