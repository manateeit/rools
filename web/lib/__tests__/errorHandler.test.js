import {
  AppError,
  ErrorTypes,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createApiError,
  createDatabaseError,
  createNetworkError,
  createTimeoutError,
  createRateLimitError,
  createInternalError,
  handleApiError,
  logError
} from '../errorHandler';

// Mock console.error to prevent test output clutter
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorHandler', () => {
  describe('AppError', () => {
    it('should create an AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('AppError');
      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorTypes.INTERNAL);
      expect(error.statusCode).toBe(500);
      expect(error.details).toBeNull();
      expect(error.timestamp).toBeDefined();
    });
    
    it('should create an AppError with custom values', () => {
      const details = { field: 'username', issue: 'required' };
      const error = new AppError('Validation error', ErrorTypes.VALIDATION, 400, details);
      
      expect(error.message).toBe('Validation error');
      expect(error.type).toBe(ErrorTypes.VALIDATION);
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
    });
    
    it('should convert to JSON correctly', () => {
      const details = { field: 'username', issue: 'required' };
      const error = new AppError('Validation error', ErrorTypes.VALIDATION, 400, details);
      const json = error.toJSON();
      
      expect(json).toEqual({
        error: ErrorTypes.VALIDATION,
        message: 'Validation error',
        statusCode: 400,
        details,
        timestamp: error.timestamp
      });
    });
  });
  
  describe('Error factory functions', () => {
    it('should create a validation error', () => {
      const details = { field: 'username', issue: 'required' };
      const error = createValidationError('Invalid input', details);
      
      expect(error.type).toBe(ErrorTypes.VALIDATION);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual(details);
    });
    
    it('should create an authentication error', () => {
      const error = createAuthenticationError();
      
      expect(error.type).toBe(ErrorTypes.AUTHENTICATION);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
      
      const customError = createAuthenticationError('Login required');
      expect(customError.message).toBe('Login required');
    });
    
    it('should create an authorization error', () => {
      const error = createAuthorizationError();
      
      expect(error.type).toBe(ErrorTypes.AUTHORIZATION);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Permission denied');
      
      const customError = createAuthorizationError('Insufficient privileges');
      expect(customError.message).toBe('Insufficient privileges');
    });
    
    it('should create a not found error', () => {
      const error = createNotFoundError();
      
      expect(error.type).toBe(ErrorTypes.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      
      const customError = createNotFoundError('User not found', 'user');
      expect(customError.message).toBe('User not found');
      expect(customError.details).toEqual({ resource: 'user' });
    });
    
    it('should create an API error', () => {
      const details = { service: 'alpaca', endpoint: '/v2/orders' };
      const error = createApiError('API request failed', details);
      
      expect(error.type).toBe(ErrorTypes.API);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('API request failed');
      expect(error.details).toEqual(details);
    });
    
    it('should create a database error', () => {
      const details = { table: 'users', operation: 'insert' };
      const error = createDatabaseError('Database operation failed', details);
      
      expect(error.type).toBe(ErrorTypes.DATABASE);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Database operation failed');
      expect(error.details).toEqual(details);
    });
    
    it('should create a network error', () => {
      const error = createNetworkError();
      
      expect(error.type).toBe(ErrorTypes.NETWORK);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Network error');
    });
    
    it('should create a timeout error', () => {
      const error = createTimeoutError();
      
      expect(error.type).toBe(ErrorTypes.TIMEOUT);
      expect(error.statusCode).toBe(408);
      expect(error.message).toBe('Request timed out');
    });
    
    it('should create a rate limit error', () => {
      const error = createRateLimitError();
      
      expect(error.type).toBe(ErrorTypes.RATE_LIMIT);
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Rate limit exceeded');
    });
    
    it('should create an internal error', () => {
      const error = createInternalError();
      
      expect(error.type).toBe(ErrorTypes.INTERNAL);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
    });
  });
  
  describe('handleApiError', () => {
    it('should handle AppError instances', () => {
      const error = createValidationError('Invalid input', { field: 'username' });
      const result = handleApiError(error);
      
      expect(result.statusCode).toBe(400);
      expect(result.body.error).toBe(ErrorTypes.VALIDATION);
      expect(result.body.message).toBe('Invalid input');
    });
    
    it('should handle Supabase errors', () => {
      const error = {
        code: 'PGRST116',
        message: 'No rows returned',
        details: 'The query did not return any results'
      };
      
      const result = handleApiError(error);
      
      expect(result.statusCode).toBe(404);
      expect(result.body.error).toBe(ErrorTypes.DATABASE);
      expect(result.body.message).toBe('No rows returned');
    });
    
    it('should handle Alpaca API errors', () => {
      const error = {
        statusCode: 422,
        message: 'Order quantity must be positive'
      };
      
      const result = handleApiError(error);
      
      expect(result.statusCode).toBe(422);
      expect(result.body.error).toBe(ErrorTypes.API);
      expect(result.body.message).toBe('Order quantity must be positive');
    });
    
    it('should handle generic errors', () => {
      const error = new Error('Something went wrong');
      const result = handleApiError(error);
      
      expect(result.statusCode).toBe(500);
      expect(result.body.error).toBe(ErrorTypes.INTERNAL);
      expect(result.body.message).toBe('Something went wrong');
    });
  });
  
  describe('logError', () => {
    it('should log errors to console', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'login' };
      
      logError(error, context);
      
      expect(console.error).toHaveBeenCalledWith('Error:', error);
      expect(console.error).toHaveBeenCalledWith('Error Context:', context);
    });
    
    it('should not log context if empty', () => {
      const error = new Error('Test error');
      
      logError(error);
      
      expect(console.error).toHaveBeenCalledWith('Error:', error);
      expect(console.error).not.toHaveBeenCalledWith('Error Context:', {});
    });
  });
});