/**
 * Web Server
 * 
 * Express server for the Trading AI Agent Bot web interface.
 */

const express = require('express');
const next = require('next');
const path = require('path');
const bodyParser = require('body-parser');

/**
 * Start the web server
 * 
 * @param {Object} components - Initialized components
 * @param {number} port - Port to run the server on
 * @returns {Promise<void>}
 */
async function startWebServer(components, port = 3000) {
  const { tradingEngine, alpacaClient, llmIntegration, storage } = components;
  
  // Initialize Next.js
  const dev = process.env.NODE_ENV !== 'production';
  const nextApp = next({ dev, dir: path.join(__dirname, '../../web') });
  const handle = nextApp.getRequestHandler();
  
  try {
    await nextApp.prepare();
    const app = express();
    
    // Middleware
    app.use(bodyParser.json());
    
    // API routes
    setupApiRoutes(app, components);
    
    // Next.js handler for all other routes
    app.all('*', (req, res) => {
      return handle(req, res);
    });
    
    // Start server
    app.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Web server ready on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting web server:', error);
    process.exit(1);
  }
}

/**
 * Set up API routes
 * 
 * @param {Object} app - Express app
 * @param {Object} components - Initialized components
 */
function setupApiRoutes(app, components) {
  const { tradingEngine, alpacaClient, llmIntegration, storage } = components;
  
  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // This would be handled by Supabase Auth in a real implementation
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/auth/logout', async (req, res) => {
    try {
      // This would be handled by Supabase Auth in a real implementation
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/auth/user', async (req, res) => {
    try {
      // This would be handled by Supabase Auth in a real implementation
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Trading routes
  app.get('/api/trading/account', async (req, res) => {
    try {
      const account = await alpacaClient.getAccountInfo();
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/trading/positions', async (req, res) => {
    try {
      const positions = await alpacaClient.getPositions();
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/trading/orders', async (req, res) => {
    try {
      const order = await alpacaClient.placeOrder(req.body);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/trading/market-data', async (req, res) => {
    try {
      const { symbols, timeframe, limit } = req.query;
      
      if (!symbols) {
        return res.status(400).json({ error: 'Symbols are required' });
      }
      
      const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
      const marketData = await alpacaClient.getMarketData(
        symbolList,
        timeframe || '1D',
        limit ? parseInt(limit) : 10
      );
      
      res.json(marketData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/trading/strategy', async (req, res) => {
    try {
      const { strategy, assets } = req.body;
      
      if (!strategy || !assets || !Array.isArray(assets)) {
        return res.status(400).json({ error: 'Strategy and assets array are required' });
      }
      
      const results = await tradingEngine.executeStrategy(strategy, assets);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Backtesting routes
  app.post('/api/backtest/run', async (req, res) => {
    try {
      // This would require implementing a backtesting engine
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/backtest/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const backtest = await storage.getBacktestResults(id);
      res.json(backtest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/backtest/list', async (req, res) => {
    try {
      const backtests = await storage.listBacktests(req.query);
      res.json(backtests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Configuration routes
  app.get('/api/config/preferences', async (req, res) => {
    try {
      // This would require user authentication
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/config/preferences', async (req, res) => {
    try {
      // This would require user authentication
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/config/api-keys', async (req, res) => {
    try {
      // This would require user authentication
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/config/api-keys', async (req, res) => {
    try {
      // This would require user authentication
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete('/api/config/api-keys/:id', async (req, res) => {
    try {
      // This would require user authentication
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/api/config/models', async (req, res) => {
    try {
      const models = Array.from(llmIntegration.models.entries()).map(([id, model]) => ({
        id,
        name: model.name,
        provider: model.provider,
        capabilities: model.capabilities,
        isDefault: id === llmIntegration.defaultModel
      }));
      
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/api/config/models', async (req, res) => {
    try {
      // This would require user authentication and more implementation
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = {
  startWebServer
};