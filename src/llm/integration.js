/**
 * LLM Integration Layer
 * 
 * Provides a pluggable interface for multiple LLM models and manages
 * interactions with these models for trading decisions.
 */

const { Configuration, OpenAIApi } = require('openai');
const EventEmitter = require('events');

class LLMIntegration extends EventEmitter {
  /**
   * Create a new LLMIntegration instance
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.openaiApiKey - OpenAI API key
   */
  constructor({ openaiApiKey }) {
    super();
    this.config = {
      openaiApiKey
    };
    
    this.models = new Map();
    this.defaultModel = null;
    this.initialized = false;
  }

  /**
   * Initialize the LLM integration
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Initialize OpenAI
      if (this.config.openaiApiKey) {
        const configuration = new Configuration({
          apiKey: this.config.openaiApiKey
        });
        
        const openai = new OpenAIApi(configuration);
        
        // Register OpenAI models
        this.registerModel({
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'openai',
          client: openai,
          maxTokens: 8192,
          temperature: 0.2,
          capabilities: ['trading_decisions', 'market_analysis', 'asset_selection', 'trading_frequency']
        });
        
        this.registerModel({
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'openai',
          client: openai,
          maxTokens: 4096,
          temperature: 0.3,
          capabilities: ['trading_decisions', 'market_analysis', 'asset_selection', 'trading_frequency']
        });
        
        // Set default model
        this.defaultModel = 'gpt-4';
      }
      
      this.initialized = true;
      this.emit('initialized', { models: Array.from(this.models.keys()) });
      
      return true;
    } catch (error) {
      this.emit('error', { message: 'Failed to initialize LLM integration', error });
      throw error;
    }
  }

  /**
   * Register a new LLM model
   * 
   * @param {Object} modelConfig - Model configuration
   * @returns {boolean} - Whether the model was registered successfully
   */
  registerModel(modelConfig) {
    try {
      this.models.set(modelConfig.id, modelConfig);
      this.emit('model-registered', { modelId: modelConfig.id });
      return true;
    } catch (error) {
      this.emit('error', { message: 'Failed to register model', error });
      throw error;
    }
  }

  /**
   * Select appropriate model based on criteria
   * 
   * @param {Object} criteria - Selection criteria
   * @returns {Object} - Selected model configuration
   */
  selectModel(criteria = {}) {
    // If model ID is specified, use that model
    if (criteria.modelId && this.models.has(criteria.modelId)) {
      return this.models.get(criteria.modelId);
    }
    
    // If capability is specified, find models with that capability
    if (criteria.capability) {
      const capableModels = Array.from(this.models.values())
        .filter(model => model.capabilities.includes(criteria.capability));
      
      if (capableModels.length > 0) {
        // Sort by preference (assuming more capable models are registered first)
        return capableModels[0];
      }
    }
    
    // Fall back to default model
    if (this.defaultModel && this.models.has(this.defaultModel)) {
      return this.models.get(this.defaultModel);
    }
    
    throw new Error('No suitable model found');
  }

  /**
   * Generate a prompt for trading decisions
   * 
   * @param {Object} context - Context for the prompt
   * @returns {string} - Generated prompt
   */
  generatePrompt(context) {
    let prompt = '';
    
    switch (context.type) {
      case 'trading_decisions':
        prompt = this.generateTradingDecisionPrompt(context);
        break;
        
      case 'asset_selection':
        prompt = this.generateAssetSelectionPrompt(context);
        break;
        
      case 'trading_frequency':
        prompt = this.generateTradingFrequencyPrompt(context);
        break;
        
      case 'market_analysis':
        prompt = this.generateMarketAnalysisPrompt(context);
        break;
        
      default:
        throw new Error(`Unknown prompt type: ${context.type}`);
    }
    
    return prompt;
  }

