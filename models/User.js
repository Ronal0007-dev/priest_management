const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  role: { type: DataTypes.ENUM('admin', 'viewer'), defaultValue: 'admin' },
  fullName: { type: DataTypes.STRING(150) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  securityQuestion: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
  securityAnswer:   { type: DataTypes.STRING(255), allowNull: true, defaultValue: null }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) user.password = await bcrypt.hash(user.password, 10);
      if (user.securityAnswer) user.securityAnswer = await bcrypt.hash(user.securityAnswer.toLowerCase().trim(), 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
      if (user.changed('securityAnswer') && user.securityAnswer) {
        user.securityAnswer = await bcrypt.hash(user.securityAnswer.toLowerCase().trim(), 10);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.validateSecurityAnswer = async function(answer) {
  if (!this.securityAnswer) return false;
  return bcrypt.compare(answer.toLowerCase().trim(), this.securityAnswer);
};

module.exports = User;
