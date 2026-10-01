/**
 * errors.js
 *
 * Small helper for throwing errors with an HTTP status code attached,
 * so route handlers can just throw and the error middleware replies with
 * the right status code.
 */

class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

function badRequest(message) {
  return new AppError(400, message);
}

function notFound(message) {
  return new AppError(404, message);
}

module.exports = {
  AppError,
  badRequest,
  notFound,
};
