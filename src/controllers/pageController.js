/**
 * pageController.js
 *
 * The endpoints that are not part of the JSON API:
 * the health check and the static frontend page.
 */

const path = require('node:path');

const publicDir = path.join(__dirname, '..', '..', 'public');
const startedAt = Date.now();

/**
 * GET /health
 * Kept simple on purpose so it is easy to check from a terminal,
 * a load balancer or a CI/CD pipeline.
 */
function health(req, res) {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    startedAt: new Date(startedAt).toISOString(),
    timestamp: new Date().toISOString(),
  });
}

/** GET / — serves the single page frontend from public/index.html */
function index(req, res) {
  res.sendFile(path.join(publicDir, 'index.html'));
}

module.exports = {
  health,
  index,
};
