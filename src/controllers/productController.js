/**
 * productController.js
 *
 * Controllers only deal with HTTP: read the request, call a service,
 * send the response.
 */

const productService = require('../services/productService');

/** GET /api/products */
function list(req, res) {
  const { products, categories } = productService.listProducts();

  res.json({
    count: products.length,
    categories,
    products,
  });
}

/** GET /api/products/:id */
function getOne(req, res) {
  const product = productService.getProduct(req.params.id);

  res.json(product);
}

module.exports = {
  list,
  getOne,
};
