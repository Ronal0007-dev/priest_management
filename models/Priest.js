const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Priest = sequelize.define('Priest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // Step 1: Personal Info
  fullName: { type: DataTypes.STRING(200), allowNull: false },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false },
  placeOfBirthCountry: { type: DataTypes.STRING(100), allowNull: false },
  placeOfBirthCity: { type: DataTypes.STRING(100), allowNull: false },
  maritalStatus: { type: DataTypes.ENUM('single', 'married', 'widowed', 'divorced'), allowNull: false },
  photo: { type: DataTypes.STRING(255) },

  // Step 2: Baptism Info
  dateOfBaptism: { type: DataTypes.DATEONLY },
  placeOfBaptism: { type: DataTypes.STRING(200) },
  baptizedBy: { type: DataTypes.STRING(200) },

  // Step 3: Confirmation Info
  dateOfConfirmation: { type: DataTypes.DATEONLY },
  placeOfConfirmation: { type: DataTypes.STRING(200) },
  confirmationBishop: { type: DataTypes.STRING(200) },

  // Step 4: Education Info
  primarySchool: { type: DataTypes.STRING(200) },
  secondarySchool: { type: DataTypes.STRING(200) },
  college: { type: DataTypes.STRING(200) },
  collegeSpecialization: { type: DataTypes.STRING(200) },
  university: { type: DataTypes.STRING(200) },
  universitySpecialization: { type: DataTypes.STRING(200) },

  // Step 5: Theology Info
  theologyLevel: { type: DataTypes.ENUM('Certificate', 'Diploma', 'Degree', 'Masters') },
  theologyInstitution: { type: DataTypes.STRING(200) },

  // Assignment
  dioceseId: { type: DataTypes.INTEGER, references: { model: 'dioceses', key: 'id' } },
  placeOfWork: { type: DataTypes.STRING(200) },
  dateAssigned: { type: DataTypes.DATEONLY },
  ordinationDate: { type: DataTypes.DATEONLY },
  priestStatus: { type: DataTypes.ENUM('active', 'retired', 'deceased', 'on_leave'), defaultValue: 'active' },

  // Form completion tracking
  formStep: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
  tableName: 'priests',
  timestamps: true
});

module.exports = Priest;
