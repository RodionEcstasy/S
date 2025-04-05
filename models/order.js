const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'paid',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
      ),
      defaultValue: 'pending'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    payment_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shipping_address: {
      type: DataTypes.JSON,
      allowNull: false
    },
    tracking_number: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { 
      foreignKey: 'userId' 
    });
    Order.hasMany(models.OrderItem, { 
      foreignKey: 'orderId' 
    });
    Order.hasMany(models.Payment, { 
      foreignKey: 'orderId' 
    });
  };

  return Order;
};