import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for running a backtest
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
    // Get backtest configuration from request body
    const {
      name,
      description,
      strategy,
      parameters,
      symbols,
      startDate,
      endDate
    } = req.body;
    
    // Validate required fields
    if (!name || !strategy || !symbols || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name, strategy, symbols, startDate, and endDate are required'
      });
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid date format'
      });
    }
    
    if (start >= end) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Start date must be before end date'
      });
    }
    
    // Validate symbols
    if (!Array.isArray(symbols) && typeof symbols !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Symbols must be an array or a string'
      });
    }
    
    // Convert symbols to array if string
    const symbolsArray = typeof symbols === 'string' ? [symbols] : symbols;
    
    // Initialize backtesting engine
    const backtestEngine = req.app.backtestEngine;
    
    if (!backtestEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Backtesting engine not initialized' });
    }
    
    // Prepare backtest configuration
    const backtestConfig = {
      name,
      description: description || '',
      strategy,
      parameters: parameters || {},
      symbols: symbolsArray,
      startDate: start,
      endDate: end
    };
    
    // Run backtest
    const backtestResult = await backtestEngine.runBacktest(backtestConfig);
    
    // Store backtest result in database
    const storedBacktest = await storeBacktestResult(req, backtestConfig, backtestResult);
    
    // Return backtest result
    return res.status(200).json({
      id: storedBacktest.id,
      name,
      description: description || '',
      strategy,
      parameters: parameters || {},
      symbols: symbolsArray,
      startDate,
      endDate,
      createdAt: storedBacktest.created_at,
      metrics: backtestResult.metrics,
      results: backtestResult.results
    });
  } catch (error) {
    console.error('Run backtest error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

/**
 * Store backtest result in database
 * 
 * @param {Object} req - The request object
 * @param {Object} config - The backtest configuration
 * @param {Object} result - The backtest result
 * @returns {Object} - The stored backtest
 */
async function storeBacktestResult(req, config, result) {
  const { user, supabase } = req;
  
  // Store backtest in database
  const { data, error } = await supabase
    .from('backtests')
    .insert({
      user_id: user.id,
      name: config.name,
      description: config.description,
      strategy: config.strategy,
      parameters: config.parameters,
      symbols: config.symbols,
      start_date: config.startDate.toISOString(),
      end_date: config.endDate.toISOString(),
      metrics: result.metrics,
      results: result.results,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error storing backtest result:', error);
    throw new Error('Failed to store backtest result');
  }
  
  return data;
}

// Export the handler with authentication middleware
export default createApiHandler(handler);