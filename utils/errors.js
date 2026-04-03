/**
 * Base application error class
 * All custom errors should extend this class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Validation errors
 */
class ValidationError extends AppError {
  constructor(message = 'Doğrulama hatası') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * 401 Unauthorized - Authentication errors
 */
class AuthenticationError extends AppError {
  constructor(message = 'Kimlik doğrulama başarısız') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * 403 Forbidden - Authorization errors
 */
class AuthorizationError extends AppError {
  constructor(message = 'Bu işlem için yetkiniz yok') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * 404 Not Found - Resource not found
 */
class NotFoundError extends AppError {
  constructor(message = 'Kaynak bulunamadı') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 Conflict - Resource conflicts
 */
class ConflictError extends AppError {
  constructor(message = 'Kaynak çakışması') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * 500 Internal Server Error - Database errors
 */
class DatabaseError extends AppError {
  constructor(message = 'Veritabanı hatası', originalError = null) {
    super(message, 500);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

/**
 * 503 Service Unavailable - External service errors
 */
class ExternalServiceError extends AppError {
  constructor(message = 'Harici servis hatası', service = 'unknown') {
    super(message, 503);
    this.name = 'ExternalServiceError';
    this.service = service;
  }
}

/**
 * 429 Too Many Requests - Rate limiting
 */
class RateLimitError extends AppError {
  constructor(message = 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError,
};
