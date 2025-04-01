/**
 * CLI Interface
 * 
 * Command-line interface for the Trading AI Agent Bot.
 */

const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * Start the CLI interface
 * 
 * @param {Object} components - Initialized components
 * @returns {Promise<void>}
 */
async function startCLI(components) {
  const { tradingEngine, alpacaClient, llmIntegration, storage } = components;
  
  console.log(chalk.blue('='.repeat(50)));
  console.log(chalk.blue.bold('Trading AI Agent Bot - CLI Interface'));
  console.log(chalk.blue('='.repeat(50)));
  
  // Initialize trading engine
  await tradingEngine.initialize();
  
  let running = true;
  
  while (running) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Account Information', value: 'account' },
          { name: 'Market Data', value: 'market' },
          { name: 'Trading', value: 'trading' },
          { name: 'Backtesting', value: 'backtest' },
          { name: 'Configuration', value: 'config' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);
    
    switch (action) {
      case 'account':
        await handleAccountActions(alpacaClient);
        break;
        
      case 'market':
        await handleMarketActions(alpacaClient);
        break;
        
      case 'trading':
        await handleTradingActions(tradingEngine, alpacaClient, llmIntegration);
        break;
        
      case 'backtest':
        await handleBacktestActions(tradingEngine, alpacaClient, llmIntegration, storage);
        break;
        
      case 'config':
        await handleConfigActions(tradingEngine, llmIntegration, storage);
        break;
        
      case 'exit':
        running = false;
        console.log(chalk.yellow('Exiting Trading AI Agent Bot...'));
        break;
    }
  }
  
  // Cleanup
  await tradingEngine.stop();
  process.exit(0);
}

/**
 * Handle account-related actions
 * 
 * @param {Object} alpacaClient - Initialized Alpaca client
 * @returns {Promise<void>}
 */
