/**
 * Trading AI Agent Bot - Main Entry Point
 * 
 * This is the main entry point for the Trading AI Agent Bot application.
 * It initializes the core components and starts the appropriate interface
 * based on the command-line arguments.
 */

require('dotenv').config();
const { program } = require('commander');
const TradingEngine = require('./core/tradingEngine');
const AlpacaClient = require('./alpaca/client');
const LLMIntegration = require('./llm/integration');
const { initializeStorage } = require('./storage/supabase');
const { startCLI } = require('./cli/interface');
const { startWebServer } = require('./web/server');

// Initialize the application
async function initialize() {
  console.log('Initializing Trading AI Agent Bot...');
  
  try {
    // Initialize storage
    const storage = await initializeStorage();
    
    // Initialize Alpaca client
    const alpacaClient = new AlpacaClient({
      apiKey: process.env.ALPACA_API_KEY,
      apiSecret: process.env.ALPACA_API_SECRET,
      paper: process.env.ALPACA_PAPER_TRADING === 'true'
    });
    
    // Initialize LLM integration
    const llmIntegration = new LLMIntegration({
      openaiApiKey: process.env.OPENAI_API_KEY
    });
    
    // Initialize trading engine
    const tradingEngine = new TradingEngine({
      alpacaClient,
      llmIntegration,
      storage
    });
    
    return {
      tradingEngine,
      alpacaClient,
      llmIntegration,
      storage
    };
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Define command-line interface
program
  .version('0.1.0')
  .description('Trading AI Agent Bot - LLM-powered trading with Alpaca API');

// CLI mode command
program
  .command('cli')
  .description('Start the command-line interface')
  .action(async () => {
    const components = await initialize();
    await startCLI(components);
  });

// Web mode command
program
  .command('web')
  .description('Start the web interface')
  .option('-p, --port <port>', 'Port to run the server on', process.env.PORT || 3000)
  .action(async (options) => {
    const components = await initialize();
    await startWebServer(components, options.port);
  });

// Parse command-line arguments
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}