const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

module.exports = {
    // Базовая проверка администратора
    isAdmin: async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({ 
                    error: 'Требуется авторизация администратора' 
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
            const admin = await Admin.findByPk(decoded.id);

            if (!admin) {
                throw new Error();
            }

            req.admin = admin;
            next();
        } catch (err) {
            res.status(403).json({ 
                error: 'Доступ запрещен. Недостаточно прав.' 
            });
        }
    },

    // Проверка на суперадминистратора
    isSuperAdmin: (req, res, next) => {
        if (!req.admin.is_superadmin) {
            return res.status(403).json({ 
                error: 'Требуются права суперадминистратора' 
            });
        }
        next();
    },

    // Логирование действий администратора
    logAdminAction: (actionType) => {
        return async (req, res, next) => {
            try {
                await AdminLog.create({
                    admin_id: req.admin.id,
                    action_type: actionType,
                    ip_address: req.ip,
                    user_agent: req.headers['user-agent'],
                    details: JSON.stringify({
                        params: req.params,
                        body: req.body
                    })
                });
                next();
            } catch (err) {
                console.error('Failed to log admin action:', err);
                next();
            }
        };
    },

    // Проверка IP в белом списке (опционально)
    checkWhitelist: (req, res, next) => {
        const whitelist = process.env.ADMIN_IP_WHITELIST?.split(',') || [];
        
        if (whitelist.length > 0 && !whitelist.includes(req.ip)) {
            return res.status(403).json({ 
                error: 'Доступ с вашего IP запрещен' 
            });
        }
        
        next();
    }
};