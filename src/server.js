/**
 * server.js
 *
 * Starts the HTTP server. Everything interesting lives in app.js, this
 * file only boots the process and shuts it down cleanly.
 */

const { createApp } = require('./app');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const app = createApp();

const server = app.listen(PORT, HOST, () => {
  console.log(`Mini Mall is running in ${app.get('env')} mode`);
  console.log(`  Frontend : http://localhost:${PORT}`);
  console.log(`  API      : http://localhost:${PORT}/api/products`);
  console.log(`  Health   : http://localhost:${PORT}/health`);
});

// Ctrl+C should stop the process immediately and cleanly.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\nReceived ${signal}, shutting down...`);
    server.close(() => process.exit(0));
  });
}

// Log crashes instead of dying silently.
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

module.exports = server;