async function handleAccountActions(alpacaClient) {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Account Actions:',
      choices: [
        { name: 'View Account Information', value: 'info' },
        { name: 'View Positions', value: 'positions' },
        { name: 'Back to Main Menu', value: 'back' }
      ]
    }
  ]);
  
  switch (action) {
    case 'info':
      try {
        const account = await alpacaClient.getAccountInfo();
        
        console.log(chalk.green('=== Account Information ==='));
        console.log(chalk.green(`Status: ${account.status}`));
        console.log(chalk.green(`Currency: ${account.currency}`));
        console.log(chalk.green(`Cash: $${account.cash.toFixed(2)}`));
        console.log(chalk.green(`Portfolio Value: $${account.portfolioValue.toFixed(2)}`));
        console.log(chalk.green(`Buying Power: $${account.buyingPower.toFixed(2)}`));
        console.log(chalk.green(`Daytrade Count: ${account.daytradeCount}`));
        console.log(chalk.green(`Account Type: ${account.isPaperAccount ? 'Paper' : 'Live'}`));
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
      break;
      
    case 'positions':
      try {
        const positions = await alpacaClient.getPositions();
        
        if (positions.length === 0) {
          console.log(chalk.yellow('No open positions.'));
          break;
        }
        
        console.log(chalk.green('=== Current Positions ==='));
        positions.forEach(position => {
          const unrealizedPL = parseFloat(position.unrealized_pl);
          const unrealizedPLPercent = parseFloat(position.unrealized_plpc) * 100;
          const plColor = unrealizedPL >= 0 ? chalk.green : chalk.red;
          
          console.log(chalk.blue(`${position.symbol}: ${position.qty} shares @ $${position.avg_entry_price}`));
          console.log(`  Current Price: $${position.current_price}`);
          console.log(`  Market Value: $${position.market_value}`);
          console.log(`  Unrealized P&L: ${plColor(`$${unrealizedPL.toFixed(2)} (${unrealizedPLPercent.toFixed(2)}%)`)}`);
          console.log('---');
        });
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
      break;
      
    case 'back':
      return;
  }
}

/**
 * Handle market-related actions
 * 
 * @param {Object} alpacaClient - Initialized Alpaca client
 * @returns {Promise<void>}
 */
async function handleMarketActions(alpacaClient) {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Market Actions:',
      choices: [
        { name: 'Get Market Data', value: 'data' },
        { name: 'Back to Main Menu', value: 'back' }
      ]
    }
  ]);
  
  switch (action) {
    case 'data':
      const { symbols } = await inquirer.prompt([
        {
          type: 'input',
          name: 'symbols',
          message: 'Enter symbols (comma-separated):',
          validate: input => input.trim() !== '' || 'Please enter at least one symbol'
        }
      ]);
      
      const { timeframe } = await inquirer.prompt([
        {
          type: 'list',
          name: 'timeframe',
          message: 'Select timeframe:',
          choices: [
            { name: '1 Minute', value: '1Min' },
            { name: '5 Minutes', value: '5Min' },
            { name: '15 Minutes', value: '15Min' },
            { name: '1 Hour', value: '1H' },
            { name: '1 Day', value: '1D' }
          ]
        }
      ]);
      
      const { limit } = await inquirer.prompt([
        {
          type: 'number',
          name: 'limit',
          message: 'Number of bars to retrieve:',
          default: 10,
          validate: input => input > 0 || 'Please enter a positive number'
        }
      ]);
      
      try {
        const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
        const marketData = await alpacaClient.getMarketData(symbolList, timeframe, limit);
        
        console.log(chalk.green('=== Market Data ==='));
        
        for (const symbol of symbolList) {
          const data = marketData[symbol];
          
          if (!data || data.length === 0) {
            console.log(chalk.yellow(`No data available for ${symbol}`));
            continue;
          }
          
          console.log(chalk.blue(`${symbol} (${timeframe}):`));
          
          data.forEach(bar => {
            const date = new Date(bar.timestamp).toLocaleString();
            console.log(`  ${date}: Open $${bar.open.toFixed(2)}, High $${bar.high.toFixed(2)}, Low $${bar.low.toFixed(2)}, Close $${bar.close.toFixed(2)}, Volume ${bar.volume}`);
          });
          
          console.log('---');
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
      break;
      
    case 'back':
      return;
  }
}

/**
 * Handle trading-related actions
 * 
 * @param {Object} tradingEngine - Initialized trading engine
 * @param {Object} alpacaClient - Initialized Alpaca client
 * @param {Object} llmIntegration - Initialized LLM integration
 * @returns {Promise<void>}
 */
async function handleTradingActions(tradingEngine, alpacaClient, llmIntegration) {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Trading Actions:',
      choices: [
        { name: 'Execute Trading Strategy', value: 'strategy' },
        { name: 'Place Manual Order', value: 'order' },
        { name: 'View Orders', value: 'view' },
        { name: 'Back to Main Menu', value: 'back' }
      ]
    }
  ]);
  
  switch (action) {
    case 'strategy':
      const { strategyName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'strategyName',
          message: 'Enter strategy name:',
          default: 'Basic Trading Strategy',
          validate: input => input.trim() !== '' || 'Please enter a strategy name'
        }
      ]);
      
      const { strategyDescription } = await inquirer.prompt([
        {
          type: 'input',
          name: 'strategyDescription',
          message: 'Enter strategy description:',
          default: 'A basic trading strategy using LLM for decision making',
          validate: input => input.trim() !== '' || 'Please enter a strategy description'
        }
      ]);
      
      const { symbols } = await inquirer.prompt([
        {
          type: 'input',
          name: 'symbols',
          message: 'Enter symbols to trade (comma-separated):',
          validate: input => input.trim() !== '' || 'Please enter at least one symbol'
        }
      ]);
      
      try {
        const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
        
        console.log(chalk.yellow('Executing trading strategy...'));
        
        const results = await tradingEngine.executeStrategy(
          {
            name: strategyName,
            description: strategyDescription
          },
          symbolList
        );
        
        console.log(chalk.green('=== Strategy Execution Results ==='));
        
        results.forEach(result => {
          const symbol = result.decision.symbol;
          const action = result.decision.action.toUpperCase();
          const actionColor = action === 'BUY' ? chalk.green : (action === 'SELL' ? chalk.red : chalk.blue);
          
          console.log(`${symbol}: ${actionColor(action)}`);
          console.log(`  Reasoning: ${result.decision.reasoning}`);
          
          if (result.success) {
            if (action !== 'HOLD') {
              console.log(`  Order ID: ${result.result.id}`);
              console.log(`  Status: ${result.result.status}`);
              console.log(`  Quantity: ${result.result.quantity}`);
            } else {
              console.log('  No order placed (HOLD)');
            }
          } else {
            console.log(chalk.red(`  Error: ${result.error}`));
          }
          
          console.log('---');
        });
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
      break;
      
    case 'order':
      const { orderSymbol } = await inquirer.prompt([
        {
          type: 'input',
          name: 'orderSymbol',
          message: 'Enter symbol:',
          validate: input => input.trim() !== '' || 'Please enter a symbol'
        }
      ]);
      
      const { orderSide } = await inquirer.prompt([
        {
          type: 'list',
          name: 'orderSide',
          message: 'Select order side:',
          choices: [
            { name: 'Buy', value: 'buy' },
            { name: 'Sell', value: 'sell' }
          ]
        }
      ]);
      
      const { orderQuantity } = await inquirer.prompt([
        {
          type: 'number',
          name: 'orderQuantity',
          message: 'Enter quantity:',
          validate: input => input > 0 || 'Please enter a positive number'
        }
      ]);
      
      const { orderType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'orderType',
          message: 'Select order type:',
          choices: [
            { name: 'Market', value: 'market' },
            { name: 'Limit', value: 'limit' },
            { name: 'Stop', value: 'stop' },
            { name: 'Stop Limit', value: 'stop_limit' }
          ]
        }
      ]);
      
      let orderParams = {
        symbol: orderSymbol.toUpperCase(),
        qty: orderQuantity,
        side: orderSide,
        type: orderType,
        time_in_force: 'day'
      };
      
      if (orderType === 'limit' || orderType === 'stop_limit') {
        const { limitPrice } = await inquirer.prompt([
          {
            type: 'number',
            name: 'limitPrice',
            message: 'Enter limit price:',
            validate: input => input > 0 || 'Please enter a positive number'
          }
        ]);
        
        orderParams.limit_price = limitPrice;
      }
      
      if (orderType === 'stop' || orderType === 'stop_limit') {
        const { stopPrice } = await inquirer.prompt([
          {
            type: 'number',
            name: 'stopPrice',
            message: 'Enter stop price:',
            validate: input => input > 0 || 'Please enter a positive number'
          }
        ]);
        
        orderParams.stop_price = stopPrice;
      }
      
      try {
        console.log(chalk.yellow('Placing order...'));
        
        const order = await alpacaClient.placeOrder(orderParams);
        
        console.log(chalk.green('=== Order Placed ==='));
        console.log(chalk.green(`Order ID: ${order.id}`));
        console.log(chalk.green(`Symbol: ${order.symbol}`));
        console.log(chalk.green(`Side: ${order.side}`));
        console.log(chalk.green(`Quantity: ${order.quantity}`));
        console.log(chalk.green(`Type: ${order.type}`));
        console.log(chalk.green(`Status: ${order.status}`));
        
        if (order.limit_price) {
          console.log(chalk.green(`Limit Price: $${order.limit_price}`));
        }
        
        if (order.stop_price) {
          console.log(chalk.green(`Stop Price: $${order.stop_price}`));
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
      break;
      
    case 'view':
      // This would require additional implementation in the Alpaca client
      console.log(chalk.yellow('Feature not implemented yet.'));
      break;
      
    case 'back':
      return;
  }
}

