const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.put('/:storeId/products/:productId', storeController.updateStock);

router.get('/:storeId/products/:productId', storeController.getStock);

module.exports = router;