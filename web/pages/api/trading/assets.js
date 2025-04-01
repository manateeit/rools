import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for trading assets
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
    const { status = 'active', type = 'stock', exchange, search } = req.query;
    
    // Initialize trading engine
    const tradingEngine = req.app.tradingEngine;
    
    if (!tradingEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Trading engine not initialized' });
    }
    
    // Get assets from Alpaca
    const assets = await tradingEngine.alpacaClient.getAssets({
      status,
      asset_class: type
    });
    
    // Filter by exchange if provided
    let filteredAssets = assets;
    if (exchange) {
      filteredAssets = filteredAssets.filter(asset => 
        asset.exchange.toLowerCase() === exchange.toLowerCase()
      );
    }
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAssets = filteredAssets.filter(asset => 
        asset.symbol.toLowerCase().includes(searchLower) || 
        asset.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Format response
    const formattedAssets = filteredAssets.map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      exchange: asset.exchange,
      type: asset.class,
      tradable: asset.tradable,
      marginable: asset.marginable,
      shortable: asset.shortable,
      easy_to_borrow: asset.easy_to_borrow
    }));
    
    // Return assets
    return res.status(200).json(formattedAssets);
  } catch (error) {
    console.error('Get assets error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);