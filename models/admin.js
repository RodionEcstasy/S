const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        const salt = bcrypt.genSaltSync(10);
        this.setDataValue('password', bcrypt.hashSync(value, salt));
      }
    },
    is_superadmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: {
        users: true,
        products: true,
        orders: true,
        settings: false
      }
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password'] }
    }
  });

  Admin.prototype.comparePassword = function(candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
  };

  Admin.associate = (models) => {
    Admin.hasMany(models.AdminLog, { 
      foreignKey: 'adminId' 
    });
  };

  return Admin;
};