const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
    // Стандартная проверка JWT
    authenticate: async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({ 
                    error: 'Требуется авторизация' 
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);

            if (!user || user.is_banned) {
                throw new Error();
            }

            req.user = user;
            req.token = token;
            next();
        } catch (err) {
            res.status(401).json({ 
                error: 'Недействительный или просроченный токен' 
            });
        }
    },

    // Проверка email (для маршрутов, требующих подтвержденный email)
    checkVerifiedEmail: (req, res, next) => {
        if (!req.user.is_verified) {
            return res.status(403).json({ 
                error: 'Требуется подтвержденный email' 
            });
        }
        next();
    },

    // Проверка CSRF токена (для форм)
    checkCSRF: (req, res, next) => {
        const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
        
        if (!csrfToken || csrfToken !== req.session.csrfToken) {
            return res.status(403).json({ 
                error: 'Недействительный CSRF токен' 
            });
        }
        
        next();
    }
};