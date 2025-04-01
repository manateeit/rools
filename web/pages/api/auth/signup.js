import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for user signup
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
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Bad Request', message: 'Email and password are required' });
    }
    
    // Sign up with Supabase
    const { data, error } = await req.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    // Handle error
    if (error) {
      return res.status(400).json({ error: 'Signup Failed', message: error.message });
    }
    
    // Create user preferences in database
    if (data.user) {
      const { error: preferencesError } = await req.supabase
        .from('user_preferences')
        .insert({
          user_id: data.user.id,
          timezone: 'America/New_York',
          currency: 'USD',
          dark_mode: false
        });
      
      if (preferencesError) {
        console.error('Error creating user preferences:', preferencesError);
      }
    }
    
    // Return user and session
    return res.status(200).json({
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware (but don't require auth for signup)
export default createApiHandler(handler, { requireAuth: false });