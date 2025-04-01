/**
 * Supabase Storage Layer
 * 
 * Manages persistent storage of trading data, configurations, and results
 * using Supabase as the backend.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

/**
 * Initialize the storage layer
 * 
 * @returns {Promise<Object>} - Storage interface
 */
async function initializeStorage() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key are required');
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test connection
  const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
  
  if (error) {
    throw new Error(`Failed to connect to Supabase: ${error.message}`);
  }
  
  // Encryption key for sensitive data
  const encryptionKey = process.env.API_KEY_ENCRYPTION_KEY;
  
  if (!encryptionKey || encryptionKey.length < 32) {
    console.warn('Warning: API_KEY_ENCRYPTION_KEY is missing or too short. Sensitive data will not be properly encrypted.');
  }
  
  return {
    /**
     * Get user by ID
     * 
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - User data
     */
    async getUser(userId) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw new Error(`Failed to get user: ${error.message}`);
      }
      
      return data;
    },
    
    /**
     * Get user by email
     * 
     * @param {string} email - User email
     * @returns {Promise<Object>} - User data
     */
    async getUserByEmail(email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw new Error(`Failed to get user by email: ${error.message}`);
      }
      
      return data;
    },
    
    /**
     * Update user preferences
     * 
     * @param {string} userId - User ID
     * @param {Object} preferences - User preferences
     * @returns {Promise<Object>} - Updated user data
     */
    async updateUserPreferences(userId, preferences) {
      const { data, error } = await supabase
        .from('users')
        .update({ preferences, updated_at: new Date() })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to update user preferences: ${error.message}`);
      }
      
      return data;
    },
    
    /**
     * Store API key
     * 
     * @param {Object} apiKey - API key data
     * @returns {Promise<Object>} - Stored API key data
     */
    async storeApiKey(apiKey) {
      // Encrypt sensitive data
      const encryptedKey = encryptData(apiKey.key, encryptionKey);
      const encryptedSecret = encryptData(apiKey.secret, encryptionKey);
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: apiKey.userId,
          provider: apiKey.provider,
          encrypted_key: encryptedKey,
          encrypted_secret: encryptedSecret,
          is_paper: apiKey.isPaper
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to store API key: ${error.message}`);
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        provider: data.provider,
        isPaper: data.is_paper,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    
    /**
     * Get API key
     * 
     * @param {string} userId - User ID
     * @param {string} provider - API provider
     * @param {boolean} isPaper - Whether to get paper trading key
     * @returns {Promise<Object>} - API key data
     */
    async getApiKey(userId, provider, isPaper = true) {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', provider)
        .eq('is_paper', isPaper)
        .single();
      
      if (error) {
        throw new Error(`Failed to get API key: ${error.message}`);
      }
      
      // Decrypt sensitive data
      const key = decryptData(data.encrypted_key, encryptionKey);
      const secret = decryptData(data.encrypted_secret, encryptionKey);
      
      return {
        id: data.id,
        userId: data.user_id,
        provider: data.provider,
        key,
        secret,
        isPaper: data.is_paper,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    
    /**
     * Delete API key
     * 
     * @param {string} keyId - API key ID
     * @returns {Promise<boolean>} - Whether the key was deleted
     */
    async deleteApiKey(keyId) {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);
      
      if (error) {
        throw new Error(`Failed to delete API key: ${error.message}`);
      }
      
      return true;
    },
    
    /**
     * Store trade record
     * 
     * @param {Object} trade - Trade data
     * @returns {Promise<Object>} - Stored trade data
     */
    async storeTradeRecord(trade) {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: trade.userId,
          symbol: trade.symbol,
          side: trade.side,
          quantity: trade.quantity,
          price: trade.price,
          order_id: trade.orderId,
          status: trade.status,
          executed_at: trade.executedAt,
          strategy: trade.strategy,
          model_id: trade.modelId,
          is_paper: trade.isPaper
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to store trade record: ${error.message}`);
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        symbol: data.symbol,
        side: data.side,
        quantity: data.quantity,
        price: data.price,
        orderId: data.order_id,
        status: data.status,
        executedAt: data.executed_at,
        createdAt: data.created_at,
        strategy: data.strategy,
        modelId: data.model_id,
        isPaper: data.is_paper
      };
    },
    
    /**
     * Get trade history
     * 
     * @param {Object} filters - Filters for trade history
     * @returns {Promise<Array<Object>>} - Trade history
     */
    async getTradeHistory(filters = {}) {
      let query = supabase
        .from('trades')
        .select('*');
      
      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.symbol) {
        query = query.eq('symbol', filters.symbol);
      }
      
      if (filters.side) {
        query = query.eq('side', filters.side);
      }
      
      if (filters.strategy) {
        query = query.eq('strategy', filters.strategy);
      }
      
      if (filters.modelId) {
        query = query.eq('model_id', filters.modelId);
      }
      
      if (filters.isPaper !== undefined) {
        query = query.eq('is_paper', filters.isPaper);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.offset(filters.offset);
      }
      
      // Apply sorting
      if (filters.orderBy) {
        query = query.order(filters.orderBy, { ascending: filters.ascending !== false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to get trade history: ${error.message}`);
      }
      
      return data.map(trade => ({
        id: trade.id,
        userId: trade.user_id,
        symbol: trade.symbol,
        side: trade.side,
        quantity: trade.quantity,
        price: trade.price,
        orderId: trade.order_id,
        status: trade.status,
        executedAt: trade.executed_at,
        createdAt: trade.created_at,
        strategy: trade.strategy,
        modelId: trade.model_id,
        isPaper: trade.is_paper
      }));
    },
    
    /**
     * Store backtest results
     * 
     * @param {Object} backtest - Backtest data
     * @returns {Promise<Object>} - Stored backtest data
     */
    async storeBacktestResults(backtest) {
      const { data, error } = await supabase
        .from('backtests')
        .insert({
          user_id: backtest.userId,
          name: backtest.name,
          description: backtest.description,
          strategy: backtest.strategy,
          parameters: backtest.parameters,
          symbols: backtest.symbols,
          start_date: backtest.startDate,
          end_date: backtest.endDate,
          results: backtest.results,
          metrics: backtest.metrics,
          model_id: backtest.modelId
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to store backtest results: ${error.message}`);
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        strategy: data.strategy,
        parameters: data.parameters,
        symbols: data.symbols,
        startDate: data.start_date,
        endDate: data.end_date,
        results: data.results,
        metrics: data.metrics,
        createdAt: data.created_at,
        modelId: data.model_id
      };
    },
    
    /**
     * Get backtest results
     * 
     * @param {string} backtestId - Backtest ID
     * @returns {Promise<Object>} - Backtest data
     */
    async getBacktestResults(backtestId) {
      const { data, error } = await supabase
        .from('backtests')
        .select('*')
        .eq('id', backtestId)
        .single();
      
      if (error) {
        throw new Error(`Failed to get backtest results: ${error.message}`);
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        strategy: data.strategy,
        parameters: data.parameters,
        symbols: data.symbols,
        startDate: data.start_date,
        endDate: data.end_date,
        results: data.results,
        metrics: data.metrics,
        createdAt: data.created_at,
        modelId: data.model_id
      };
    },
    
    /**
     * List backtests
     * 
     * @param {Object} filters - Filters for backtests
     * @returns {Promise<Array<Object>>} - Backtests
     */
    async listBacktests(filters = {}) {
      let query = supabase
        .from('backtests')
        .select('*');
      
      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.strategy) {
        query = query.eq('strategy', filters.strategy);
      }
      
      if (filters.modelId) {
        query = query.eq('model_id', filters.modelId);
      }
      
      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.offset(filters.offset);
      }
      
      // Apply sorting
      if (filters.orderBy) {
        query = query.order(filters.orderBy, { ascending: filters.ascending !== false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to list backtests: ${error.message}`);
      }
      
      return data.map(backtest => ({
        id: backtest.id,
        userId: backtest.user_id,
        name: backtest.name,
        description: backtest.description,
        strategy: backtest.strategy,
        parameters: backtest.parameters,
        symbols: backtest.symbols,
        startDate: backtest.start_date,
        endDate: backtest.end_date,
        metrics: backtest.metrics,
        createdAt: backtest.created_at,
        modelId: backtest.model_id
      }));
    },
    
    /**
     * Store model performance
     * 
     * @param {Object} performance - Performance data
     * @returns {Promise<Object>} - Stored performance data
     */
    async storeModelPerformance(performance) {
      const { data, error } = await supabase
        .from('model_performance')
        .insert({
          user_id: performance.userId,
          model_id: performance.modelId,
          decision_type: performance.decisionType,
          decision: performance.decision,
          outcome: performance.outcome,
          accuracy: performance.accuracy,
          symbol: performance.symbol,
          context: performance.context
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to store model performance: ${error.message}`);
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        modelId: data.model_id,
        decisionType: data.decision_type,
        decision: data.decision,
        outcome: data.outcome,
        accuracy: data.accuracy,
        createdAt: data.created_at,
        symbol: data.symbol,
        context: data.context
      };
    },
    
    /**
     * Get model performance
     * 
     * @param {Object} filters - Filters for model performance
     * @returns {Promise<Array<Object>>} - Model performance data
     */
    async getModelPerformance(filters = {}) {
      let query = supabase
        .from('model_performance')
        .select('*');
      
      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.modelId) {
        query = query.eq('model_id', filters.modelId);
      }
      
      if (filters.decisionType) {
        query = query.eq('decision_type', filters.decisionType);
      }
      
      if (filters.symbol) {
        query = query.eq('symbol', filters.symbol);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.offset(filters.offset);
      }
      
      // Apply sorting
      if (filters.orderBy) {
        query = query.order(filters.orderBy, { ascending: filters.ascending !== false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to get model performance: ${error.message}`);
      }
      
      return data.map(performance => ({
        id: performance.id,
        userId: performance.user_id,
        modelId: performance.model_id,
        decisionType: performance.decision_type,
        decision: performance.decision,
        outcome: performance.outcome,
        accuracy: performance.accuracy,
        createdAt: performance.created_at,
        symbol: performance.symbol,
        context: performance.context
      }));
    },
    
    /**
     * Store strategy execution
     * 
     * @param {Object} execution - Strategy execution data
     * @returns {Promise<Object>} - Stored execution data
     */
    async storeStrategyExecution(execution) {
      const { data, error } = await supabase
        .from('strategy_executions')
        .insert({
          user_id: execution.userId,
          strategy: execution.strategy,
          assets: execution.assets,
          decisions: execution.decisions,
          results: execution.results,
          timestamp: execution.timestamp
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to store strategy execution: ${error.message}`);
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        strategy: data.strategy,
        assets: data.assets,
        decisions: data.decisions,
        results: data.results,
        timestamp: data.timestamp,
        createdAt: data.created_at
      };
    }
  };
}

/**
 * Encrypt data
 * 
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {string} - Encrypted data
 */
function encryptData(data, key) {
  if (!key || key.length < 32) {
    // If no proper key is provided, return base64 encoded data
    // This is not secure, but prevents errors
    return Buffer.from(data).toString('base64');
  }
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt data
 * 
 * @param {string} data - Data to decrypt
 * @param {string} key - Encryption key
 * @returns {string} - Decrypted data
 */
function decryptData(data, key) {
  if (!key || key.length < 32) {
    // If no proper key is provided, assume data is base64 encoded
    return Buffer.from(data, 'base64').toString('utf8');
  }
  
  const parts = data.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = {
  initializeStorage
};