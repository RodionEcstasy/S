const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../utils/authMiddleware');
const rateLimit = require('express-rate-limit');

// Ограничение попыток входа
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // 5 попыток
    message: { error: 'Слишком много попыток, попробуйте позже' }
});

router.post('/register', 
    authMiddleware.checkCSRF, 
    authController.register
);

router.post('/login', 
    loginLimiter,
    authController.login
);

router.post('/logout', 
    authMiddleware.authenticate,
    authController.logout
);

router.post('/refresh-token', 
    authController.refreshToken
);

router.post('/verify-email', 
    authController.verifyEmail
);

router.post('/forgot-password', 
    authController.forgotPassword
);

router.post('/reset-password', 
    authController.resetPassword
);

// Социальная авторизация
router.get('/auth/google', 
    authController.googleAuth
);

router.get('/auth/google/callback', 
    authController.googleAuthCallback
);

module.exports = router;