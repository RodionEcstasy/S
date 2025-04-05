require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Sequelize } = require('sequelize');
const path = require('path');

// Инициализация Express
const app = express();
const PORT = process.env.APP_PORT || 3000;

// ======================================
// Базовые middleware
// ======================================
app.use(helmet()); // Защита заголовков
app.use(cors({
  origin: process.env.APP_URL,
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Лимитер запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: process.env.RATE_LIMIT || 100,
  message: { error: 'Слишком много запросов' }
});
app.use('/api/', limiter);

// ======================================
// Подключение к БД
// ======================================
const sequelize = new Sequelize({
  dialect: process.env.DB_CONNECTION,
  storage: process.env.SQLITE_PATH, // Только для SQLite
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  logging: process.env.APP_DEBUG ? console.log : false,
  define: {
    timestamps: true,
    paranoid: true // Мягкое удаление
  }
});

// Проверка подключения
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к БД успешно');
    await sequelize.sync({ alter: process.env.APP_DEBUG }); // Авто-миграции в разработке
  } catch (error) {
    console.error('❌ Ошибка подключения к БД:', error);
  }
})();

// ======================================
// Роуты API
// ======================================
const apiRouter = express.Router();

// Подключение маршрутов
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/products', require('./routes/productRoutes'));
apiRouter.use('/orders', require('./routes/orderRoutes'));
apiRouter.use('/admin', require('./routes/adminRoutes'));

app.use('/api', apiRouter);

// ======================================
// Статические файлы (фронтенд)
// ======================================
app.use(express.static(path.join(__dirname, 'public')));

// Fallback для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ======================================
// Обработка ошибок
// ======================================
app.use((err, req, res, next) => {
  console.error('🛑 Ошибка:', err.stack);
  
  const status = err.status || 500;
  const message = process.env.APP_DEBUG 
    ? err.message 
    : 'Произошла ошибка сервера';

  res.status(status).json({ 
    error: message,
    ...(process.env.APP_DEBUG && { stack: err.stack })
  });
});

// ======================================
// Запуск сервера
// ======================================
app.listen(PORT, () => {
  console.log(`
  🚀 Сервер запущен на ${process.env.APP_URL}
  ⚙️  Режим: ${process.env.APP_ENV}
  📅 ${new Date().toLocaleString()}
  `);
});

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Необработанное исключение:', err);
});