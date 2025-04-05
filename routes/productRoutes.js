const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../utils/authMiddleware');
const upload = require('../utils/fileUpload');

// Публичные маршруты
router.get('/', 
    productController.getAllProducts
);

router.get('/search', 
    productController.searchProducts
);

router.get('/:id', 
    productController.getProductById
);

router.get('/category/:category', 
    productController.getByCategory
);

// Защищенные маршруты
router.post('/',
    authMiddleware.authenticate,
    authMiddleware.checkVerifiedEmail,
    authMiddleware.checkCSRF,
    upload.array('images', 5),
    productController.createProduct
);

router.put('/:id',
    authMiddleware.authenticate,
    authMiddleware.checkCSRF,
    productController.updateProduct
);

router.delete('/:id',
    authMiddleware.authenticate,
    authMiddleware.checkCSRF,
    productController.deleteProduct
);

router.post('/:id/report',
    authMiddleware.authenticate,
    authMiddleware.checkCSRF,
    productController.reportProduct
);

module.exports = router;