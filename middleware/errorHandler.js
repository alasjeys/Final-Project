const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.errors.map((e) => e.message),
    });
  }

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong. Please try again later.',
  });
};

module.exports = errorHandler;
