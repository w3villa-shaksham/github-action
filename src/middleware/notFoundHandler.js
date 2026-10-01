/**
 * notFoundHandler.js
 *
 * Runs when no route matched. Turns "unknown URL" into a clean 404
 * instead of Express' default HTML error page.
 */

function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      status: 404,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

module.exports = notFoundHandler;
