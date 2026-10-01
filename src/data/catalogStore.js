/**
 * catalogStore.js
 *
 * The "database" of this project: a small JSON file that is loaded once at
 * startup. It only knows how to read data, it does not contain any business
 * rules (that is what services/ is for).
 */

const fs = require('node:fs');
const path = require('node:path');

const dataFile = path.join(__dirname, 'products.json');

// Read the file once when the app boots. `raw` keeps the data on disk,
// `db` is the version we hand out to the rest of the app.
const raw = fs.readFileSync(dataFile, 'utf8');
const db = JSON.parse(raw);

function getMallInfo() {
  return {
    name: db.mallName,
    currency: db.currency,
  };
}

function getAllProducts() {
  return db.products;
}

function findProductById(id) {
  const productId = Number(id);
  return db.products.find((product) => product.id === productId) || null;
}

module.exports = {
  getMallInfo,
  getAllProducts,
  findProductById,
};
