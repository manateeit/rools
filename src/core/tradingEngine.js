/**
 * Trading Engine
 * 
 * The core trading engine that orchestrates the trading process,
 * manages strategies, and executes trades.
 */

const EventEmitter = require('events');

class TradingEngine extends EventEmitter {
  /**
   * Create a new TradingEngine instance
   * 
   * @param {Object} options - Configuration options
   * @param {Object} options.alpacaClient - Initialized Alpaca API client
   * @param {Object} options.llmIntegration - Initialized LLM integration
   * @param {Object} options.storage - Initialized storage layer
   */
  constructor({ alpacaClient, llmIntegration, storage }) {
    super();
    this.alpacaClient = alpacaClient;
    this.llmIntegration = llmIntegration;
    this.storage = storage;
    this.isRunning = false;
    this.activeStrategies = new Map();
    this.positions = new Map();
    this.config = {
      tradingFrequency: 'daily', // default frequency
      riskLevel: 'medium', // default risk level
      maxPositions: 10, // default max positions
      paperTrading: true // default to paper trading
    };
  }

  /**
   * Initialize the trading engine
   * 
   * @param {Object} config - Trading engine configuration
   * @returns {Promise<void>}
   */
  async initialize(config = {}) {
    this.config = { ...this.config, ...config };
    
    try {
      // Connect to Alpaca API
      await this.alpacaClient.connect();
      
      // Load existing positions
      await this.loadPositions();
      
      // Initialize LLM models
      await this.llmIntegration.initialize();
      
      this.emit('initialized', { config: this.config });
      return true;
    } catch (error) {
      this.emit('error', { message: 'Failed to initialize trading engine', error });
      throw error;
    }
  }

  /**
   * Load current positions from Alpaca
   * 
   * @returns {Promise<Map>} - Map of positions
   */
  async loadPositions() {
    try {
      const positions = await this.alpacaClient.getPositions();
      this.positions.clear();
      
      positions.forEach(position => {
        this.positions.set(position.symbol, {
          symbol: position.symbol,
          quantity: parseFloat(position.qty),
          entryPrice: parseFloat(position.avg_entry_price),
          marketValue: parseFloat(position.market_value),
          currentPrice: parseFloat(position.current_price),
          unrealizedPL: parseFloat(position.unrealized_pl),
          unrealizedPLPercent: parseFloat(position.unrealized_plpc)
        });
      });
      
      this.emit('positions-updated', { positions: Array.from(this.positions.values()) });
      return this.positions;
    } catch (error) {
      this.emit('error', { message: 'Failed to load positions', error });
      throw error;
    }
  }

  /**
   * Start the trading engine
   * 
   * @returns {Promise<void>}
   */
  async start() {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.emit('started');
    
    // Start monitoring market data
    await this.startMarketDataMonitoring();
  }

  /**
   * Stop the trading engine
   * 
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    // Stop all active strategies
    for (const [strategyId, strategy] of this.activeStrategies.entries()) {
      await this.stopStrategy(strategyId);
    }
    
    // Stop market data monitoring
    await this.stopMarketDataMonitoring();
    
    this.emit('stopped');
  }

  /**
   * Start monitoring market data
   * 
   * @returns {Promise<void>}
   */
  async startMarketDataMonitoring() {
    try {
      // Get symbols from active positions and strategies
      const symbols = this.getSymbolsToMonitor();
      
      // Subscribe to market data updates
      await this.alpacaClient.subscribeToMarketData(symbols);
      
      this.emit('market-data-monitoring-started', { symbols });
    } catch (error) {
      this.emit('error', { message: 'Failed to start market data monitoring', error });
      throw error;
    }
  }

  /**
   * Stop monitoring market data
   * 
   * @returns {Promise<void>}
   */
  async stopMarketDataMonitoring() {
    try {
      await this.alpacaClient.unsubscribeFromMarketData();
      this.emit('market-data-monitoring-stopped');
    } catch (error) {
      this.emit('error', { message: 'Failed to stop market data monitoring', error });
      throw error;
    }
  }

  /**
   * Get symbols to monitor from positions and strategies
   * 
   * @returns {Array<string>} - Array of symbols
   */
  getSymbolsToMonitor() {
    const symbols = new Set();
    
    // Add symbols from positions
    for (const position of this.positions.values()) {
      symbols.add(position.symbol);
    }
    
    // Add symbols from strategies
    for (const strategy of this.activeStrategies.values()) {
      if (strategy.symbols) {
        strategy.symbols.forEach(symbol => symbols.add(symbol));
      }
    }
    
    return Array.from(symbols);
  }

