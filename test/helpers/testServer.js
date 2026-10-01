/**
 * helpers/testServer.js
 *
 * Small helper used by every test file.
 *
 * It starts the real Express app on a random free port, gives back a
 * ready-to-use `request()` function built on the built-in fetch(), and
 * makes sure the server is closed again after the tests finish.
 */

const { after, before } = require('node:test');

const { createApp } = require('../../src/app');
const cartService = require('../../src/services/cartService');

let server;
let baseUrl;

/**
 * Starts the app and returns helpers:
 *   request(path, options) -> { status, body }
 *   resetCart()             -> empties the in-memory cart
 */
function startTestServer() {
  before(async () => {
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));

    // server.address().port is the port the OS picked for us.
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const text = await response.text();
    let body = null;

    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    return { status: response.status, body };
  }

  const json = (payload) => ({
    method: 'POST',
    body: JSON.stringify(payload),
  });

  /** Every test file starts with an empty cart. */
  function resetCart() {
    cartService.clearCart();
  }

  return { request, json, resetCart };
}

module.exports = { startTestServer };
