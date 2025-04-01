import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for managing a specific backtest
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getBacktest(req, res);
    case 'DELETE':
      return deleteBacktest(req, res);
    default:
      return res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed' });
  }
}

/**
 * Get a specific backtest
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function getBacktest(req, res) {
  try {
    const { user, supabase } = req;
    const { id } = req.query;
    
    // Get backtest from database
    const { data, error } = await supabase
      .from('backtests')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Not Found', message: 'Backtest not found' });
      }
      
      console.error('Error fetching backtest:', error);
      return res.status(500).json({ error: 'Database Error', message: error.message });
    }
    
    // Format response
    const formattedBacktest = {
      id: data.id,
      name: data.name,
      description: data.description,
      strategy: data.strategy,
      parameters: data.parameters,
      symbols: data.symbols,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      metrics: data.metrics,
      results: data.results
    };
    
    // Return backtest
    return res.status(200).json(formattedBacktest);
  } catch (error) {
    console.error('Get backtest error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

/**
 * Delete a backtest
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function deleteBacktest(req, res) {
  try {
    const { user, supabase } = req;
    const { id } = req.query;
    
    // Delete backtest from database
    const { error } = await supabase
      .from('backtests')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting backtest:', error);
      return res.status(500).json({ error: 'Database Error', message: error.message });
    }
    
    // Return success
    return res.status(200).json({ success: true, message: 'Backtest deleted successfully' });
  } catch (error) {
    console.error('Delete backtest error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);