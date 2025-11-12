// backend/models/User.js - FIXED INDEX ISSUE
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
    unique: true, // This creates the unique constraint
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
  
  // User Type System
  userType: {
    type: DataTypes.ENUM('seeker', 'provider', 'admin'),
    allowNull: false,
    defaultValue: 'seeker',
    comment: 'Main user type: seeker (looking) or provider (listing)'
  },
  
  providerType: {
    type: DataTypes.ENUM('owner', 'agent', 'builder'),
    allowNull: true,
    comment: 'Subtype for providers: owner, agent, or builder'
  },
  
  // Approval System
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved',
    allowNull: false,
    comment: 'Approval status for agents and builders'
  },
  
  // Common Fields
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
  
  // Agent-specific Fields
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
  
  // Builder-specific Fields
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
  
  // Status Fields
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
  
  // Admin Fields
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason if account was rejected'
  }
}, {
  tableName: 'users',
  timestamps: true,
  // ✅ FIXED: Explicitly define indexes to prevent duplicates
  indexes: [
    {
      name: 'idx_firebaseUid',
      unique: true,
      fields: ['firebaseUid']
    },
    {
      name: 'idx_email',
      unique: true,
      fields: ['email']
    },
    {
      name: 'idx_userType',
      fields: ['userType']
    },
    {
      name: 'idx_providerType',
      fields: ['providerType']
    },
    {
      name: 'idx_approvalStatus',
      fields: ['approvalStatus']
    }
  ]
});

// Helper Methods
User.prototype.canPostProperty = function() {
  if (this.userType !== 'provider') return false;
  if (this.providerType === 'owner') return true;
  if (this.providerType === 'agent' || this.providerType === 'builder') {
    return this.approvalStatus === 'approved';
  }
  return false;
};

User.prototype.needsApproval = function() {
  return this.userType === 'provider' && 
         (this.providerType === 'agent' || this.providerType === 'builder');
};

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