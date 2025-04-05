const jwt = require('jsonwebtoken');
const db = require('../models');
const EmailSender = require('../utils/emailSender');
const { generateCSRFToken } = require('../utils/security');

module.exports = {
  // Регистрация нового пользователя
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Проверка существующего пользователя
      const existingUser = await db.User.findOne({
        where: { [db.Sequelize.Op.or]: [{ username }, { email }] }
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'Пользователь с таким email или логином уже существует' 
        });
      }

      // Создание пользователя
      const user = await db.User.create({
        username,
        email,
        password,
        role: 'user'
      });

      // Генерация токена верификации
      const verifyToken = jwt.sign(
        { id: user.id, type: 'verify' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.EMAIL_VERIFY_EXPIRE + 'h' }
      );

      // Отправка письма
      await EmailSender.sendVerificationEmail(user, verifyToken);

      // Генерация токенов доступа
      const accessToken = generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user);

      // CSRF-токен для следующих запросов
      const csrfToken = generateCSRFToken();

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        tokens: {
          access: accessToken,
          refresh: refreshToken,
          csrf: csrfToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Ошибка регистрации' });
    }
  },

  // Вход в систему
  async login(req, res) {
    try {
      const { credential, password } = req.body;

      // Поиск пользователя по email или логину
      const user = await db.User.scope('withPassword').findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { email: credential },
            { username: credential }
          ]
        }
      });

      // Проверки
      if (!user) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
      }

      if (user.is_banned) {
        return res.status(403).json({ error: 'Аккаунт заблокирован' });
      }

      if (!user.comparePassword(password)) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
      }

      // Обновление времени последнего входа
      await user.update({ last_login: new Date() });

      // Генерация токенов
      const accessToken = generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user);
      const csrfToken = generateCSRFToken();

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified
        },
        tokens: {
          access: accessToken,
          refresh: refreshToken,
          csrf: csrfToken
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка входа' });
    }
  },

  // Выход из системы
  async logout(req, res) {
    try {
      // Удаление refresh-токена
      await db.RefreshToken.destroy({
        where: { userId: req.user.id, token: req.body.refreshToken }
      });
      
      res.json({ message: 'Успешный выход' });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка выхода' });
    }
  },

  // Обновление токена доступа
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      // Проверка токена в БД
      const token = await db.RefreshToken.findOne({
        where: { token: refreshToken },
        include: [db.User]
      });

      if (!token || token.user.is_banned) {
        return res.status(401).json({ error: 'Недействительный токен' });
      }

      // Проверка срока действия
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Генерация новых токенов
      const accessToken = generateAccessToken(token.user);
      const newRefreshToken = await generateRefreshToken(token.user);

      // Удаление старого токена
      await token.destroy();

      res.json({
        accessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      res.status(401).json({ error: 'Недействительный токен' });
    }
  }
};

// Вспомогательные функции
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      is_verified: user.is_verified
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

async function generateRefreshToken(user) {
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  await db.RefreshToken.create({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 
      parseInt(process.env.JWT_REFRESH_EXPIRES_IN) * 1000)
  });

  return token;
}