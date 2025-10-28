// backend/models/User.js - UPDATED TO 2 USER TYPES
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firebaseUid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Firebase Authentication UID'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // ============================================
  // SIMPLIFIED USER TYPE SYSTEM (2 TYPES)
  // ============================================
  userType: {
    type: DataTypes.ENUM('seeker', 'provider', 'admin'),
    allowNull: false,
    defaultValue: 'seeker',
    comment: 'Main user type: seeker (looking) or provider (listing)'
  },
  
  // Provider Subtype (only if userType = 'provider')
  providerType: {
    type: DataTypes.ENUM('owner', 'agent', 'builder'),
    allowNull: true,
    comment: 'Subtype for providers: owner, agent, or builder'
  },
  
  // ============================================
  // APPROVAL SYSTEM
  // ============================================
  // Logic:
  // - seeker: always 'approved'
  // - provider (owner): always 'approved'
  // - provider (agent/builder): starts 'pending'
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved',
    allowNull: false,
    comment: 'Approval status for agents and builders'
  },
  
  // ============================================
  // COMMON FIELDS
  // ============================================
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // ============================================
  // AGENT-SPECIFIC FIELDS
  // ============================================
  agencyName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'For agents: agency/company name'
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'For agents: license number'
  },
  reraNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'For agents/builders: RERA registration'
  },
  
  // ============================================
  // BUILDER-SPECIFIC FIELDS
  // ============================================
  companyName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'For builders: company name'
  },
  gstNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'For builders: GST number'
  },
  
  // ============================================
  // STATUS FIELDS
  // ============================================
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Verified badge for agents/builders'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Account active/deactivated'
  },
  
  // ============================================
  // ADMIN FIELDS
  // ============================================
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason if account was rejected'
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['firebaseUid'] },
    { fields: ['email'] },
    { fields: ['userType'] },
    { fields: ['providerType'] },
    { fields: ['approvalStatus'] }
  ]
});

// ============================================
// HELPER METHODS
// ============================================

// Check if user can post properties
User.prototype.canPostProperty = function() {
  if (this.userType !== 'provider') return false;
  
  // Owners can post immediately
  if (this.providerType === 'owner') return true;
  
  // Agents/Builders need approval
  if (this.providerType === 'agent' || this.providerType === 'builder') {
    return this.approvalStatus === 'approved';
  }
  
  return false;
};

// Check if user needs approval
User.prototype.needsApproval = function() {
  return this.userType === 'provider' && 
         (this.providerType === 'agent' || this.providerType === 'builder');
};

// Get user display type
User.prototype.getDisplayType = function() {
  if (this.userType === 'admin') return 'Admin';
  if (this.userType === 'seeker') return 'Seeker';
  
  if (this.userType === 'provider') {
    switch(this.providerType) {
      case 'owner': return 'Property Owner';
      case 'agent': return 'Real Estate Agent';
      case 'builder': return 'Builder/Developer';
      default: return 'Provider';
    }
  }
  
  return 'User';
};

export default User;