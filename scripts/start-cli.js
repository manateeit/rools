#!/usr/bin/env node

/**
 * Trading AI Agent Bot - CLI Starter Script
 * 
 * This script initializes the components and starts the CLI interface.
 */

require('dotenv').config();
const TradingEngine = require('../src/core/tradingEngine');
const AlpacaClient = require('../src/alpaca/client');
const LLMIntegration = require('../src/llm/integration');
const { initializeStorage } = require('../src/storage/supabase');
const { startCLI } = require('../src/cli/interface');

async function main() {
  try {
    console.log('Initializing Trading AI Agent Bot...');
    
    // Check for required environment variables
    const requiredEnvVars = [
      'ALPACA_API_KEY',
      'ALPACA_API_SECRET',
      'OPENAI_API_KEY'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      console.error('Error: Missing required environment variables:');
      missingEnvVars.forEach(varName => console.error(`  - ${varName}`));
      console.error('\nPlease create a .env file with these variables or set them in your environment.');
      process.exit(1);
    }
    
    // Initialize components
    let storage;
    
    try {
      storage = await initializeStorage();
      console.log('✓ Storage initialized');
    } catch (error) {
      console.warn('Warning: Failed to initialize storage. Some features may not work properly.');
      console.warn(`  Error: ${error.message}`);
      // Create a mock storage object
      storage = createMockStorage();
    }
    
    // Initialize Alpaca client
    const alpacaClient = new AlpacaClient({
      apiKey: process.env.ALPACA_API_KEY,
      apiSecret: process.env.ALPACA_API_SECRET,
      paper: process.env.ALPACA_PAPER_TRADING !== 'false' // Default to paper trading
    });
    
    console.log('✓ Alpaca client initialized');
    
    // Initialize LLM integration
    const llmIntegration = new LLMIntegration({
      openaiApiKey: process.env.OPENAI_API_KEY
    });
    
    await llmIntegration.initialize();
    console.log('✓ LLM integration initialized');
    
    // Initialize trading engine
    const tradingEngine = new TradingEngine({
      alpacaClient,
      llmIntegration,
      storage
    });
    
    console.log('✓ Trading engine initialized');
    
    // Start CLI
    await startCLI({
      tradingEngine,
      alpacaClient,
      llmIntegration,
      storage
    });
  } catch (error) {
    console.error('Failed to start CLI:', error);
    process.exit(1);
  }
}

/**
 * Create a mock storage object for when Supabase is not available
 * 
 * @returns {Object} - Mock storage object
 */
function createMockStorage() {
  console.log('Creating mock storage...');
  
  return {
    getUser: async () => ({ id: 'mock-user', email: 'mock@example.com', role: 'user' }),
    getUserByEmail: async () => null,
    updateUserPreferences: async () => ({}),
    storeApiKey: async () => ({ id: 'mock-key' }),
    getApiKey: async () => ({ key: 'mock-key', secret: 'mock-secret' }),
    deleteApiKey: async () => true,
    storeTradeRecord: async (trade) => ({ id: 'mock-trade', ...trade }),
    getTradeHistory: async () => ([]),
    storeBacktestResults: async (backtest) => ({ id: 'mock-backtest', ...backtest }),
    getBacktestResults: async () => ({}),
    listBacktests: async () => ([]),
    storeModelPerformance: async (performance) => ({ id: 'mock-performance', ...performance }),
    getModelPerformance: async () => ([]),
    storeStrategyExecution: async (execution) => ({ id: 'mock-execution', ...execution })
  };
}

// Run the main function
main();