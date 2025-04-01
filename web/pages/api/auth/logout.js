import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for user logout
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
    // Sign out with Supabase
    const { error } = await req.supabase.auth.signOut();
    
    // Handle error
    if (error) {
      return res.status(400).json({ error: 'Logout Failed', message: error.message });
    }
    
    // Return success
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);