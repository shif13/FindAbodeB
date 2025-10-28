import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Property from './property.js';

const Wishlist = sequelize.define('Wishlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Firebase UID'
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Property,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'wishlists',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'propertyId']
    }
  ]
});

// Define associations
Property.hasMany(Wishlist, { foreignKey: 'propertyId' });
Wishlist.belongsTo(Property, { foreignKey: 'propertyId' });

export default Wishlist;