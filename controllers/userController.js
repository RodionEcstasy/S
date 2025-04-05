const db = require('../models');
const { uploadToCloudinary } = require('../utils/fileUpload');

module.exports = {
  // Получение профиля
  async getProfile(req, res) {
    try {
      const user = await db.User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: db.Address,
            where: { is_default: true },
            required: false
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка получения профиля' });
    }
  },

  // Обновление профиля
  async updateProfile(req, res) {
    try {
      const updates = {};
      const allowedFields = ['username', 'email', 'phone'];

      // Фильтрация полей
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      // Обработка аватарки
      if (req.file) {
        const result = await uploadToCloudinary(req.file);
        updates.avatar = result.secure_url;
      }

      // Обновление данных
      await req.user.update(updates);

      res.json({
        message: 'Профиль обновлен',
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          avatar: req.user.avatar
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
  },

  // Добавление адреса
  async addAddress(req, res) {
    try {
      const address = await db.Address.create({
        ...req.body,
        userId: req.user.id
      });

      res.status(201).json(address);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка добавления адреса' });
    }
  }
};
