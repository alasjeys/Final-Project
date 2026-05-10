// Global error handler – exactly 4 parameters required by Express
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Sequelize validation errors → 400
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.errors.map((e) => e.message),
    });
  }

  // Default 500 – never expose the stack to the client
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong. Please try again later.',
  });
};

module.exports = errorHandler;
