import { createApiHandler } from '../../../../lib/middleware';

/**
 * API route for managing a specific API key
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getApiKey(req, res);
    case 'DELETE':
      return deleteApiKey(req, res);
    default:
      return res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed' });
  }
}

/**
 * Get a specific API key
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function getApiKey(req, res) {
  try {
    const { user, supabase } = req;
    const { id } = req.query;
    
    // Get API key from database
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, type, created_at, last_used')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'API Key Not Found', message: 'API key not found' });
    }
    
    // Return API key
    return res.status(200).json(data);
  } catch (error) {
    console.error('Get API key error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

/**
 * Delete an API key
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function deleteApiKey(req, res) {
  try {
    const { user, supabase } = req;
    const { id } = req.query;
    
    // Delete API key from database
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      return res.status(400).json({ error: 'Failed to delete API key', message: error.message });
    }
    
    // Return success
    return res.status(200).json({ success: true, message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);