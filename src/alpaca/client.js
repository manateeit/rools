/**
 * Alpaca API Client
 * 
 * Manages communication with the Alpaca API for trading and market data.
 */

const Alpaca = require('@alpacahq/alpaca-trade-api');
const EventEmitter = require('events');

class AlpacaClient extends EventEmitter {
  /**
   * Create a new AlpacaClient instance
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - Alpaca API key
   * @param {string} options.apiSecret - Alpaca API secret
   * @param {boolean} options.paper - Whether to use paper trading
   */
  constructor({ apiKey, apiSecret, paper = true }) {
    super();
    this.config = {
      apiKey,
      apiSecret,
      paper
    };
    
    this.alpaca = new Alpaca({
      keyId: apiKey,
      secretKey: apiSecret,
      paper,
      usePolygon: false
    });
    
    this.websocket = null;
    this.isConnected = false;
    this.subscribedSymbols = new Set();
  }

  /**
   * Connect to the Alpaca API
   * 
   * @returns {Promise<Object>} - Account information
   */
  async connect() {
    try {
      // Test connection by getting account information
      const account = await this.alpaca.getAccount();
      this.isConnected = true;
      this.emit('connected', { account });
      return account;
    } catch (error) {
      this.emit('error', { message: 'Failed to connect to Alpaca API', error });
      throw error;
    }
  }

  /**
   * Get account information
   * 
   * @returns {Promise<Object>} - Account information
   */
  async getAccountInfo() {
    try {
      const account = await this.alpaca.getAccount();
      return {
        id: account.id,
        status: account.status,
        currency: account.currency,
        cash: parseFloat(account.cash),
        portfolioValue: parseFloat(account.portfolio_value),
        buyingPower: parseFloat(account.buying_power),
        daytradeCount: account.daytrade_count,
        daytradeLimit: account.daytrade_buying_power,
        isPaperAccount: this.config.paper
      };
    } catch (error) {
      this.emit('error', { message: 'Failed to get account information', error });
      throw error;
    }
  }

  /**
   * Get available assets
   * 
   * @returns {Promise<Array<Object>>} - List of assets
   */
  async getAssets() {
    try {
      const assets = await this.alpaca.getAssets({
        status: 'active'
      });
      
      return assets.map(asset => ({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        class: asset.class,
        exchange: asset.exchange,
        tradable: asset.tradable,
        marginable: asset.marginable,
        shortable: asset.shortable,
        easy_to_borrow: asset.easy_to_borrow
      }));
    } catch (error) {
      this.emit('error', { message: 'Failed to get assets', error });
      throw error;
    }
  }

  /**
   * Get current positions
   * 
   * @returns {Promise<Array<Object>>} - List of positions
   */
  async getPositions() {
    try {
      return await this.alpaca.getPositions();
    } catch (error) {
      this.emit('error', { message: 'Failed to get positions', error });
      throw error;
    }
  }

  /**
   * Get market data for symbols
   * 
   * @param {Array<string>} symbols - List of symbols
   * @param {string} timeframe - Timeframe (e.g., '1D', '1H', '5Min')
   * @param {number} limit - Number of bars to retrieve
   * @returns {Promise<Object>} - Market data by symbol
   */
  async getMarketData(symbols, timeframe = '1D', limit = 10) {
    try {
      const bars = await this.alpaca.getBars({
        symbols,
        timeframe,
        limit
      });
      
      const marketData = {};
      
      for (const symbol of symbols) {
        const symbolBars = bars[symbol] || [];
        marketData[symbol] = symbolBars.map(bar => ({
          timestamp: bar.t,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
          volume: bar.v
        }));
      }
      
      return marketData;
    } catch (error) {
      this.emit('error', { message: 'Failed to get market data', error });
      throw error;
    }
  }

  /**
   * Get historical data for backtesting
   * 
   * @param {Array<string>} symbols - List of symbols
   * @param {string} timeframe - Timeframe (e.g., '1D', '1H', '5Min')
   * @param {string} start - Start date (ISO format)
   * @param {string} end - End date (ISO format)
   * @returns {Promise<Object>} - Historical data by symbol
   */
  async getHistoricalData(symbols, timeframe = '1D', start, end) {
    try {
      const bars = await this.alpaca.getBars({
        symbols,
        timeframe,
        start,
        end
      });
      
      const historicalData = {};
      
      for (const symbol of symbols) {
        const symbolBars = bars[symbol] || [];
        historicalData[symbol] = symbolBars.map(bar => ({
          timestamp: bar.t,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c,
          volume: bar.v
        }));
      }
      
      return historicalData;
    } catch (error) {
      this.emit('error', { message: 'Failed to get historical data', error });
      throw error;
    }
  }

