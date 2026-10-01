/**
 * health.test.js
 *
 * The health check is the endpoint a CI/CD pipeline or a hosting platform
 * will hit first, so it deserves its own test.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { startTestServer } = require('./helpers/testServer');

const { request } = startTestServer();

describe('GET /health', () => {
  it('returns 200 and status "ok"', async () => {
    const { status, body } = await request('/health');

    assert.equal(status, 200);
    assert.equal(body.status, 'ok');
  });

  it('returns some useful extra fields', async () => {
    const { body } = await request('/health');

    assert.equal(typeof body.uptime, 'number');
    assert.ok(Date.parse(body.timestamp) > 0, 'timestamp should be a valid date');
  });
});
