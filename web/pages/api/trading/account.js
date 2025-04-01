import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for trading account information
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
    // Initialize trading engine
    const tradingEngine = req.app.tradingEngine;
    
    if (!tradingEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Trading engine not initialized' });
    }
    
    // Get account information from Alpaca
    const account = await tradingEngine.alpacaClient.getAccount();
    
    // Format response
    const formattedAccount = {
      id: account.id,
      status: account.status,
      currency: account.currency,
      cash: parseFloat(account.cash),
      portfolioValue: parseFloat(account.portfolio_value),
      buyingPower: parseFloat(account.buying_power),
      daytradeCount: account.daytrade_count,
      daytradeLimit: account.daytrade_count_limit,
      patternDayTrader: account.pattern_day_trader,
      tradingBlocked: account.trading_blocked,
      transfersBlocked: account.transfers_blocked,
      accountBlocked: account.account_blocked,
      createdAt: account.created_at,
      isPaperAccount: tradingEngine.alpacaClient.isPaper
    };
    
    // Return account information
    return res.status(200).json(formattedAccount);
  } catch (error) {
    console.error('Get account error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);