/**
 * cartService.js
 *
 * Business rules for the cart. The cart itself is stored in cartStore.js
 * (in memory), this file turns those raw numbers into a nice object with
 * totals that the frontend and the API can use.
 */

const cartStore = require('../data/cartStore');
const productService = require('./productService');
const { badRequest } = require('../errors');

const MAX_QUANTITY_PER_ITEM = 99;

/** Keeps money maths free of floating point noise like 19.990000000000002. */
function roundPrice(value) {
  return Math.round(value * 100) / 100;
}

function parseQuantity(value) {
  const quantity = Number(value);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw badRequest(`Invalid quantity: "${value}". It must be a whole number of 1 or more.`);
  }

  if (quantity > MAX_QUANTITY_PER_ITEM) {
    throw badRequest(`Invalid quantity: the maximum is ${MAX_QUANTITY_PER_ITEM} per product.`);
  }

  return quantity;
}

/** Turns the raw store entries into full cart lines and calculates the total. */
function buildCart(rawItems) {
  const items = rawItems.map(({ productId, quantity }) => {
    const product = productService.getProduct(productId);

    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      quantity,
      lineTotal: roundPrice(product.price * quantity),
    };
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = roundPrice(items.reduce((sum, item) => sum + item.lineTotal, 0));

  return {
    items,
    totalItems,
    totalPrice,
    currency: productService.getMallInfo().currency,
  };
}

function getCart() {
  return buildCart(cartStore.list());
}

/**
 * Adds a product to the cart.
 * Throws a 400/404 error when the id or the quantity makes no sense.
 */
function addItem(productId, quantity = 1) {
  const product = productService.getProduct(productId);

  cartStore.add(product.id, parseQuantity(quantity === undefined ? 1 : quantity));

  return getCart();
}

/**
 * Removes a product from the cart.
 * Without a quantity the whole line is removed.
 */
function removeItem(productId, quantity) {
  const product = productService.getProduct(productId);

  if (quantity === undefined || quantity === null || quantity === '') {
    cartStore.remove(product.id);
    return getCart();
  }

  cartStore.decrease(product.id, parseQuantity(quantity));

  return getCart();
}

function clearCart() {
  cartStore.clear();
  return getCart();
}

module.exports = {
  MAX_QUANTITY_PER_ITEM,
  getCart,
  addItem,
  removeItem,
  clearCart,
};
