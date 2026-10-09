const { error } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  error(res, 404, `Route not found: ${req.originalUrl}`);
};

const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Invalid MongoDB ObjectId format
  if (err.name === 'CastError') {
    return error(res, 400, 'Invalid ID format');
  }

  error(res, err.statusCode || 500, err.message || 'Something went wrong');
};

module.exports = { notFound, globalErrorHandler };
