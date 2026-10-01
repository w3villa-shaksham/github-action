/**
 * apiRoutes.js
 *
 * Everything under /api in one place, so the API surface is easy to see:
 *
 *   GET    /api/products
 *   GET    /api/products/:id
 *   POST   /api/cart
 *   GET    /api/cart
 *   DELETE /api/cart/:id
 */

const express = require('express');

const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/cart', cartRoutes);

module.exports = router;
