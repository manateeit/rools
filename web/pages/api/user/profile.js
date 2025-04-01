import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for user profile
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getProfile(req, res);
    case 'PUT':
      return updateProfile(req, res);
    default:
      return res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed' });
  }
}

/**
 * Get user profile
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function getProfile(req, res) {
  try {
    const { user, supabase } = req;
    
    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return res.status(400).json({ error: 'Failed to get user', message: userError.message });
    }
    
    // Get user preferences from database
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (preferencesError && preferencesError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching user preferences:', preferencesError);
    }
    
    // Return user profile
    return res.status(200).json({
      id: userData.user.id,
      email: userData.user.email,
      name: userData.user.user_metadata?.name || '',
      preferences: preferences || {
        timezone: 'America/New_York',
        currency: 'USD',
        dark_mode: false
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

/**
 * Update user profile
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function updateProfile(req, res) {
  try {
    const { user, supabase } = req;
    const { name } = req.body;
    
    // Update user metadata
    const { data, error } = await supabase.auth.updateUser({
      data: { name }
    });
    
    if (error) {
      return res.status(400).json({ error: 'Failed to update profile', message: error.message });
    }
    
    // Return updated user
    return res.status(200).json({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || ''
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);