const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Diocese = sequelize.define('Diocese', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'dioceses',
  timestamps: true
});

module.exports = Diocese;