/**
 * Handle backtesting-related actions
 * 
 * @param {Object} tradingEngine - Initialized trading engine
 * @param {Object} alpacaClient - Initialized Alpaca client
 * @param {Object} llmIntegration - Initialized LLM integration
 * @param {Object} storage - Initialized storage
 * @returns {Promise<void>}
 */
async function handleBacktestActions(tradingEngine, alpacaClient, llmIntegration, storage) {
  // This would require implementing a backtesting engine
  console.log(chalk.yellow('Backtesting feature not implemented yet.'));
}

/**
 * Handle configuration-related actions
 * 
 * @param {Object} tradingEngine - Initialized trading engine
 * @param {Object} llmIntegration - Initialized LLM integration
 * @param {Object} storage - Initialized storage
 * @returns {Promise<void>}
 */
async function handleConfigActions(tradingEngine, llmIntegration, storage) {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Configuration Actions:',
      choices: [
        { name: 'View Trading Engine Configuration', value: 'engine' },
        { name: 'View LLM Models', value: 'models' },
        { name: 'Back to Main Menu', value: 'back' }
      ]
    }
  ]);
  
  switch (action) {
    case 'engine':
      console.log(chalk.green('=== Trading Engine Configuration ==='));
      console.log(chalk.green(`Trading Frequency: ${tradingEngine.config.tradingFrequency}`));
      console.log(chalk.green(`Risk Level: ${tradingEngine.config.riskLevel}`));
      console.log(chalk.green(`Max Positions: ${tradingEngine.config.maxPositions}`));
      console.log(chalk.green(`Paper Trading: ${tradingEngine.config.paperTrading ? 'Enabled' : 'Disabled'}`));
      break;
      
    case 'models':
      console.log(chalk.green('=== Available LLM Models ==='));
      
      for (const [modelId, model] of llmIntegration.models.entries()) {
        console.log(chalk.blue(`${model.name} (${modelId})`));
        console.log(`  Provider: ${model.provider}`);
        console.log(`  Max Tokens: ${model.maxTokens}`);
        console.log(`  Temperature: ${model.temperature}`);
        console.log(`  Capabilities: ${model.capabilities.join(', ')}`);
        console.log(`  Default: ${modelId === llmIntegration.defaultModel ? 'Yes' : 'No'}`);
        console.log('---');
      }
      break;
      
    case 'back':
      return;
  }
}

module.exports = {
  startCLI
};