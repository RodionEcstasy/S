const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../utils/authMiddleware');
const upload = require('../utils/fileUpload');

router.get('/me', 
    authMiddleware.authenticate,
    userController.getProfile
);

router.put('/me',
    authMiddleware.authenticate,
    authMiddleware.checkCSRF,
    upload.single('avatar'),
    userController.updateProfile
);

router.delete('/me',
    authMiddleware.authenticate,
    authMiddleware.checkCSRF,
    userController.deleteAccount
);

router.get('/:id', 
    authMiddleware.authenticate,
    userController.getUserById
);

router.get('/:id/products',
    authMiddleware.authenticate,
    userController.getUserProducts
);

router.post('/address',
    authMiddleware.authenticate,
    authMiddleware.checkCSRF,
    userController.addAddress
);

module.exports = router;