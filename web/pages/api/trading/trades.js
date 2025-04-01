import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for trading activity (executed trades)
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
      symbol, 
      limit = 50, 
      after, 
      until, 
      direction = 'desc'
    } = req.query;
    
    // Initialize trading engine
    const tradingEngine = req.app.tradingEngine;
    
    if (!tradingEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Trading engine not initialized' });
    }
    
    // Prepare parameters for Alpaca
    const params = {
      limit: parseInt(limit),
      direction
    };
    
    // Add symbol if provided
    if (symbol) {
      params.symbols = symbol;
    }
    
    // Add after date if provided
    if (after) {
      params.after = new Date(after);
    }
    
    // Add until date if provided
    if (until) {
      params.until = new Date(until);
    }
    
    // Get trades from Alpaca
    const activities = await tradingEngine.alpacaClient.getAccountActivities(params);
    
    // Filter for trade activities
    const trades = activities.filter(activity => 
      activity.activity_type === 'FILL' || 
      activity.activity_type === 'PARTIAL_FILL'
    );
    
    // Format response
    const formattedTrades = trades.map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side.toLowerCase(),
      quantity: parseFloat(trade.qty),
      price: parseFloat(trade.price),
      executedAt: trade.transaction_time,
      orderId: trade.order_id,
      type: trade.type,
      status: 'filled',
      fee: parseFloat(trade.fee),
      cumulativeQuantity: parseFloat(trade.cum_qty)
    }));
    
    // Return trades
    return res.status(200).json(formattedTrades);
  } catch (error) {
    console.error('Get trades error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);