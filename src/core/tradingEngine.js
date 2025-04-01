/**
 * Trading Engine
 * 
 * The core component responsible for executing trades, managing positions,
 * and running trading strategies.
 */
class TradingEngine {
  /**
   * Create a new TradingEngine instance
   * 
   * @param {Object} alpacaClient - The Alpaca API client
   */
  constructor(alpacaClient) {
    this.alpacaClient = alpacaClient;
  }

  /**
   * Execute an order
   * 
   * @param {string} side - 'buy' or 'sell'
   * @param {string} symbol - The asset symbol (e.g., 'AAPL')
   * @param {number} quantity - The quantity to buy or sell
   * @param {string} type - The order type (e.g., 'market', 'limit')
   * @param {number} [limitPrice] - The limit price (required for limit orders)
   * @returns {Promise<Object>} - The order result
   */
  async executeOrder(side, symbol, quantity, type, limitPrice) {
    const orderParams = {
      symbol,
      qty: quantity,
      side,
      type,
      time_in_force: 'day'
    };

    if (type === 'limit' && limitPrice) {
      orderParams.limit_price = limitPrice;
    }

    return this.alpacaClient.createOrder(orderParams);
  }

  /**
   * Execute a trading strategy
   * 
   * @param {Object} strategy - The trading strategy to execute
   * @param {string} symbol - The asset symbol (e.g., 'AAPL')
   * @returns {Promise<Object>} - The order result
   */
  async executeStrategy(strategy, symbol) {
    // Get market data for analysis
    const marketData = await this.alpacaClient.getMarketData(symbol, '1D', 30);
    
    // Analyze the market data using the strategy
    const recommendation = await strategy.analyze(symbol, marketData[symbol]);
    
    // Execute the recommended action
    if (recommendation.action === 'buy' || recommendation.action === 'sell') {
      return this.executeOrder(
        recommendation.action,
        recommendation.symbol,
        recommendation.quantity,
        'market'
      );
    }
    
    // Return null if no action is recommended
    return null;
  }

  /**
   * Get account information
   * 
   * @returns {Promise<Object>} - The account information
   */
  async getAccountInfo() {
    return this.alpacaClient.getAccount();
  }

  /**
   * Get positions
   * 
   * @returns {Promise<Array>} - The positions
   */
  async getPositions() {
    return this.alpacaClient.getPositions();
  }
}

module.exports = { TradingEngine };