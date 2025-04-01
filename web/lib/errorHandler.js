/**
 * Global error handler for the application
 * 
 * This module provides utilities for consistent error handling across the application.
 */

// Error types
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  API: 'API_ERROR',
  DATABASE: 'DATABASE_ERROR',
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  INTERNAL: 'INTERNAL_ERROR'
};

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, type = ErrorTypes.INTERNAL, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
  
  /**
   * Convert error to JSON
   * 
   * @returns {Object} - JSON representation of the error
   */
  toJSON() {
    return {
      error: this.type,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * Create a validation error
 * 
 * @param {string} message - Error message
 * @param {Object} details - Validation error details
 * @returns {AppError} - Validation error
 */
export function createValidationError(message, details) {
  return new AppError(message, ErrorTypes.VALIDATION, 400, details);
}

/**
 * Create an authentication error
 * 
 * @param {string} message - Error message
 * @returns {AppError} - Authentication error
 */
export function createAuthenticationError(message = 'Authentication required') {
  return new AppError(message, ErrorTypes.AUTHENTICATION, 401);
}

/**
 * Create an authorization error
 * 
 * @param {string} message - Error message
 * @returns {AppError} - Authorization error
 */
export function createAuthorizationError(message = 'Permission denied') {
  return new AppError(message, ErrorTypes.AUTHORIZATION, 403);
}

/**
 * Create a not found error
 * 
 * @param {string} message - Error message
 * @param {string} resource - Resource that was not found
 * @returns {AppError} - Not found error
 */
export function createNotFoundError(message = 'Resource not found', resource = null) {
  return new AppError(message, ErrorTypes.NOT_FOUND, 404, { resource });
}

/**
 * Create an API error
 * 
 * @param {string} message - Error message
 * @param {Object} details - API error details
 * @returns {AppError} - API error
 */
export function createApiError(message, details = null) {
  return new AppError(message, ErrorTypes.API, 500, details);
}

/**
 * Create a database error
 * 
 * @param {string} message - Error message
 * @param {Object} details - Database error details
 * @returns {AppError} - Database error
 */
export function createDatabaseError(message, details = null) {
  return new AppError(message, ErrorTypes.DATABASE, 500, details);
}

/**
 * Create a network error
 * 
 * @param {string} message - Error message
 * @param {Object} details - Network error details
 * @returns {AppError} - Network error
 */
export function createNetworkError(message = 'Network error', details = null) {
  return new AppError(message, ErrorTypes.NETWORK, 500, details);
}

/**
 * Create a timeout error
 * 
 * @param {string} message - Error message
 * @param {Object} details - Timeout error details
 * @returns {AppError} - Timeout error
 */
export function createTimeoutError(message = 'Request timed out', details = null) {
  return new AppError(message, ErrorTypes.TIMEOUT, 408, details);
}

/**
 * Create a rate limit error
 * 
 * @param {string} message - Error message
 * @param {Object} details - Rate limit error details
 * @returns {AppError} - Rate limit error
 */
export function createRateLimitError(message = 'Rate limit exceeded', details = null) {
  return new AppError(message, ErrorTypes.RATE_LIMIT, 429, details);
}

/**
 * Create an internal error
 * 
 * @param {string} message - Error message
 * @param {Object} details - Internal error details
 * @returns {AppError} - Internal error
 */
export function createInternalError(message = 'Internal server error', details = null) {
  return new AppError(message, ErrorTypes.INTERNAL, 500, details);
}

/**
 * Handle API errors
 * 
 * @param {Error} error - The error to handle
 * @returns {Object} - Formatted error response
 */
export function handleApiError(error) {
  console.error('API Error:', error);
  
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: error.toJSON()
    };
  }
  
  // Handle Supabase errors
  if (error.code && error.message && error.details) {
    return {
      statusCode: error.code === 'PGRST116' ? 404 : 500,
      body: {
        error: ErrorTypes.DATABASE,
        message: error.message,
        statusCode: error.code === 'PGRST116' ? 404 : 500,
        details: error.details,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // Handle Alpaca API errors
  if (error.statusCode && error.message) {
    return {
      statusCode: error.statusCode,
      body: {
        error: ErrorTypes.API,
        message: error.message,
        statusCode: error.statusCode,
        details: null,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // Default to internal error
  return {
    statusCode: 500,
    body: {
      error: ErrorTypes.INTERNAL,
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
      details: null,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Log error to console and monitoring service
 * 
 * @param {Error} error - The error to log
 * @param {Object} context - Additional context for the error
 */
export function logError(error, context = {}) {
  // Log to console
  console.error('Error:', error);
  
  if (context && Object.keys(context).length > 0) {
    console.error('Error Context:', context);
  }
  
  // In production, we would send this to a monitoring service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement error reporting to monitoring service
    // Example: Sentry.captureException(error, { extra: context });
  }
}