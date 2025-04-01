import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for executing trading strategies
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
    // Get strategy data from request body
    const { strategy, parameters, assets } = req.body;
    
    // Validate required fields
    if (!strategy) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Strategy name is required'
      });
    }
    
    // Initialize trading engine
    const tradingEngine = req.app.tradingEngine;
    
    if (!tradingEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Trading engine not initialized' });
    }
    
    // Get assets to analyze
    let assetsToAnalyze = assets;
    
    // If no assets provided, get positions
    if (!assetsToAnalyze || assetsToAnalyze.length === 0) {
      const positions = await tradingEngine.alpacaClient.getPositions();
      assetsToAnalyze = positions.map(position => position.symbol);
      
      // If still no assets, get some default assets
      if (assetsToAnalyze.length === 0) {
        assetsToAnalyze = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL'];
      }
    }
    
    // Ensure assets is an array
    if (typeof assetsToAnalyze === 'string') {
      assetsToAnalyze = [assetsToAnalyze];
    }
    
    // Execute strategy
    const results = await executeStrategy(req, strategy, parameters, assetsToAnalyze);
    
    // Return results
    return res.status(200).json(results);
  } catch (error) {
    console.error('Execute strategy error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

/**
 * Execute a trading strategy
 * 
 * @param {Object} req - The request object
 * @param {string} strategy - The strategy name
 * @param {Object} parameters - The strategy parameters
 * @param {string[]} assets - The assets to analyze
 * @returns {Array} - The strategy results
 */
async function executeStrategy(req, strategy, parameters, assets) {
  const { user, supabase } = req;
  const tradingEngine = req.app.tradingEngine;
  
  // Get market data for assets
  const marketData = await getMarketData(tradingEngine, assets);
  
  // Execute strategy based on type
  let results = [];
  
  switch (strategy) {
    case 'momentum':
      results = await executeMomentumStrategy(tradingEngine, assets, marketData, parameters);
      break;
    case 'meanReversion':
      results = await executeMeanReversionStrategy(tradingEngine, assets, marketData, parameters);
      break;
    case 'trendFollowing':
      results = await executeTrendFollowingStrategy(tradingEngine, assets, marketData, parameters);
      break;
    case 'llmAssisted':
      results = await executeLLMAssistedStrategy(tradingEngine, assets, marketData, parameters);
      break;
    default:
      throw new Error(`Unsupported strategy: ${strategy}`);
  }
  
  // Store strategy execution in database
  try {
    await supabase
      .from('strategy_executions')
      .insert({
        user_id: user.id,
        strategy,
        parameters,
        assets,
        results,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error storing strategy execution:', error);
    // Don't throw error, just log it
  }
  
  return results;
}

/**
 * Get market data for assets
 * 
 * @param {Object} tradingEngine - The trading engine
 * @param {string[]} assets - The assets to get data for
 * @returns {Object} - The market data
 */
async function getMarketData(tradingEngine, assets) {
  // Get market data for the last 30 days
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  
  const bars = await tradingEngine.alpacaClient.getBars({
    symbols: assets,
    timeframe: '1Day',
    start,
    end
  });
  
  return bars;
}

/**
 * Execute momentum strategy
 * 
 * @param {Object} tradingEngine - The trading engine
 * @param {string[]} assets - The assets to analyze
 * @param {Object} marketData - The market data
 * @param {Object} parameters - The strategy parameters
 * @returns {Array} - The strategy results
 */
async function executeMomentumStrategy(tradingEngine, assets, marketData, parameters) {
  const results = [];
  
  // Default parameters
  const {
    lookbackPeriod = 14,
    overboughtThreshold = 70,
    oversoldThreshold = 30
  } = parameters || {};
  
  // Process each asset
  for (const symbol of assets) {
    const bars = marketData[symbol] || [];
    
    if (bars.length < lookbackPeriod) {
      results.push({
        symbol,
        success: false,
        error: 'Insufficient data for analysis'
      });
      continue;
    }
    
    // Calculate RSI
    const rsi = calculateRSI(bars, lookbackPeriod);
    const currentRSI = rsi[rsi.length - 1];
    
    // Determine action based on RSI
    let action = 'hold';
    let quantity = 0;
    
    if (currentRSI <= oversoldThreshold) {
      action = 'buy';
      quantity = 1; // Simplified for example
    } else if (currentRSI >= overboughtThreshold) {
      action = 'sell';
      quantity = 1; // Simplified for example
    }
    
    // Create decision
    const decision = {
      symbol,
      action,
      quantity,
      price: bars[bars.length - 1].close,
      indicator: 'RSI',
      value: currentRSI,
      timestamp: new Date().toISOString()
    };
    
    // Execute order if action is not hold
    let result = null;
    
    if (action !== 'hold') {
      try {
        result = await tradingEngine.alpacaClient.createOrder({
          symbol,
          qty: quantity,
          side: action,
          type: 'market',
          time_in_force: 'day'
        });
      } catch (error) {
        console.error(`Error executing ${action} order for ${symbol}:`, error);
        results.push({
          symbol,
          success: false,
          decision,
          error: error.message
        });
        continue;
      }
    }
    
    results.push({
      symbol,
      success: true,
      decision,
      result
    });
  }
  
  return results;
}

/**
 * Execute mean reversion strategy
 * 
 * @param {Object} tradingEngine - The trading engine
 * @param {string[]} assets - The assets to analyze
 * @param {Object} marketData - The market data
 * @param {Object} parameters - The strategy parameters
 * @returns {Array} - The strategy results
 */
async function executeMeanReversionStrategy(tradingEngine, assets, marketData, parameters) {
  const results = [];
  
  // Default parameters
  const {
    lookbackPeriod = 20,
    deviationThreshold = 2
  } = parameters || {};
  
  // Process each asset
  for (const symbol of assets) {
    const bars = marketData[symbol] || [];
    
    if (bars.length < lookbackPeriod) {
      results.push({
        symbol,
        success: false,
        error: 'Insufficient data for analysis'
      });
      continue;
    }
    
    // Calculate moving average and standard deviation
    const prices = bars.map(bar => bar.close);
    const ma = calculateMovingAverage(prices, lookbackPeriod);
    const stdDev = calculateStandardDeviation(prices, lookbackPeriod);
    
    const currentPrice = prices[prices.length - 1];
    const currentMA = ma[ma.length - 1];
    const currentStdDev = stdDev[stdDev.length - 1];
    
    // Calculate z-score (deviation from mean in terms of standard deviations)
    const zScore = (currentPrice - currentMA) / currentStdDev;
    
    // Determine action based on z-score
    let action = 'hold';
    let quantity = 0;
    
    if (zScore < -deviationThreshold) {
      action = 'buy';
      quantity = 1; // Simplified for example
    } else if (zScore > deviationThreshold) {
      action = 'sell';
      quantity = 1; // Simplified for example
    }
    
    // Create decision
    const decision = {
      symbol,
      action,
      quantity,
      price: currentPrice,
      indicator: 'Z-Score',
      value: zScore,
      timestamp: new Date().toISOString()
    };
    
    // Execute order if action is not hold
    let result = null;
    
    if (action !== 'hold') {
      try {
        result = await tradingEngine.alpacaClient.createOrder({
          symbol,
          qty: quantity,
          side: action,
          type: 'market',
          time_in_force: 'day'
        });
      } catch (error) {
        console.error(`Error executing ${action} order for ${symbol}:`, error);
        results.push({
          symbol,
          success: false,
          decision,
          error: error.message
        });
        continue;
      }
    }
    
    results.push({
      symbol,
      success: true,
      decision,
      result
    });
  }
  
  return results;
}

/**
 * Execute trend following strategy
 * 
 * @param {Object} tradingEngine - The trading engine
 * @param {string[]} assets - The assets to analyze
 * @param {Object} marketData - The market data
 * @param {Object} parameters - The strategy parameters
 * @returns {Array} - The strategy results
 */
async function executeTrendFollowingStrategy(tradingEngine, assets, marketData, parameters) {
  const results = [];
  
  // Default parameters
  const {
    shortPeriod = 9,
    longPeriod = 21
  } = parameters || {};
  
  // Process each asset
  for (const symbol of assets) {
    const bars = marketData[symbol] || [];
    
    if (bars.length < longPeriod) {
      results.push({
        symbol,
        success: false,
        error: 'Insufficient data for analysis'
      });
      continue;
    }
    
    // Calculate moving averages
    const prices = bars.map(bar => bar.close);
    const shortMA = calculateMovingAverage(prices, shortPeriod);
    const longMA = calculateMovingAverage(prices, longPeriod);
    
    const currentShortMA = shortMA[shortMA.length - 1];
    const currentLongMA = longMA[longMA.length - 1];
    const previousShortMA = shortMA[shortMA.length - 2];
    const previousLongMA = longMA[longMA.length - 2];
    
    // Determine action based on moving average crossover
    let action = 'hold';
    let quantity = 0;
    
    // Buy signal: Short MA crosses above Long MA
    if (previousShortMA <= previousLongMA && currentShortMA > currentLongMA) {
      action = 'buy';
      quantity = 1; // Simplified for example
    }
    // Sell signal: Short MA crosses below Long MA
    else if (previousShortMA >= previousLongMA && currentShortMA < currentLongMA) {
      action = 'sell';
      quantity = 1; // Simplified for example
    }
    
    // Create decision
    const decision = {
      symbol,
      action,
      quantity,
      price: prices[prices.length - 1],
      indicator: 'MA Crossover',
      value: {
        shortMA: currentShortMA,
        longMA: currentLongMA
      },
      timestamp: new Date().toISOString()
    };
    
    // Execute order if action is not hold
    let result = null;
    
    if (action !== 'hold') {
      try {
        result = await tradingEngine.alpacaClient.createOrder({
          symbol,
          qty: quantity,
          side: action,
          type: 'market',
          time_in_force: 'day'
        });
      } catch (error) {
        console.error(`Error executing ${action} order for ${symbol}:`, error);
        results.push({
          symbol,
          success: false,
          decision,
          error: error.message
        });
        continue;
      }
    }
    
    results.push({
      symbol,
      success: true,
      decision,
      result
    });
  }
  
  return results;
}

/**
 * Execute LLM-assisted strategy
 * 
 * @param {Object} tradingEngine - The trading engine
 * @param {string[]} assets - The assets to analyze
 * @param {Object} marketData - The market data
 * @param {Object} parameters - The strategy parameters
 * @returns {Array} - The strategy results
 */
async function executeLLMAssistedStrategy(tradingEngine, assets, marketData, parameters) {
  const results = [];
  
  // Default parameters
  const {
    model = 'gpt-4',
    maxPositions = 5
  } = parameters || {};
  
  // Process each asset
  for (const symbol of assets) {
    const bars = marketData[symbol] || [];
    
    if (bars.length < 10) {
      results.push({
        symbol,
        success: false,
        error: 'Insufficient data for analysis'
      });
      continue;
    }
    
    try {
      // Prepare market data for LLM
      const recentBars = bars.slice(-10);
      const marketDataText = recentBars.map(bar => 
        `Date: ${new Date(bar.timestamp).toLocaleDateString()}, Open: ${bar.open}, High: ${bar.high}, Low: ${bar.low}, Close: ${bar.close}, Volume: ${bar.volume}`
      ).join('\n');
      
      // Get company information
      const companyInfo = await getCompanyInfo(symbol);
      
      // Prepare prompt for LLM
      const prompt = `
        You are an AI trading assistant. Based on the following market data for ${symbol} (${companyInfo.name}), 
        recommend a trading action (buy, sell, or hold) with a brief explanation.
        
        Company Information:
        ${companyInfo.description}
        
        Recent Market Data:
        ${marketDataText}
        
        Current Price: ${recentBars[recentBars.length - 1].close}
        
        Please provide your recommendation in the following JSON format:
        {
          "action": "buy|sell|hold",
          "quantity": number,
          "confidence": number (0-1),
          "reasoning": "brief explanation"
        }
      `;
      
      // Get recommendation from LLM
      const llmResponse = await tradingEngine.llmIntegration.generateResponse(prompt, {
        model,
        temperature: 0.2,
        max_tokens: 500
      });
      
      // Parse LLM response
      let recommendation;
      try {
        // Extract JSON from response
        const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendation = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error(`Error parsing LLM response for ${symbol}:`, parseError);
        results.push({
          symbol,
          success: false,
          error: 'Failed to parse LLM response'
        });
        continue;
      }
      
      // Create decision
      const decision = {
        symbol,
        action: recommendation.action,
        quantity: recommendation.quantity || 1,
        price: recentBars[recentBars.length - 1].close,
        indicator: 'LLM Analysis',
        confidence: recommendation.confidence,
        reasoning: recommendation.reasoning,
        timestamp: new Date().toISOString()
      };
      
      // Execute order if action is not hold and confidence is high enough
      let result = null;
      
      if (recommendation.action !== 'hold' && recommendation.confidence >= 0.7) {
        try {
          result = await tradingEngine.alpacaClient.createOrder({
            symbol,
            qty: decision.quantity,
            side: recommendation.action,
            type: 'market',
            time_in_force: 'day'
          });
        } catch (error) {
          console.error(`Error executing ${recommendation.action} order for ${symbol}:`, error);
          results.push({
            symbol,
            success: false,
            decision,
            error: error.message
          });
          continue;
        }
      }
      
      results.push({
        symbol,
        success: true,
        decision,
        result
      });
    } catch (error) {
      console.error(`Error in LLM-assisted strategy for ${symbol}:`, error);
      results.push({
        symbol,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Get company information
 * 
 * @param {string} symbol - The asset symbol
 * @returns {Object} - The company information
 */
async function getCompanyInfo(symbol) {
  // In a real implementation, this would fetch from an API
  // For now, return some mock data
  const mockCompanyInfo = {
    'AAPL': {
      name: 'Apple Inc.',
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.'
    },
    'MSFT': {
      name: 'Microsoft Corporation',
      description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.'
    },
    'GOOGL': {
      name: 'Alphabet Inc.',
      description: 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.'
    },
    'AMZN': {
      name: 'Amazon.com, Inc.',
      description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.'
    },
    'TSLA': {
      name: 'Tesla, Inc.',
      description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.'
    }
  };
  
  return mockCompanyInfo[symbol] || { name: symbol, description: `${symbol} is a publicly traded company.` };
}

/**
 * Calculate Relative Strength Index (RSI)
 * 
 * @param {Array} bars - The price bars
 * @param {number} period - The lookback period
 * @returns {Array} - The RSI values
 */
function calculateRSI(bars, period) {
  const prices = bars.map(bar => bar.close);
  const gains = [];
  const losses = [];
  
  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
  
  const rsi = [];
  
  // Calculate first RSI
  let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
  rsi.push(100 - (100 / (1 + rs)));
  
  // Calculate remaining RSIs
  for (let i = period; i < prices.length - 1; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
    
    rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    rsi.push(100 - (100 / (1 + rs)));
  }
  
  return rsi;
}

/**
 * Calculate Moving Average
 * 
 * @param {Array} prices - The price array
 * @param {number} period - The lookback period
 * @returns {Array} - The moving average values
 */
function calculateMovingAverage(prices, period) {
  const ma = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((sum, price) => sum + price, 0);
    ma.push(sum / period);
  }
  
  return ma;
}

/**
 * Calculate Standard Deviation
 * 
 * @param {Array} prices - The price array
 * @param {number} period - The lookback period
 * @returns {Array} - The standard deviation values
 */
function calculateStandardDeviation(prices, period) {
  const ma = calculateMovingAverage(prices, period);
  const stdDev = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const windowPrices = prices.slice(i - period + 1, i + 1);
    const mean = ma[i - (period - 1)];
    
    const squaredDiffs = windowPrices.map(price => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period;
    stdDev.push(Math.sqrt(variance));
  }
  
  return stdDev;
}

// Export the handler with authentication middleware
export default createApiHandler(handler);