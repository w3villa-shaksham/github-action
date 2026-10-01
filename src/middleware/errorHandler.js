/**
 * errorHandler.js
 *
 * The last piece of the middleware stack. Every error ends up here and is
 * turned into one consistent JSON body:
 *
 *   { "error": { "status": 404, "message": "..." } }
 *
 * In production we do not leak stack traces to the client, but we always
 * print them on the server so the logs stay useful.
 */

function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = status >= 500 ? 'Internal server error.' : err.message;

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({
    error: {
      status,
      message,
    },
  });
}

module.exports = errorHandler;
