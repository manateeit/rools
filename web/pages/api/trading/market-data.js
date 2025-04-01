import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for market data
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
    // Get query parameters
    const { 
      symbols, 
      timeframe = '1D', 
      start, 
      end, 
      limit = 100 
    } = req.query;
    
    // Validate symbols
    if (!symbols) {
      return res.status(400).json({ error: 'Bad Request', message: 'Symbols parameter is required' });
    }
    
    // Parse symbols
    const symbolsList = symbols.split(',').map(s => s.trim().toUpperCase());
    
    // Initialize trading engine
    const tradingEngine = req.app.tradingEngine;
    
    if (!tradingEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Trading engine not initialized' });
    }
    
    // Prepare parameters for Alpaca
    const params = {
      symbols: symbolsList,
      timeframe: parseTimeframe(timeframe),
      limit: parseInt(limit)
    };
    
    // Add start date if provided
    if (start) {
      params.start = new Date(start);
    } else {
      // Default to 30 days ago
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      params.start = startDate;
    }
    
    // Add end date if provided
    if (end) {
      params.end = new Date(end);
    }
    
    // Get market data from Alpaca
    const bars = await tradingEngine.alpacaClient.getBars(params);
    
    // Format response
    const formattedData = {};
    
    // Process bars for each symbol
    symbolsList.forEach(symbol => {
      const symbolBars = bars[symbol] || [];
      
      formattedData[symbol] = symbolBars.map(bar => ({
        timestamp: bar.timestamp,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume
      }));
    });
    
    // Return market data
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Get market data error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

/**
 * Parse timeframe string to Alpaca format
 * 
 * @param {string} timeframe - The timeframe string (e.g., '1D', '1H', '5M')
 * @returns {string} - The Alpaca timeframe format
 */
function parseTimeframe(timeframe) {
  // Default to 1 day
  if (!timeframe) return '1Day';
  
  const match = timeframe.match(/^(\d+)([MHDW])$/);
  
  if (!match) return '1Day';
  
  const [, value, unit] = match;
  
  switch (unit) {
    case 'M':
      return `${value}Min`;
    case 'H':
      return `${value}Hour`;
    case 'D':
      return `${value}Day`;
    case 'W':
      return `${value}Week`;
    default:
      return '1Day';
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);