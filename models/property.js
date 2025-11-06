// backend/models/property.js - UPDATED WITH FEATURED SYSTEM
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
  
  // Posted By
  postedByType: {
    type: DataTypes.ENUM('owner', 'agent', 'builder'),
    defaultValue: 'owner',
    comment: 'Who posted this property - matches user.providerType'
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
  
  // ============================================
  // 🔥 NEW: HYBRID FEATURED SYSTEM
  // ============================================
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Manually featured by admin (highest priority)'
  },
  isAutoFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Auto-qualified for featuring based on criteria'
  },
  featuredScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Score for sorting auto-featured properties'
  },
  featuredUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Manual featured expiry date (optional)'
  },
  
  // Stats (for featured calculation)
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wishlistCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of times added to wishlist'
  },
  contacts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Premium (for future monetization)
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Premium listing (always auto-featured)'
  }
}, {
  timestamps: true,
  tableName: 'properties',
  indexes: [
    { fields: ['userId'] },
    { fields: ['listingType'] },
    { fields: ['city'] },
    { fields: ['propertyType'] },
    { fields: ['approvalStatus'] },
    { fields: ['isFeatured'] },
    { fields: ['isAutoFeatured'] },
    { fields: ['featuredScore'] }
  ]
});

// ============================================
// INSTANCE METHODS
// ============================================

// Calculate featured score
Property.prototype.calculateFeaturedScore = function() {
  const daysOld = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  const imageCount = Array.isArray(this.images) ? this.images.length : 0;
  const amenityCount = Array.isArray(this.amenities) ? this.amenities.length : 0;
  const hasVideo = !!this.videoUrl;
  const descLength = this.description ? this.description.length : 0;
  
  let score = 0;
  
  // View score (1 point per view)
  score += this.views * 1;
  
  // Wishlist score (5 points per wishlist)
  score += this.wishlistCount * 5;
  
  // Contact score (3 points per contact)
  score += this.contacts * 3;
  
  // Media quality
  score += hasVideo ? 15 : 0;
  score += imageCount >= 5 ? 10 : imageCount * 2;
  
  // Content quality
  score += amenityCount * 2;
  score += descLength >= 200 ? 10 : descLength >= 100 ? 5 : 0;
  
  // Recency bonus
  if (daysOld < 7) score += 25;
  else if (daysOld < 14) score += 15;
  else if (daysOld < 30) score += 10;
  
  // Premium bonus
  if (this.isPremium) score += 50;
  
  return score;
};

// Check if property qualifies for auto-featuring
Property.prototype.qualifiesForAutoFeatured = function() {
  const daysOld = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  const imageCount = Array.isArray(this.images) ? this.images.length : 0;
  const amenityCount = Array.isArray(this.amenities) ? this.amenities.length : 0;
  const descLength = this.description ? this.description.length : 0;
  
  // Must be approved and active
  if (this.approvalStatus !== 'approved' || !this.isActive || this.isSold) {
    return false;
  }
  
  // Premium properties always qualify
  if (this.isPremium) return true;
  
  // Check all criteria
  const meetsAgeCriteria = daysOld <= 30;
  const meetsImageCriteria = imageCount >= 5;
  const meetsEngagementCriteria = this.views >= 50 || this.wishlistCount >= 5;
  const meetsContentCriteria = descLength >= 100 && amenityCount >= 3;
  
  return meetsAgeCriteria && meetsImageCriteria && meetsEngagementCriteria && meetsContentCriteria;
};

// Update featured status
Property.prototype.updateFeaturedStatus = async function() {
  const qualifies = this.qualifiesForAutoFeatured();
  const score = this.calculateFeaturedScore();
  
  this.isAutoFeatured = qualifies;
  this.featuredScore = score;
  
  await this.save();
  return { qualifies, score };
};

export default Property;