  /**
   * Execute a trading strategy
   * 
   * @param {Object} strategy - Strategy configuration
   * @param {Array<string>} assets - Assets to trade
   * @returns {Promise<Object>} - Strategy execution result
   */
  async executeStrategy(strategy, assets) {
    try {
      // Generate trading decisions using LLM
      const marketData = await this.alpacaClient.getMarketData(assets);
      const decisions = await this.llmIntegration.getDecision({
        strategy,
        assets,
        marketData,
        positions: Array.from(this.positions.values())
      });
      
      // Execute trading decisions
      const results = await this.executeTradingDecisions(decisions);
      
      // Store strategy execution results
      await this.storage.storeStrategyExecution({
        strategy,
        assets,
        decisions,
        results,
        timestamp: new Date()
      });
      
      this.emit('strategy-executed', { strategy, assets, results });
      return results;
    } catch (error) {
      this.emit('error', { message: 'Failed to execute strategy', error });
      throw error;
    }
  }

  /**
   * Execute trading decisions
   * 
   * @param {Array<Object>} decisions - Trading decisions
   * @returns {Promise<Array<Object>>} - Execution results
   */
  async executeTradingDecisions(decisions) {
    const results = [];
    
    for (const decision of decisions) {
      try {
        let result;
        
        switch (decision.action) {
          case 'buy':
            result = await this.alpacaClient.placeOrder({
              symbol: decision.symbol,
              qty: decision.quantity,
              side: 'buy',
              type: 'market',
              time_in_force: 'day'
            });
            break;
            
          case 'sell':
            result = await this.alpacaClient.placeOrder({
              symbol: decision.symbol,
              qty: decision.quantity,
              side: 'sell',
              type: 'market',
              time_in_force: 'day'
            });
            break;
            
          case 'hold':
            result = { action: 'hold', symbol: decision.symbol };
            break;
            
          default:
            throw new Error(`Unknown action: ${decision.action}`);
        }
        
        results.push({
          decision,
          result,
          success: true,
          timestamp: new Date()
        });
      } catch (error) {
        results.push({
          decision,
          error: error.message,
          success: false,
          timestamp: new Date()
        });
      }
    }
    
    // Refresh positions after executing decisions
    await this.loadPositions();
    
    return results;
  }

  /**
   * Determine optimal trading frequency using AI
   * 
   * @param {Object} marketConditions - Current market conditions
   * @returns {Promise<string>} - Recommended trading frequency
   */
  async determineTradingFrequency(marketConditions) {
    try {
      const recommendation = await this.llmIntegration.getDecision({
        type: 'trading_frequency',
        marketConditions
      });
      
      this.config.tradingFrequency = recommendation.frequency;
      this.emit('trading-frequency-updated', { frequency: recommendation.frequency });
      
      return recommendation.frequency;
    } catch (error) {
      this.emit('error', { message: 'Failed to determine trading frequency', error });
      throw error;
    }
  }

  /**
   * Select assets based on criteria
   * 
   * @param {Object} criteria - Selection criteria
   * @returns {Promise<Array<string>>} - Selected assets
   */
  async selectAssets(criteria) {
    try {
      // Get available assets from Alpaca
      const assets = await this.alpacaClient.getAssets();
      
      // Filter assets based on criteria
      const filteredAssets = assets.filter(asset => {
        // Only stocks and ETFs
        if (asset.class !== 'us_equity') {
          return false;
        }
        
        // Apply additional criteria
        if (criteria.minPrice && asset.price < criteria.minPrice) {
          return false;
        }
        
        if (criteria.maxPrice && asset.price > criteria.maxPrice) {
          return false;
        }
        
        if (criteria.tradable === true && !asset.tradable) {
          return false;
        }
        
        return true;
      });
      
      // Use LLM to further refine selection if needed
      if (criteria.useAI && filteredAssets.length > criteria.maxAssets) {
        const recommendation = await this.llmIntegration.getDecision({
          type: 'asset_selection',
          assets: filteredAssets,
          criteria
        });
        
        return recommendation.assets;
      }
      
      return filteredAssets.map(asset => asset.symbol);
    } catch (error) {
      this.emit('error', { message: 'Failed to select assets', error });
      throw error;
    }
  }
}

module.exports = TradingEngine;