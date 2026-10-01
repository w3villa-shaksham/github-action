/**
 * cartRoutes.js
 *
 *   POST   /api/cart      add a product to the cart
 *   GET    /api/cart      view the cart
 *   DELETE /api/cart/:id  remove one product from the cart
 *   DELETE /api/cart      empty the whole cart
 */

const express = require('express');

const cartController = require('../controllers/cartController');

const router = express.Router();

router.post('/', cartController.add);
router.get('/', cartController.get);
router.delete('/:id', cartController.remove);
router.delete('/', cartController.clear);

module.exports = router;
