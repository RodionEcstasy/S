const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Review.associate = (models) => {
    Review.belongsTo(models.User, { 
      foreignKey: 'userId' 
    });
    Review.belongsTo(models.Product, { 
      foreignKey: 'productId' 
    });
  };

  // Хук после создания
  Review.afterCreate(async (review) => {
    const product = await review.getProduct();
    const reviews = await product.getReviews();
    
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;
    
    await product.update({
      rating: avgRating,
      reviews_count: reviews.length
    });
  });

  return Review;
};