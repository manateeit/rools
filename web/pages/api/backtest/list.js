import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for listing backtests
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only GET method is allowed' });
  }
  
  try {
    const { user, supabase } = req;
    
    // Get query parameters
    const { 
      limit = 50, 
      offset = 0, 
      strategy, 
      symbol,
      sortBy = 'created_at',
      sortDirection = 'desc'
    } = req.query;
    
    // Build query
    let query = supabase
      .from('backtests')
      .select('*')
      .eq('user_id', user.id)
      .order(sortBy, { ascending: sortDirection === 'asc' })
      .limit(parseInt(limit))
      .offset(parseInt(offset));
    
    // Add strategy filter if provided
    if (strategy) {
      query = query.eq('strategy', strategy);
    }
    
    // Add symbol filter if provided
    if (symbol) {
      query = query.contains('symbols', [symbol]);
    }
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching backtests:', error);
      return res.status(500).json({ error: 'Database Error', message: error.message });
    }
    
    // Format response
    const formattedBacktests = data.map(backtest => ({
      id: backtest.id,
      name: backtest.name,
      description: backtest.description,
      strategy: backtest.strategy,
      parameters: backtest.parameters,
      symbols: backtest.symbols,
      startDate: backtest.start_date,
      endDate: backtest.end_date,
      createdAt: backtest.created_at,
      metrics: backtest.metrics
    }));
    
    // Return backtests
    return res.status(200).json({
      backtests: formattedBacktests,
      count: formattedBacktests.length,
      total: count
    });
  } catch (error) {
    console.error('List backtests error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);