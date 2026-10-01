/**
 * productService.js
 *
 * All business rules about products live here.
 * The store only reads/writes data, the service decides what is valid.
 */

const catalogStore = require('../data/catalogStore');
const { badRequest, notFound } = require('../errors');

/**
 * Turns a value from a URL or request body into a positive integer id.
 * Throws a 400 error when the value cannot be used as a product id.
 */
function parseProductId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id < 1) {
    throw badRequest(`Invalid product id: "${value}". It must be a positive number.`);
  }

  return id;
}

function getMallInfo() {
  return catalogStore.getMallInfo();
}

function listProducts() {
  const products = catalogStore.getAllProducts();
  const categories = [...new Set(products.map((product) => product.category))].sort();

  return { products, categories };
}

function getProduct(value) {
  const id = parseProductId(value);
  const product = catalogStore.findProductById(id);

  if (!product) {
    throw notFound(`Product with id ${id} was not found.`);
  }

  return product;
}

module.exports = {
  parseProductId,
  getMallInfo,
  listProducts,
  getProduct,
};
