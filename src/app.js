/**
 * app.js
 *
 * Creates the Express application. It does NOT call listen() — that is done
 * in server.js — so tests can import this file and drive the app without
 * binding a port.
 */

const path = require('node:path');
const express = require('express');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

function createApp() {
  const app = express();

  // Settings
  app.set('env', process.env.NODE_ENV || 'development');
  app.disable('x-powered-by');

  // Parse JSON request bodies (needed for POST /api/cart)
  app.use(express.json());

  // Tiny request logger — handy while learning, easy to remove later.
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms.toFixed(1)}ms`);
    });
    next();
  });

  // Static frontend files (CSS, JS, images)
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Routes
  app.use(routes);

  // Error handling (order matters: 404 first, then the error handler)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