  /**
   * Generate a prompt for trading decisions
   * 
   * @param {Object} context - Context for the prompt
   * @returns {string} - Generated prompt
   */
  generateTradingDecisionPrompt(context) {
    const { strategy, assets, marketData, positions } = context;
    
    let prompt = `You are an AI trading assistant. Based on the following market data and current positions, provide trading decisions for each asset according to the strategy.

Strategy: ${strategy.name}
Strategy Description: ${strategy.description}

Current Positions:
`;

    if (positions && positions.length > 0) {
      positions.forEach(position => {
        prompt += `- ${position.symbol}: ${position.quantity} shares at $${position.entryPrice} (Current: $${position.currentPrice}, P&L: ${position.unrealizedPLPercent.toFixed(2)}%)\n`;
      });
    } else {
      prompt += 'No current positions.\n';
    }

    prompt += '\nMarket Data:\n';
    
    assets.forEach(symbol => {
      const data = marketData[symbol];
      
      if (data && data.length > 0) {
        const latestData = data[data.length - 1];
        prompt += `- ${symbol}: Open $${latestData.open}, High $${latestData.high}, Low $${latestData.low}, Close $${latestData.close}, Volume ${latestData.volume}\n`;
        
        // Add price change
        if (data.length > 1) {
          const previousClose = data[data.length - 2].close;
          const priceChange = ((latestData.close - previousClose) / previousClose) * 100;
          prompt += `  Price Change: ${priceChange.toFixed(2)}%\n`;
        }
      }
    });

    prompt += `
For each asset, provide one of the following decisions:
1. BUY: Purchase shares of the asset
2. SELL: Sell shares of the asset
3. HOLD: Maintain current position

Format your response as a JSON array with the following structure:
[
  {
    "symbol": "AAPL",
    "action": "buy",
    "quantity": 10,
    "reasoning": "Brief explanation of the decision"
  },
  ...
]

Ensure your decisions align with the strategy and consider current market conditions. Provide clear reasoning for each decision.`;

    return prompt;
  }

  /**
   * Generate a prompt for asset selection
   * 
   * @param {Object} context - Context for the prompt
   * @returns {string} - Generated prompt
   */
  generateAssetSelectionPrompt(context) {
    const { assets, criteria } = context;
    
    let prompt = `You are an AI trading assistant. Based on the following list of assets and selection criteria, select the most promising assets for trading.

Selection Criteria:
`;

    Object.entries(criteria).forEach(([key, value]) => {
      if (key !== 'useAI' && key !== 'maxAssets') {
        prompt += `- ${key}: ${value}\n`;
      }
    });

    prompt += `
Maximum number of assets to select: ${criteria.maxAssets}

Available Assets:
`;

    assets.slice(0, 100).forEach(asset => {
      prompt += `- ${asset.symbol}: ${asset.name} (${asset.exchange})\n`;
    });

    if (assets.length > 100) {
      prompt += `... and ${assets.length - 100} more assets\n`;
    }

    prompt += `
Select up to ${criteria.maxAssets} assets that best match the criteria. Consider factors such as volatility, liquidity, sector diversity, and potential for growth.

Format your response as a JSON object with the following structure:
{
  "assets": ["AAPL", "MSFT", "GOOGL", ...],
  "reasoning": "Brief explanation of your selection criteria and methodology"
}

Ensure your selection is diverse and aligns with the provided criteria.`;

    return prompt;
  }

