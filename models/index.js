const sequelize = require('../config/database');
const User = require('./User');
const Diocese = require('./Diocese');
const Priest = require('./Priest');

// Associations
Priest.belongsTo(Diocese, { foreignKey: 'dioceseId', as: 'diocese' });
Diocese.hasMany(Priest, { foreignKey: 'dioceseId', as: 'priests' });

module.exports = { sequelize, User, Diocese, Priest };
