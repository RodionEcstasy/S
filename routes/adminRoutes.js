const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../utils/adminMiddleware');
const upload = require('../utils/fileUpload');

// Все маршруты требуют админских прав
router.use(adminMiddleware.isAdmin);
router.use(adminMiddleware.checkWhitelist);

// Управление пользователями
router.get('/users',
    adminController.getAllUsers
);

router.get('/users/:id',
    adminController.getUserDetails
);

router.put('/users/:id',
    adminMiddleware.logAdminAction('UPDATE_USER'),
    adminController.updateUser
);

router.post('/users/:id/ban',
    adminMiddleware.logAdminAction('BAN_USER'),
    adminController.banUser
);

router.delete('/users/:id',
    adminMiddleware.isSuperAdmin,
    adminMiddleware.logAdminAction('DELETE_USER'),
    adminController.deleteUser
);

// Управление товарами
router.get('/products',
    adminController.getAllProducts
);

router.post('/products/:id/block',
    adminMiddleware.logAdminAction('BLOCK_PRODUCT'),
    adminController.blockProduct
);

router.delete('/products/:id',
    adminMiddleware.logAdminAction('DELETE_PRODUCT'),
    adminController.deleteProduct
);

// Управление заказами
router.get('/orders',
    adminController.getAllOrders
);

router.put('/orders/:id/status',
    adminMiddleware.logAdminAction('UPDATE_ORDER_STATUS'),
    adminController.updateOrderStatus
);

router.post('/orders/:id/refund',
    adminMiddleware.logAdminAction('PROCESS_REFUND'),
    adminController.processRefund
);

// Системные настройки
router.get('/stats',
    adminMiddleware.isSuperAdmin,
    adminController.getSystemStats
);

router.put('/settings',
    adminMiddleware.isSuperAdmin,
    adminMiddleware.logAdminAction('UPDATE_SETTINGS'),
    upload.single('logo'),
    adminController.updateSettings
);

module.exports = router;