  /**
   * Generate a prompt for trading frequency determination
   * 
   * @param {Object} context - Context for the prompt
   * @returns {string} - Generated prompt
   */
  generateTradingFrequencyPrompt(context) {
    const { marketConditions } = context;
    
    let prompt = `You are an AI trading assistant. Based on the following market conditions, recommend an optimal trading frequency.

Market Conditions:
`;

    Object.entries(marketConditions).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`;
    });

    prompt += `
Possible trading frequencies:
1. high_frequency: Multiple trades per hour
2. medium_frequency: Multiple trades per day
3. daily: One trade per day
4. weekly: One trade per week

Consider factors such as market volatility, trading volume, trend strength, and overall market sentiment.

Format your response as a JSON object with the following structure:
{
  "frequency": "medium_frequency",
  "reasoning": "Brief explanation of your recommendation"
}

Ensure your recommendation is appropriate for the current market conditions.`;

    return prompt;
  }

  /**
   * Generate a prompt for market analysis
   * 
   * @param {Object} context - Context for the prompt
   * @returns {string} - Generated prompt
   */
  generateMarketAnalysisPrompt(context) {
    const { assets, marketData, timeframe } = context;
    
    let prompt = `You are an AI trading assistant. Based on the following market data, provide an analysis of the market conditions and trends.

Timeframe: ${timeframe}

Market Data:
`;

    assets.forEach(symbol => {
      const data = marketData[symbol];
      
      if (data && data.length > 0) {
        prompt += `\n${symbol}:\n`;
        
        // Show the last 5 data points
        const lastFiveData = data.slice(-5);
        
        lastFiveData.forEach(dataPoint => {
          prompt += `- ${new Date(dataPoint.timestamp).toISOString().split('T')[0]}: Open $${dataPoint.open}, High $${dataPoint.high}, Low $${dataPoint.low}, Close $${dataPoint.close}, Volume ${dataPoint.volume}\n`;
        });
        
        // Calculate overall change
        const firstClose = data[0].close;
        const lastClose = data[data.length - 1].close;
        const overallChange = ((lastClose - firstClose) / firstClose) * 100;
        
        prompt += `  Overall Change: ${overallChange.toFixed(2)}%\n`;
      }
    });

    prompt += `
Provide a comprehensive market analysis including:
1. Overall market trend
2. Key support and resistance levels
3. Volume analysis
4. Potential catalysts
5. Risk assessment

Format your response as a JSON object with the following structure:
{
  "market_trend": "bullish/bearish/neutral",
  "analysis": "Detailed market analysis",
  "key_levels": {
    "support": [level1, level2, ...],
    "resistance": [level1, level2, ...]
  },
  "volume_analysis": "Analysis of trading volume",
  "catalysts": ["Potential catalyst 1", "Potential catalyst 2", ...],
  "risk_assessment": "Assessment of market risks"
}

Ensure your analysis is data-driven and provides actionable insights.`;

    return prompt;
  }

  /**
   * Get a decision from an LLM model
   * 
   * @param {Object} context - Context for the decision
   * @param {string} modelId - Model ID (optional)
   * @returns {Promise<Object>} - LLM decision
   */
  async getDecision(context, modelId = null) {
    try {
      // Set default type if not provided
      if (!context.type && context.strategy) {
        context.type = 'trading_decisions';
      }
      
      // Select model
      const model = this.selectModel({ 
        modelId, 
        capability: context.type 
      });
      
      // Generate prompt
      const prompt = this.generatePrompt(context);
      
      // Get response from model
      const response = await this.callModel(model, prompt);
      
      // Parse response
      const decision = this.parseResponse(response, context.type);
      
      // Track model performance
      this.trackPerformance(model.id, context, decision);
      
      return decision;
    } catch (error) {
      this.emit('error', { message: 'Failed to get decision from LLM', error });
      
      // Try fallback model if available
      if (error.message.includes('No suitable model found') || error.message.includes('Failed to call model')) {
        const fallbackModelId = this.getFallbackModel(modelId);
        
        if (fallbackModelId && fallbackModelId !== modelId) {
          this.emit('using-fallback-model', { originalModelId: modelId, fallbackModelId });
          return this.getDecision(context, fallbackModelId);
        }
      }
      
      throw error;
    }
  }

  /**
   * Call an LLM model
   * 
   * @param {Object} model - Model configuration
   * @param {string} prompt - Prompt to send to the model
   * @returns {Promise<string>} - Model response
   */
  async callModel(model, prompt) {
    try {
      let response;
      
      switch (model.provider) {
        case 'openai':
          response = await model.client.createChatCompletion({
            model: model.id,
            messages: [
              { role: 'system', content: 'You are an AI trading assistant that provides concise, accurate responses in the requested JSON format.' },
              { role: 'user', content: prompt }
            ],
            temperature: model.temperature,
            max_tokens: model.maxTokens
          });
          
          return response.data.choices[0].message.content;
          
        // Add support for other providers here
          
        default:
          throw new Error(`Unsupported provider: ${model.provider}`);
      }
    } catch (error) {
      this.emit('error', { message: 'Failed to call model', error });
      throw error;
    }
  }

  /**
   * Parse the response from an LLM model
   * 
   * @param {string} response - Model response
   * @param {string} type - Decision type
   * @returns {Object} - Parsed decision
   */
  parseResponse(response, type) {
    try {
      // Extract JSON from response (in case the model includes additional text)
      const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const jsonString = jsonMatch[0];
      const decision = JSON.parse(jsonString);
      
      // Validate decision based on type
      switch (type) {
        case 'trading_decisions':
          if (!Array.isArray(decision)) {
            throw new Error('Trading decisions must be an array');
          }
          
          decision.forEach(item => {
            if (!item.symbol || !item.action || !item.reasoning) {
              throw new Error('Each trading decision must include symbol, action, and reasoning');
            }
            
            if (!['buy', 'sell', 'hold'].includes(item.action.toLowerCase())) {
              throw new Error(`Invalid action: ${item.action}`);
            }
            
            // Normalize action to lowercase
            item.action = item.action.toLowerCase();
            
            // Ensure quantity is a number for buy/sell actions
            if (item.action !== 'hold' && (!item.quantity || isNaN(item.quantity))) {
              throw new Error(`Quantity must be a number for ${item.action} action`);
            }
          });
          break;
          
        case 'asset_selection':
          if (!decision.assets || !Array.isArray(decision.assets)) {
            throw new Error('Asset selection must include an assets array');
          }
          break;
          
        case 'trading_frequency':
          if (!decision.frequency) {
            throw new Error('Trading frequency decision must include a frequency');
          }
          
          if (!['high_frequency', 'medium_frequency', 'daily', 'weekly'].includes(decision.frequency)) {
            throw new Error(`Invalid frequency: ${decision.frequency}`);
          }
          break;
          
        case 'market_analysis':
          if (!decision.market_trend || !decision.analysis) {
            throw new Error('Market analysis must include market_trend and analysis');
          }
          break;
      }
      
      return decision;
    } catch (error) {
      this.emit('error', { message: 'Failed to parse response', error, response });
      throw error;
    }
  }

  /**
   * Track model performance
   * 
   * @param {string} modelId - Model ID
   * @param {Object} context - Decision context
   * @param {Object} decision - Model decision
   * @returns {Promise<void>}
   */
  async trackPerformance(modelId, context, decision) {
    try {
      // Store decision for later evaluation
      const performanceData = {
        modelId,
        context: {
          type: context.type,
          timestamp: new Date()
        },
        decision
      };
      
      // Emit event for storage layer to handle
      this.emit('decision-made', performanceData);
      
      return performanceData;
    } catch (error) {
      this.emit('error', { message: 'Failed to track performance', error });
      // Non-critical error, don't throw
    }
  }

  /**
   * Get a fallback model
   * 
   * @param {string} modelId - Current model ID
   * @returns {string|null} - Fallback model ID
   */
  getFallbackModel(modelId) {
    // If current model is GPT-4, fall back to GPT-3.5-Turbo
    if (modelId === 'gpt-4' && this.models.has('gpt-3.5-turbo')) {
      return 'gpt-3.5-turbo';
    }
    
    // If no specific fallback, use default model
    if (this.defaultModel && this.defaultModel !== modelId && this.models.has(this.defaultModel)) {
      return this.defaultModel;
    }
    
    // If no default model, use the first available model
    const availableModels = Array.from(this.models.keys());
    
    if (availableModels.length > 0 && availableModels[0] !== modelId) {
      return availableModels[0];
    }
    
    return null;
  }
}

module.exports = LLMIntegration;