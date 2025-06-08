const { ApiError } = require('../utils/api-error');

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors
    });
  }

  res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'Internal Server Error',
    errors: err.message
  });
};

module.exports = { errorMiddleware };