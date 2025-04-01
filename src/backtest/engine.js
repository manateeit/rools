/**
 * Backtesting Engine
 * 
 * Simulates trading strategies on historical data to evaluate performance.
 */

const EventEmitter = require('events');

class BacktestEngine extends EventEmitter {
  /**
   * Create a new BacktestEngine instance
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
  }

  /**
   * Run a backtest
   * 
   * @param {Object} config - Backtest configuration
   * @param {string} config.name - Backtest name
   * @param {string} config.description - Backtest description
   * @param {Object} config.strategy - Strategy configuration
   * @param {Array<string>} config.symbols - Symbols to backtest
   * @param {string} config.startDate - Start date (ISO format)
   * @param {string} config.endDate - End date (ISO format)
   * @param {string} config.timeframe - Timeframe (e.g., '1D', '1H')
   * @param {string} config.userId - User ID
   * @param {string} config.modelId - LLM model ID
   * @returns {Promise<Object>} - Backtest results
   */
  async runBacktest(config) {
    try {
      this.emit('backtest-started', { config });
      
      // Validate configuration
      this.validateConfig(config);
      
      // Get historical data
      const historicalData = await this.alpacaClient.getHistoricalData(
        config.symbols,
        config.timeframe,
        config.startDate,
        config.endDate
      );
      
      // Initialize portfolio
      const portfolio = this.initializePortfolio(config.initialCapital || 100000);
      
      // Run simulation
      const trades = [];
      const dailyEquity = [];
      
      // Process each day in the simulation
      const dates = this.extractDates(historicalData);
      
      for (const date of dates) {
        // Get market data for this date
        const marketData = this.getMarketDataForDate(historicalData, date);
        
        // Skip if no market data available
        if (Object.keys(marketData).length === 0) {
          continue;
        }
        
        // Get trading decisions from LLM
        const decisions = await this.llmIntegration.getDecision({
          type: 'trading_decisions',
          strategy: config.strategy,
          assets: config.symbols,
          marketData,
          positions: portfolio.positions
        }, config.modelId);
        
        // Execute decisions
        const executionResults = this.executeDecisions(decisions, marketData, portfolio, date);
        
        // Record trades
        trades.push(...executionResults.trades);
        
        // Record daily equity
        dailyEquity.push({
          date,
          equity: portfolio.calculateTotalEquity(marketData)
        });
        
        // Emit progress
        this.emit('backtest-progress', {
          date,
          equity: dailyEquity[dailyEquity.length - 1].equity,
          progress: dates.indexOf(date) / dates.length
        });
      }
      
      // Calculate performance metrics
      const metrics = this.calculateMetrics(dailyEquity, trades);
      
      // Prepare results
      const results = {
        config,
        trades,
        dailyEquity,
        metrics,
        finalPortfolio: portfolio
      };
      
      // Store results if userId is provided
      if (config.userId) {
        await this.storage.storeBacktestResults({
          userId: config.userId,
          name: config.name,
          description: config.description,
          strategy: config.strategy,
          parameters: {
            initialCapital: config.initialCapital,
            timeframe: config.timeframe
          },
          symbols: config.symbols,
          startDate: config.startDate,
          endDate: config.endDate,
          results: {
            trades,
            dailyEquity
          },
          metrics,
          modelId: config.modelId
        });
      }
      
      this.emit('backtest-completed', { results });
      
      return results;
    } catch (error) {
      this.emit('error', { message: 'Failed to run backtest', error });
      throw error;
    }
  }

  /**
   * Validate backtest configuration
   * 
   * @param {Object} config - Backtest configuration
   * @throws {Error} - If configuration is invalid
   */
  validateConfig(config) {
    if (!config.strategy) {
      throw new Error('Strategy is required');
    }
    
    if (!config.symbols || !Array.isArray(config.symbols) || config.symbols.length === 0) {
      throw new Error('Symbols array is required');
    }
    
    if (!config.startDate) {
      throw new Error('Start date is required');
    }
    
    if (!config.endDate) {
      throw new Error('End date is required');
    }
    
    if (new Date(config.startDate) >= new Date(config.endDate)) {
      throw new Error('Start date must be before end date');
    }
    
    if (!config.timeframe) {
      throw new Error('Timeframe is required');
    }
  }

