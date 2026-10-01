/**
 * products.test.js
 *
 * Tests for the product endpoints, including the error cases.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { startTestServer } = require('./helpers/testServer');
const catalogStore = require('../src/data/catalogStore');

const { request } = startTestServer();

describe('GET /api/products', () => {
  it('returns 200 with a list of products', async () => {
    const { status, body } = await request('/api/products');

    assert.equal(status, 200);
    assert.ok(Array.isArray(body.products), 'products should be an array');
    assert.ok(body.products.length > 0, 'there should be at least one product');
    assert.equal(body.count, body.products.length);
  });

  it('returns the same number of products as the data file', async () => {
    const { body } = await request('/api/products');
    const expected = catalogStore.getAllProducts().length;

    assert.equal(body.products.length, expected);
  });

  it('gives every product an id, name, price and category', async () => {
    const { body } = await request('/api/products');

    for (const product of body.products) {
      assert.equal(typeof product.id, 'number');
      assert.ok(product.name, 'product should have a name');
      assert.equal(typeof product.price, 'number');
      assert.ok(product.category, 'product should have a category');
      assert.ok(product.image, 'product should have an image placeholder');
    }
  });

  it('returns a list of categories', async () => {
    const { body } = await request('/api/products');

    assert.ok(Array.isArray(body.categories));
    assert.ok(body.categories.includes('Electronics'));
  });
});

describe('GET /products (short alias)', () => {
  it('works the same as /api/products', async () => {
    const { status, body } = await request('/products');

    assert.equal(status, 200);
    assert.ok(body.products.length > 0);
  });
});

describe('GET /api/products/:id', () => {
  it('returns a single product by id', async () => {
    const { status, body } = await request('/api/products/1');

    assert.equal(status, 200);
    assert.equal(body.id, 1);
    assert.ok(body.name);
    assert.equal(typeof body.price, 'number');
  });

  it('returns 404 for a product that does not exist', async () => {
    const { status, body } = await request('/api/products/9999');

    assert.equal(status, 404);
    assert.equal(body.error.status, 404);
    assert.match(body.error.message, /not found/i);
  });

  it('returns 400 for a non-numeric id', async () => {
    const { status, body } = await request('/api/products/abc');

    assert.equal(status, 400);
    assert.equal(body.error.status, 400);
    assert.match(body.error.message, /invalid product id/i);
  });

  it('returns 400 for a zero or negative id', async () => {
    const zero = await request('/api/products/0');
    const negative = await request('/api/products/-3');

    assert.equal(zero.status, 400);
    assert.equal(negative.status, 400);
  });
});

describe('unknown routes', () => {
  it('returns 404 with a JSON error body', async () => {
    const { status, body } = await request('/api/does-not-exist');

    assert.equal(status, 404);
    assert.equal(body.error.status, 404);
    assert.match(body.error.message, /route not found/i);
  });
});
