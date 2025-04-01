import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Middleware to handle authentication for API routes
 * 
 * @param {Function} handler - The API route handler
 * @param {Object} options - Options for the middleware
 * @param {boolean} options.requireAuth - Whether authentication is required
 * @returns {Function} - The wrapped handler function
 */
export function withAuth(handler, { requireAuth = true } = {}) {
  return async (req, res) => {
    // Create Supabase client
    const supabase = createServerSupabaseClient({ req, res });
    
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    // If authentication is required and user is not authenticated, return 401
    if (requireAuth && !session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource'
      });
    }
    
    // Add user and supabase client to request object
    req.user = session?.user || null;
    req.supabase = supabase;
    
    // Call the handler
    return handler(req, res);
  };
}

/**
 * Middleware to handle CORS for API routes
 * 
 * @param {Function} handler - The API route handler
 * @returns {Function} - The wrapped handler function
 */
export function withCors(handler) {
  return async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Call the handler
    return handler(req, res);
  };
}

/**
 * Middleware to handle errors for API routes
 * 
 * @param {Function} handler - The API route handler
 * @returns {Function} - The wrapped handler function
 */
export function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      // Call the handler
      return await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      
      // Return appropriate error response
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';
      
      return res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal Server Error' : message,
        message: statusCode === 500 ? 'An unexpected error occurred' : message
      });
    }
  };
}

/**
 * Combine multiple middleware functions
 * 
 * @param {Function[]} middlewares - Array of middleware functions
 * @returns {Function} - The combined middleware function
 */
export function combineMiddleware(middlewares) {
  return (handler) => {
    return middlewares.reduceRight((acc, middleware) => {
      return middleware(acc);
    }, handler);
  };
}

/**
 * Create a standard API handler with common middleware
 * 
 * @param {Function} handler - The API route handler
 * @param {Object} options - Options for the middleware
 * @param {boolean} options.requireAuth - Whether authentication is required
 * @returns {Function} - The wrapped handler function
 */
export function createApiHandler(handler, { requireAuth = true } = {}) {
  return combineMiddleware([
    withErrorHandling,
    withCors,
    (h) => withAuth(h, { requireAuth })
  ])(handler);
}