  /**
   * Initialize portfolio for backtesting
   * 
   * @param {number} initialCapital - Initial capital
   * @returns {Object} - Portfolio object
   */
  initializePortfolio(initialCapital) {
    return {
      cash: initialCapital,
      positions: [],
      
      /**
       * Buy an asset
       * 
       * @param {string} symbol - Symbol
       * @param {number} quantity - Quantity
       * @param {number} price - Price
       * @param {string} date - Date
       * @returns {Object} - Trade information
       */
      buy(symbol, quantity, price, date) {
        const cost = quantity * price;
        
        if (cost > this.cash) {
          throw new Error(`Insufficient funds to buy ${quantity} shares of ${symbol} at $${price}`);
        }
        
        // Update cash
        this.cash -= cost;
        
        // Find existing position
        const existingPosition = this.positions.find(p => p.symbol === symbol);
        
        if (existingPosition) {
          // Update existing position
          const totalCost = existingPosition.quantity * existingPosition.entryPrice + cost;
          const totalQuantity = existingPosition.quantity + quantity;
          
          existingPosition.entryPrice = totalCost / totalQuantity;
          existingPosition.quantity = totalQuantity;
        } else {
          // Create new position
          this.positions.push({
            symbol,
            quantity,
            entryPrice: price
          });
        }
        
        return {
          symbol,
          side: 'buy',
          quantity,
          price,
          date,
          cost
        };
      },
      
      /**
       * Sell an asset
       * 
       * @param {string} symbol - Symbol
       * @param {number} quantity - Quantity
       * @param {number} price - Price
       * @param {string} date - Date
       * @returns {Object} - Trade information
       */
      sell(symbol, quantity, price, date) {
        // Find existing position
        const positionIndex = this.positions.findIndex(p => p.symbol === symbol);
        
        if (positionIndex === -1) {
          throw new Error(`No position found for ${symbol}`);
        }
        
        const position = this.positions[positionIndex];
        
        if (position.quantity < quantity) {
          throw new Error(`Insufficient shares to sell ${quantity} of ${symbol}`);
        }
        
        // Calculate proceeds
        const proceeds = quantity * price;
        
        // Update cash
        this.cash += proceeds;
        
        // Calculate profit/loss
        const costBasis = quantity * position.entryPrice;
        const profitLoss = proceeds - costBasis;
        
        // Update position
        position.quantity -= quantity;
        
        // Remove position if quantity is 0
        if (position.quantity === 0) {
          this.positions.splice(positionIndex, 1);
        }
        
        return {
          symbol,
          side: 'sell',
          quantity,
          price,
          date,
          proceeds,
          profitLoss
        };
      },
      
      /**
       * Calculate total equity
       * 
       * @param {Object} marketData - Market data for current prices
       * @returns {number} - Total equity
       */
      calculateTotalEquity(marketData) {
        let equity = this.cash;
        
        // Add value of positions
        for (const position of this.positions) {
          const data = marketData[position.symbol];
          
          if (data && data.length > 0) {
            const currentPrice = data[data.length - 1].close;
            equity += position.quantity * currentPrice;
          } else {
            // If no market data, use entry price
            equity += position.quantity * position.entryPrice;
          }
        }
        
        return equity;
      }
    };
  }

  /**
   * Extract unique dates from historical data
   * 
   * @param {Object} historicalData - Historical data
   * @returns {Array<string>} - Sorted array of dates
   */
  extractDates(historicalData) {
    const dates = new Set();
    
    // Extract dates from all symbols
    for (const symbol in historicalData) {
      const data = historicalData[symbol];
      
      for (const bar of data) {
        // Convert timestamp to date string (YYYY-MM-DD)
        const date = new Date(bar.timestamp).toISOString().split('T')[0];
        dates.add(date);
      }
    }
    
    // Sort dates
    return Array.from(dates).sort();
  }

  /**
   * Get market data for a specific date
   * 
   * @param {Object} historicalData - Historical data
   * @param {string} date - Date string (YYYY-MM-DD)
   * @returns {Object} - Market data for the date
   */
  getMarketDataForDate(historicalData, date) {
    const marketData = {};
    
    for (const symbol in historicalData) {
      const data = historicalData[symbol];
      
      // Find bars for this date
      const bars = data.filter(bar => {
        const barDate = new Date(bar.timestamp).toISOString().split('T')[0];
        return barDate === date;
      });
      
      if (bars.length > 0) {
        marketData[symbol] = bars;
      }
    }
    
    return marketData;
  }

  /**
   * Execute trading decisions
   * 
   * @param {Array<Object>} decisions - Trading decisions
   * @param {Object} marketData - Market data
   * @param {Object} portfolio - Portfolio
   * @param {string} date - Current date
   * @returns {Object} - Execution results
   */
  executeDecisions(decisions, marketData, portfolio, date) {
    const trades = [];
    
    for (const decision of decisions) {
      try {
        const symbol = decision.symbol;
        const action = decision.action.toLowerCase();
        
        // Get current price
        const data = marketData[symbol];
        
        if (!data || data.length === 0) {
          console.warn(`No market data available for ${symbol} on ${date}`);
          continue;
        }
        
        const price = data[data.length - 1].close;
        
        // Execute decision
        let trade;
        
        switch (action) {
          case 'buy':
            if (decision.quantity > 0) {
              trade = portfolio.buy(symbol, decision.quantity, price, date);
              trades.push(trade);
            }
            break;
            
          case 'sell':
            // Find position
            const position = portfolio.positions.find(p => p.symbol === symbol);
            
            if (position) {
              // If quantity is specified, use it, otherwise sell all
              const quantity = decision.quantity || position.quantity;
              trade = portfolio.sell(symbol, quantity, price, date);
              trades.push(trade);
            }
            break;
            
          case 'hold':
            // No action needed
            break;
            
          default:
            console.warn(`Unknown action: ${action}`);
        }
      } catch (error) {
        console.warn(`Error executing decision for ${decision.symbol}: ${error.message}`);
      }
    }
    
    return { trades };
  }

