const logger = require('../utils/logger');


const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error with structured metadata
  logger.error(message, {
    url: req.originalUrl,
    method: req.method,
    status,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });

  res.status(status).json({
    success: false,
    message, 
    error: {
      message,
      code: err.errorCode || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
