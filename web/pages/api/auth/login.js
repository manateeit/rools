import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for user login
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST method is allowed' });
  }
  
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Bad Request', message: 'Email and password are required' });
    }
    
    // Sign in with Supabase
    const { data, error } = await req.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Handle error
    if (error) {
      return res.status(401).json({ error: 'Authentication Failed', message: error.message });
    }
    
    // Return user and session
    return res.status(200).json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware (but don't require auth for login)
export default createApiHandler(handler, { requireAuth: false });