  /**
   * Calculate performance metrics
   * 
   * @param {Array<Object>} dailyEquity - Daily equity values
   * @param {Array<Object>} trades - Trades
   * @returns {Object} - Performance metrics
   */
  calculateMetrics(dailyEquity, trades) {
    if (dailyEquity.length === 0) {
      return {
        totalReturn: 0,
        annualizedReturn: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        winRate: 0,
        tradeCount: 0
      };
    }
    
    // Calculate total return
    const initialEquity = dailyEquity[0].equity;
    const finalEquity = dailyEquity[dailyEquity.length - 1].equity;
    const totalReturn = (finalEquity - initialEquity) / initialEquity;
    
    // Calculate annualized return
    const firstDate = new Date(dailyEquity[0].date);
    const lastDate = new Date(dailyEquity[dailyEquity.length - 1].date);
    const yearFraction = (lastDate - firstDate) / (365 * 24 * 60 * 60 * 1000);
    const annualizedReturn = Math.pow(1 + totalReturn, 1 / yearFraction) - 1;
    
    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = dailyEquity[0].equity;
    
    for (const day of dailyEquity) {
      if (day.equity > peak) {
        peak = day.equity;
      } else {
        const drawdown = (peak - day.equity) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    // Calculate daily returns
    const dailyReturns = [];
    
    for (let i = 1; i < dailyEquity.length; i++) {
      const prevEquity = dailyEquity[i - 1].equity;
      const currentEquity = dailyEquity[i].equity;
      const dailyReturn = (currentEquity - prevEquity) / prevEquity;
      dailyReturns.push(dailyReturn);
    }
    
    // Calculate Sharpe ratio (assuming risk-free rate of 0)
    const meanDailyReturn = dailyReturns.reduce((sum, return_) => sum + return_, 0) / dailyReturns.length;
    const stdDailyReturn = Math.sqrt(
      dailyReturns.reduce((sum, return_) => sum + Math.pow(return_ - meanDailyReturn, 2), 0) / dailyReturns.length
    );
    const sharpeRatio = stdDailyReturn === 0 ? 0 : (meanDailyReturn / stdDailyReturn) * Math.sqrt(252); // Annualized
    
    // Calculate win rate
    const profitableTrades = trades.filter(trade => trade.side === 'sell' && trade.profitLoss > 0);
    const winRate = trades.length === 0 ? 0 : profitableTrades.length / trades.length;
    
    return {
      totalReturn,
      annualizedReturn,
      maxDrawdown,
      sharpeRatio,
      winRate,
      tradeCount: trades.length
    };
  }

  /**
   * Compare multiple backtest results
   * 
   * @param {Array<Object>} backtests - Array of backtest results
   * @returns {Object} - Comparison results
   */
  compareBacktests(backtests) {
    if (!backtests || backtests.length === 0) {
      throw new Error('No backtests to compare');
    }
    
    const comparison = {
      backtests: backtests.map(backtest => ({
        name: backtest.config.name,
        strategy: backtest.config.strategy.name,
        metrics: backtest.metrics
      })),
      bestPerformer: null,
      worstPerformer: null,
      lowestDrawdown: null,
      highestSharpe: null
    };
    
    // Find best and worst performers
    let bestReturn = -Infinity;
    let worstReturn = Infinity;
    let lowestDrawdown = Infinity;
    let highestSharpe = -Infinity;
    
    for (let i = 0; i < backtests.length; i++) {
      const metrics = backtests[i].metrics;
      
      if (metrics.totalReturn > bestReturn) {
        bestReturn = metrics.totalReturn;
        comparison.bestPerformer = i;
      }
      
      if (metrics.totalReturn < worstReturn) {
        worstReturn = metrics.totalReturn;
        comparison.worstPerformer = i;
      }
      
      if (metrics.maxDrawdown < lowestDrawdown) {
        lowestDrawdown = metrics.maxDrawdown;
        comparison.lowestDrawdown = i;
      }
      
      if (metrics.sharpeRatio > highestSharpe) {
        highestSharpe = metrics.sharpeRatio;
        comparison.highestSharpe = i;
      }
    }
    
    return comparison;
  }

  /**
   * Optimize strategy parameters
   * 
   * @param {Object} config - Base configuration
   * @param {Object} paramRanges - Parameter ranges to optimize
   * @returns {Promise<Object>} - Optimization results
   */
  async optimizeParameters(config, paramRanges) {
    // This would be a more complex implementation
    // For now, just return a placeholder
    return {
      message: 'Parameter optimization not implemented yet'
    };
  }
}

module.exports = BacktestEngine;