  /**
   * Place an order
   * 
   * @param {Object} params - Order parameters
   * @param {string} params.symbol - Symbol
   * @param {number} params.qty - Quantity
   * @param {string} params.side - Side ('buy' or 'sell')
   * @param {string} params.type - Order type ('market', 'limit', 'stop', 'stop_limit')
   * @param {string} params.time_in_force - Time in force ('day', 'gtc', 'ioc', 'fok')
   * @param {number} params.limit_price - Limit price (for limit and stop_limit orders)
   * @param {number} params.stop_price - Stop price (for stop and stop_limit orders)
   * @returns {Promise<Object>} - Order information
   */
  async placeOrder(params) {
    try {
      const order = await this.alpaca.createOrder(params);
      
      this.emit('order-placed', { order });
      
      return {
        id: order.id,
        client_order_id: order.client_order_id,
        symbol: order.symbol,
        quantity: parseFloat(order.qty),
        side: order.side,
        type: order.type,
        time_in_force: order.time_in_force,
        limit_price: order.limit_price ? parseFloat(order.limit_price) : null,
        stop_price: order.stop_price ? parseFloat(order.stop_price) : null,
        status: order.status,
        created_at: order.created_at,
        filled_at: order.filled_at,
        filled_qty: order.filled_qty ? parseFloat(order.filled_qty) : 0,
        filled_avg_price: order.filled_avg_price ? parseFloat(order.filled_avg_price) : null
      };
    } catch (error) {
      this.emit('error', { message: 'Failed to place order', error });
      throw error;
    }
  }

  /**
   * Get order status
   * 
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Order information
   */
  async getOrderStatus(orderId) {
    try {
      const order = await this.alpaca.getOrder(orderId);
      
      return {
        id: order.id,
        client_order_id: order.client_order_id,
        symbol: order.symbol,
        quantity: parseFloat(order.qty),
        side: order.side,
        type: order.type,
        time_in_force: order.time_in_force,
        limit_price: order.limit_price ? parseFloat(order.limit_price) : null,
        stop_price: order.stop_price ? parseFloat(order.stop_price) : null,
        status: order.status,
        created_at: order.created_at,
        filled_at: order.filled_at,
        filled_qty: order.filled_qty ? parseFloat(order.filled_qty) : 0,
        filled_avg_price: order.filled_avg_price ? parseFloat(order.filled_avg_price) : null
      };
    } catch (error) {
      this.emit('error', { message: 'Failed to get order status', error });
      throw error;
    }
  }

  /**
   * Cancel an order
   * 
   * @param {string} orderId - Order ID
   * @returns {Promise<boolean>} - Whether the order was cancelled
   */
  async cancelOrder(orderId) {
    try {
      await this.alpaca.cancelOrder(orderId);
      this.emit('order-cancelled', { orderId });
      return true;
    } catch (error) {
      this.emit('error', { message: 'Failed to cancel order', error });
      throw error;
    }
  }

  /**
   * Subscribe to market data updates
   * 
   * @param {Array<string>} symbols - List of symbols
   * @returns {Promise<void>}
   */
  async subscribeToMarketData(symbols) {
    try {
      if (!this.websocket) {
        this.websocket = this.alpaca.data_stream_v2;
        
        this.websocket.onConnect(() => {
          this.emit('websocket-connected');
          console.log('Connected to Alpaca data stream');
        });
        
        this.websocket.onDisconnect(() => {
          this.emit('websocket-disconnected');
          console.log('Disconnected from Alpaca data stream');
        });
        
        this.websocket.onError((error) => {
          this.emit('websocket-error', { error });
          console.error('Alpaca data stream error:', error);
        });
        
        this.websocket.onStockTrade((trade) => {
          this.emit('stock-trade', { trade });
        });
        
        this.websocket.onStockQuote((quote) => {
          this.emit('stock-quote', { quote });
        });
        
        this.websocket.onStockBar((bar) => {
          this.emit('stock-bar', { bar });
        });
        
        await this.websocket.connect();
      }
      
      // Subscribe to new symbols
      const newSymbols = symbols.filter(symbol => !this.subscribedSymbols.has(symbol));
      
      if (newSymbols.length > 0) {
        await this.websocket.subscribeForTrades(newSymbols);
        await this.websocket.subscribeForQuotes(newSymbols);
        await this.websocket.subscribeForBars(newSymbols);
        
        newSymbols.forEach(symbol => this.subscribedSymbols.add(symbol));
        this.emit('subscribed', { symbols: newSymbols });
      }
    } catch (error) {
      this.emit('error', { message: 'Failed to subscribe to market data', error });
      throw error;
    }
  }

  /**
   * Unsubscribe from market data updates
   * 
   * @param {Array<string>} symbols - List of symbols (if empty, unsubscribe from all)
   * @returns {Promise<void>}
   */
  async unsubscribeFromMarketData(symbols) {
    try {
      if (!this.websocket) {
        return;
      }
      
      const symbolsToUnsubscribe = symbols || Array.from(this.subscribedSymbols);
      
      if (symbolsToUnsubscribe.length > 0) {
        await this.websocket.unsubscribeFromTrades(symbolsToUnsubscribe);
        await this.websocket.unsubscribeFromQuotes(symbolsToUnsubscribe);
        await this.websocket.unsubscribeFromBars(symbolsToUnsubscribe);
        
        symbolsToUnsubscribe.forEach(symbol => this.subscribedSymbols.delete(symbol));
        this.emit('unsubscribed', { symbols: symbolsToUnsubscribe });
      }
      
      // If no more subscribed symbols, disconnect websocket
      if (this.subscribedSymbols.size === 0 && this.websocket) {
        await this.websocket.disconnect();
        this.websocket = null;
      }
    } catch (error) {
      this.emit('error', { message: 'Failed to unsubscribe from market data', error });
      throw error;
    }
  }
}

module.exports = AlpacaClient;