// backend/models/User.js
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
  
  // User Type & Status
  userType: {
    type: DataTypes.ENUM('buyer', 'tenant', 'owner', 'agent', 'builder', 'admin'),
    allowNull: false,
    defaultValue: 'buyer'
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'approved', // Buyer/Tenant/Owner auto-approved
    allowNull: false
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
  
  // Agent-Specific Fields
  agencyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reraNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Builder-Specific Fields
  companyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gstNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Status Fields
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Admin Fields
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

export default User;