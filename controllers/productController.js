const db = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // Получение всех товаров
  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 20, category, sort } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (category) where.category = category;

      const order = [];
      if (sort === 'price_asc') order.push(['price', 'ASC']);
      if (sort === 'price_desc') order.push(['price', 'DESC']);
      if (sort === 'popular') order.push(['rating', 'DESC']);

      const products = await db.Product.findAll({
        where,
        limit: parseInt(limit),
        offset,
        order,
        include: [
          {
            model: db.User,
            as: 'seller',
            attributes: ['id', 'username', 'avatar']
          }
        ]
      });

      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка получения товаров' });
    }
  },

  // Создание товара
  async createProduct(req, res) {
    try {
      const images = req.files.map(file => file.path);

      const product = await db.Product.create({
        ...req.body,
        sellerId: req.user.id,
        images
      });

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка создания товара' });
    }
  },

  // Жалоба на товар
  async reportProduct(req, res) {
    try {
      await db.ProductReport.create({
        productId: req.params.id,
        userId: req.user.id,
        reason: req.body.reason
      });

      // Проверка количества жалоб
      const reportsCount = await db.ProductReport.count({
        where: { productId: req.params.id }
      });

      // Автоматическая блокировка при 5+ жалобах
      if (reportsCount >= 5) {
        await db.Product.update(
          { is_blocked: true },
          { where: { id: req.params.id } }
        );
      }

      res.json({ message: 'Жалоба отправлена' });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка отправки жалобы' });
    }
  }
};