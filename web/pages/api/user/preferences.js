import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for user preferences
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getPreferences(req, res);
    case 'PUT':
      return updatePreferences(req, res);
    default:
      return res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed' });
  }
}

/**
 * Get user preferences
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function getPreferences(req, res) {
  try {
    const { user, supabase } = req;
    
    // Get user preferences from database
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return res.status(400).json({ error: 'Failed to get preferences', message: error.message });
    }
    
    // If no preferences found, create default preferences
    if (!data) {
      const defaultPreferences = {
        user_id: user.id,
        timezone: 'America/New_York',
        currency: 'USD',
        dark_mode: false
      };
      
      const { data: newData, error: insertError } = await supabase
        .from('user_preferences')
        .insert(defaultPreferences)
        .select()
        .single();
      
      if (insertError) {
        return res.status(400).json({ error: 'Failed to create preferences', message: insertError.message });
      }
      
      return res.status(200).json(newData);
    }
    
    // Return preferences
    return res.status(200).json(data);
  } catch (error) {
    console.error('Get preferences error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

/**
 * Update user preferences
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function updatePreferences(req, res) {
  try {
    const { user, supabase } = req;
    const { timezone, currency, dark_mode } = req.body;
    
    // Validate input
    const updates = {};
    if (timezone !== undefined) updates.timezone = timezone;
    if (currency !== undefined) updates.currency = currency;
    if (dark_mode !== undefined) updates.dark_mode = dark_mode;
    
    // Update user preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: 'Failed to update preferences', message: error.message });
    }
    
    // Return updated preferences
    return res.status(200).json(data);
  } catch (error) {
    console.error('Update preferences error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);