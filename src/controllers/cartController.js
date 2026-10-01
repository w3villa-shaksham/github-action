/**
 * cartController.js
 *
 * Controllers only deal with HTTP: read the request, call a service,
 * send the response.
 */

const cartService = require('../services/cartService');
const productService = require('../services/productService');
const { badRequest } = require('../errors');

/** POST /api/cart — body: { "productId": 1, "quantity": 2 } */
function add(req, res) {
  const { productId, quantity } = req.body || {};

  if (productId === undefined || productId === null || productId === '') {
    throw badRequest('Missing "productId" in the request body.');
  }

  const cart = cartService.addItem(productId, quantity);

  res.status(201).json(cart);
}

/** GET /api/cart */
function get(req, res) {
  res.json(cartService.getCart());
}

/** DELETE /api/cart/:id — removes the whole line for that product */
function remove(req, res) {
  const cart = cartService.removeItem(productService.parseProductId(req.params.id));

  res.json(cart);
}

/** DELETE /api/cart — empties the cart */
function clear(req, res) {
  res.json(cartService.clearCart());
}

module.exports = {
  add,
  get,
  remove,
  clear,
};
