const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notContains: ' '
      }
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
    role: {
      type: DataTypes.ENUM('user', 'seller', 'admin'),
      defaultValue: 'user'
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_banned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: 'default-avatar.jpg'
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    }
  }, {
    timestamps: true,
    paranoid: true, // Мягкое удаление
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    }
  });

  // Сравнение паролей
  User.prototype.comparePassword = function(candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
  };

  // Связи
  User.associate = (models) => {
    User.hasMany(models.Product, { foreignKey: 'sellerId' });
    User.hasMany(models.Order, { foreignKey: 'userId' });
    User.hasMany(models.Address, { foreignKey: 'userId' });
    User.hasMany(models.RefreshToken, { foreignKey: 'userId' });
  };

  return User;
};
