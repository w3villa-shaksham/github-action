/**
 * cartStore.js
 *
 * A very small in-memory cart store. It is a plain Map of
 * `productId -> quantity`.
 *
 * NOTE: because it lives in memory, the cart is reset whenever the server
 * restarts. That is fine for a practice project and keeps things simple.
 */

const items = new Map();

/** Increases the quantity of a product by `quantity`. */
function add(productId, quantity) {
  items.set(productId, (items.get(productId) || 0) + quantity);
}

/**
 * Decreases the quantity of a product by `quantity`.
 * When the quantity reaches zero the line is removed completely.
 */
function decrease(productId, quantity) {
  const nextQuantity = (items.get(productId) || 0) - quantity;

  if (nextQuantity > 0) {
    items.set(productId, nextQuantity);
  } else {
    items.delete(productId);
  }
}

function remove(productId) {
  return items.delete(productId);
}

function list() {
  return [...items.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

function clear() {
  items.clear();
}

module.exports = {
  add,
  decrease,
  remove,
  list,
  clear,
};
