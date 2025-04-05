const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    reviews_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['title']
      },
      {
        fields: ['category']
      },
      {
        fields: ['sellerId']
      }
    ]
  });

  Product.associate = (models) => {
    Product.belongsTo(models.User, { 
      as: 'seller',
      foreignKey: 'sellerId'
    });
    Product.hasMany(models.Review, { 
      foreignKey: 'productId' 
    });
    Product.hasMany(models.OrderItem, { 
      foreignKey: 'productId' 
    });
  };

  return Product;
};