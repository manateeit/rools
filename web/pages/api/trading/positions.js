import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for trading positions
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getPositions(req, res);
    default:
      return res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed' });
  }
}

/**
 * Get positions
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function getPositions(req, res) {
  try {
    // Get query parameters
    const { symbol } = req.query;
    
    // Initialize trading engine
    const tradingEngine = req.app.tradingEngine;
    
    if (!tradingEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Trading engine not initialized' });
    }
    
    // Get positions from Alpaca
    let positions;
    
    if (symbol) {
      // Get position for specific symbol
      try {
        const position = await tradingEngine.alpacaClient.getPosition(symbol);
        positions = [position];
      } catch (error) {
        // If position not found, return empty array
        if (error.statusCode === 404) {
          positions = [];
        } else {
          throw error;
        }
      }
    } else {
      // Get all positions
      positions = await tradingEngine.alpacaClient.getPositions();
    }
    
    // Format response
    const formattedPositions = positions.map(position => ({
      symbol: position.symbol,
      quantity: parseInt(position.qty),
      side: position.side,
      entryPrice: parseFloat(position.avg_entry_price),
      currentPrice: parseFloat(position.current_price),
      lastDayPrice: parseFloat(position.lastday_price),
      marketValue: parseFloat(position.market_value),
      costBasis: parseFloat(position.cost_basis),
      unrealizedPL: parseFloat(position.unrealized_pl),
      unrealizedPLPercent: parseFloat(position.unrealized_plpc) * 100,
      unrealizedIntradayPL: parseFloat(position.unrealized_intraday_pl),
      unrealizedIntradayPLPercent: parseFloat(position.unrealized_intraday_plpc) * 100,
      assetClass: position.asset_class,
      assetId: position.asset_id,
      createdAt: position.created_at
    }));
    
    // Return positions
    return res.status(200).json(formattedPositions);
  } catch (error) {
    console.error('Get positions error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);