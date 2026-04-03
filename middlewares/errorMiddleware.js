const logger = require('../config/logger');
const { AppError } = require('../utils/errors');

/**
 * Development error response - includes stack trace
 */
const sendErrorDev = (err, req, res) => {
  // API errors
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered page errors
  logger.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Hata oluştu!',
    msg: err.message,
    error: err,
  });
};

/**
 * Production error response - hides sensitive information
 */
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    // API errors
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Rendered page errors
    return res.status(err.statusCode).render('error', {
      title: 'Hata oluştu!',
      msg: err.message,
    });
  }

  // Programming or unknown error: don't leak details
  logger.error('ERROR 💥', err);

  // API errors
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      status: 'error',
      message: 'Bir şeyler yanlış gitti!',
    });
  }

  // Rendered page errors
  return res.status(500).render('error', {
    title: 'Hata oluştu!',
    msg: 'Lütfen daha sonra tekrar deneyin.',
  });
};

/**
 * Handle Mongoose CastError (invalid MongoDB ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Geçersiz ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key error
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'değer';
  const message = `Duplicate field value: ${value}. Bu değer zaten kullanılıyor!`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose validation error
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Geçersiz girdi verileri. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT invalid token error
 */
const handleJWTError = () =>
  new AppError('Geçersiz token. Lütfen tekrar giriş yapın!', 401);

/**
 * Handle JWT expired error
 */
const handleJWTExpiredError = () =>
  new AppError('Token süresi dolmuş. Lütfen tekrar giriş yapın!', 401);

/**
 * Global error handling middleware
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all errors
  if (err.statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user ? req.user._id : 'anonymous',
    });
  } else {
    logger.warn({
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      statusCode: err.statusCode,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
