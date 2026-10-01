/**
 * productRoutes.js
 *
 * The same product routes are mounted twice:
 *   GET /products      and   GET /api/products
 *   GET /products/:id  and   GET /api/products/:id
 * The /api prefix is the "official" one, the shorter paths are a
 * convenience alias.
 */

const express = require('express');

const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.list);
router.get('/:id', productController.getOne);

module.exports = router;
