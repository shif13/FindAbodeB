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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('buy', 'rent'),
    allowNull: false
  },
  propertyType: {
    type: DataTypes.ENUM('apartment', 'house', 'villa', 'land', 'commercial'),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
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
  bedrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  area: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Area in square feet'
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of image URLs'
  },
  amenities: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of amenities'
  },
  status: {
    type: DataTypes.ENUM('available', 'sold', 'rented'),
    defaultValue: 'available'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'properties'
});

export default Property;