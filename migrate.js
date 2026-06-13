require('dotenv').config();
const sequelize = require('./config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    const queryInterface = sequelize.getQueryInterface();
    const tableDesc = await queryInterface.describeTable('users');

    // Add securityQuestion if missing
    if (!tableDesc.securityQuestion) {
      await queryInterface.addColumn('users', 'securityQuestion', {
        type: require('sequelize').DataTypes.STRING(255),
        allowNull: true,
        after: 'isActive'
      });
      console.log('✓ Added column: securityQuestion');
    } else {
      console.log('— Column already exists: securityQuestion');
    }

    // Add securityAnswer if missing
    if (!tableDesc.securityAnswer) {
      await queryInterface.addColumn('users', 'securityAnswer', {
        type: require('sequelize').DataTypes.STRING(255),
        allowNull: true,
        after: 'securityQuestion'
      });
      console.log('✓ Added column: securityAnswer');
    } else {
      console.log('— Column already exists: securityAnswer');
    }

    console.log('\n🎉 Migration complete! You can now login normally.');
    process.exit(0);
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
