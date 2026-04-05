const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 'Validation failed', 400, errors);
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `${field} already exists`, 409);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return sendError(res, `Invalid ID format`, 400);
  }

  // Zod validation errors (thrown manually)
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 'Validation failed', 400, errors);
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return sendError(res, message, statusCode);
};

module.exports = errorHandler;
