// backend/models/Contact.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Property from './property.js';

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Property,
      key: 'id'
    },
    comment: 'Which property was inquired about'
  },
  buyerId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Firebase UID of the person who contacted'
  },
  sellerId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Firebase UID of the property owner'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Inquiry message from buyer'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Buyer contact phone'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Buyer contact email'
  },
  status: {
    type: DataTypes.ENUM('new', 'responded', 'closed'),
    defaultValue: 'new',
    comment: 'Inquiry status'
  }
}, {
  timestamps: true,
  tableName: 'contacts',
  indexes: [
    { fields: ['propertyId'] },
    { fields: ['buyerId'] },
    { fields: ['sellerId'] },
    { fields: ['status'] }
  ]
});

// Define associations
Property.hasMany(Contact, { foreignKey: 'propertyId', as: 'inquiries' });
Contact.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

export default Contact;