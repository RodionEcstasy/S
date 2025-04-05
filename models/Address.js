const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(50),
      defaultValue: 'Основной'
    },
    recipient: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    address_line: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Address.associate = (models) => {
    Address.belongsTo(models.User, { 
      foreignKey: 'userId' 
    });
  };

  // Хук перед сохранением
  Address.beforeSave(async (address) => {
    if (address.is_default) {
      await Address.update(
        { is_default: false },
        { where: { userId: address.userId } }
      );
    }
  });

  return Address;
};