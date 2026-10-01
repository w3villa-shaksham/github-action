/**
 * cart.test.js
 *
 * Tests for add / view / remove plus the total price calculation.
 * Every test starts with an empty cart.
 */

const { beforeEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { startTestServer } = require('./helpers/testServer');

const { request, json, resetCart } = startTestServer();

beforeEach(() => {
  resetCart();
});

describe('GET /api/cart', () => {
  it('starts out empty', async () => {
    const { status, body } = await request('/api/cart');

    assert.equal(status, 200);
    assert.deepEqual(body.items, []);
    assert.equal(body.totalItems, 0);
    assert.equal(body.totalPrice, 0);
  });
});

describe('POST /api/cart', () => {
  it('adds a product and returns the cart with 201', async () => {
    const { status, body } = await request('/api/cart', json({ productId: 1, quantity: 2 }));

    assert.equal(status, 201);
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].productId, 1);
    assert.equal(body.items[0].quantity, 2);
    assert.equal(body.totalItems, 2);
  });

  it('defaults the quantity to 1', async () => {
    const { body } = await request('/api/cart', json({ productId: 1 }));

    assert.equal(body.items[0].quantity, 1);
  });

  it('calculates the total price', async () => {
    const { body: first } = await request('/api/cart', json({ productId: 1, quantity: 2 }));
    const { body: second } = await request('/api/cart', json({ productId: 6, quantity: 1 }));

    // product 1 = 19.99, product 6 = 129.99
    assert.equal(first.totalPrice, 39.98);
    assert.equal(second.totalPrice, 169.97);
    assert.equal(second.items.length, 2);
  });

  it('adds up quantities when the same product is added twice', async () => {
    await request('/api/cart', json({ productId: 3, quantity: 1 }));
    const { body } = await request('/api/cart', json({ productId: 3, quantity: 2 }));

    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].quantity, 3);
    assert.equal(body.totalItems, 3);
  });

  it('returns 400 when productId is missing', async () => {
    const { status, body } = await request('/api/cart', json({ quantity: 1 }));

    assert.equal(status, 400);
    assert.match(body.error.message, /productId/i);
  });

  it('returns 400 for an invalid quantity', async () => {
    const { status, body } = await request('/api/cart', json({ productId: 1, quantity: 0 }));

    assert.equal(status, 400);
    assert.match(body.error.message, /quantity/i);
  });

  it('returns 404 for a product that does not exist', async () => {
    const { status } = await request('/api/cart', json({ productId: 9999 }));

    assert.equal(status, 404);
  });
});

describe('DELETE /api/cart/:id', () => {
  it('removes a product from the cart', async () => {
    await request('/api/cart', json({ productId: 1, quantity: 1 }));
    await request('/api/cart', json({ productId: 2, quantity: 1 }));

    const { status, body } = await request('/api/cart/1', { method: 'DELETE' });

    assert.equal(status, 200);
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].productId, 2);
    assert.equal(body.totalPrice, body.items[0].lineTotal);
  });

  it('can empty the cart by removing every product', async () => {
    await request('/api/cart', json({ productId: 1 }));
    await request('/api/cart', json({ productId: 2 }));

    await request('/api/cart/1', { method: 'DELETE' });
    const { body } = await request('/api/cart/2', { method: 'DELETE' });

    assert.deepEqual(body.items, []);
    assert.equal(body.totalPrice, 0);
  });

  it('returns 404 when removing a product that does not exist', async () => {
    const { status } = await request('/api/cart/9999', { method: 'DELETE' });

    assert.equal(status, 404);
  });

  it('returns 400 for an invalid id', async () => {
    const { status } = await request('/api/cart/not-a-number', { method: 'DELETE' });

    assert.equal(status, 400);
  });
});

describe('DELETE /api/cart', () => {
  it('empties the whole cart', async () => {
    await request('/api/cart', json({ productId: 1, quantity: 3 }));
    const { status, body } = await request('/api/cart', { method: 'DELETE' });

    assert.equal(status, 200);
    assert.deepEqual(body.items, []);
    assert.equal(body.totalItems, 0);
  });
});
