const db = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // Получение всех пользователей
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, search, role } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }
      if (role) where.role = role;

      const users = await db.User.findAll({
        where,
        limit: parseInt(limit),
        offset,
        attributes: { exclude: ['password'] }
      });

      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
  },

  // Блокировка пользователя
  async banUser(req, res) {
    try {
      const user = await db.User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      await user.update({ is_banned: true });

      // Отмена всех активных заказов
      await db.Order.update(
        { status: 'cancelled' },
        {
          where: {
            userId: user.id,
            status: { [Op.in]: ['pending', 'paid'] }
          }
        }
      );

      res.json({ message: 'Пользователь заблокирован' });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка блокировки пользователя' });
    }
  },

  // Статистика системы
  async getSystemStats(req, res) {
    try {
      const [users, products, orders] = await Promise.all([
        db.User.count(),
        db.Product.count(),
        db.Order.count({
          where: { status: 'completed' }
        })
      ]);

      res.json({
        users,
        products,
        orders,
        revenue: await db.Order.sum('total', {
          where: { status: 'completed' }
        })
      });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка получения статистики' });
    }
  }
};