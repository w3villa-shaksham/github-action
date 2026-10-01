/**
 * index.js
 *
 * Wires all routes together. See app.js for how the middleware stack
 * around them is set up.
 */

const express = require('express');

const apiRoutes = require('./apiRoutes');
const productRoutes = require('./productRoutes');
const pageController = require('../controllers/pageController');

const router = express.Router();

// Health check (also used as a container / CI smoke test)
router.get('/health', pageController.health);

// JSON API
router.use('/api', apiRoutes);

// Shorter alias for the product endpoints
router.use('/products', productRoutes);

// Frontend
router.get('/', pageController.index);

module.exports = router;
