const { DataTypes } = require('sequelize');
const sequelize = require('../db');  // Import the sequelize instance

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  // Ensure usernames are unique
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Export the User model
module.exports = User;
