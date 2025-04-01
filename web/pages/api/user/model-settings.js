import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for user LLM model settings
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getModelSettings(req, res);
    case 'PUT':
      return updateModelSettings(req, res);
    default:
      return res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed' });
  }
}

/**
 * Get user model settings
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function getModelSettings(req, res) {
  try {
    const { user, supabase } = req;
    
    // Get model settings from database
    const { data, error } = await supabase
      .from('model_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return res.status(400).json({ error: 'Failed to get model settings', message: error.message });
    }
    
    // If no settings found, create default settings
    if (!data) {
      const defaultSettings = {
        defaultModel: 'gpt-4',
        models: {
          'gpt-4': {
            enabled: true,
            temperature: 0.7,
            maxTokens: 2000,
            topP: 1.0
          },
          'gpt-3.5-turbo': {
            enabled: true,
            temperature: 0.8,
            maxTokens: 1500,
            topP: 1.0
          },
          'claude-3-opus': {
            enabled: false,
            temperature: 0.7,
            maxTokens: 2000,
            topP: 1.0
          },
          'claude-3-sonnet': {
            enabled: false,
            temperature: 0.7,
            maxTokens: 1500,
            topP: 1.0
          },
          'llama-3': {
            enabled: false,
            temperature: 0.7,
            maxTokens: 1500,
            topP: 1.0
          }
        }
      };
      
      const { data: newData, error: insertError } = await supabase
        .from('model_settings')
        .insert({
          user_id: user.id,
          settings: defaultSettings
        })
        .select()
        .single();
      
      if (insertError) {
        return res.status(400).json({ error: 'Failed to create model settings', message: insertError.message });
      }
      
      return res.status(200).json(newData.settings);
    }
    
    // Return model settings
    return res.status(200).json(data.settings);
  } catch (error) {
    console.error('Get model settings error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

/**
 * Update user model settings
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function updateModelSettings(req, res) {
  try {
    const { user, supabase } = req;
    const { defaultModel, models } = req.body;
    
    // Validate input
    if (!defaultModel && !models) {
      return res.status(400).json({ error: 'Bad Request', message: 'Default model or models settings are required' });
    }
    
    // Get current settings
    const { data: currentData, error: getError } = await supabase
      .from('model_settings')
      .select('settings')
      .eq('user_id', user.id)
      .single();
    
    // Prepare settings object
    let settings = {
      defaultModel: 'gpt-4',
      models: {
        'gpt-4': {
          enabled: true,
          temperature: 0.7,
          maxTokens: 2000,
          topP: 1.0
        },
        'gpt-3.5-turbo': {
          enabled: true,
          temperature: 0.8,
          maxTokens: 1500,
          topP: 1.0
        },
        'claude-3-opus': {
          enabled: false,
          temperature: 0.7,
          maxTokens: 2000,
          topP: 1.0
        },
        'claude-3-sonnet': {
          enabled: false,
          temperature: 0.7,
          maxTokens: 1500,
          topP: 1.0
        },
        'llama-3': {
          enabled: false,
          temperature: 0.7,
          maxTokens: 1500,
          topP: 1.0
        }
      }
    };
    
    // If we have current settings, use them as base
    if (currentData && !getError) {
      settings = currentData.settings;
    }
    
    // Update with new settings
    if (defaultModel) {
      settings.defaultModel = defaultModel;
    }
    
    if (models) {
      // Update only the models that are provided
      Object.keys(models).forEach(modelName => {
        if (settings.models[modelName]) {
          settings.models[modelName] = {
            ...settings.models[modelName],
            ...models[modelName]
          };
        }
      });
    }
    
    // Ensure default model is enabled
    if (settings.models[settings.defaultModel]) {
      settings.models[settings.defaultModel].enabled = true;
    }
    
    // Update model settings
    const { data, error } = await supabase
      .from('model_settings')
      .upsert({
        user_id: user.id,
        settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: 'Failed to update model settings', message: error.message });
    }
    
    // Return updated settings
    return res.status(200).json(data.settings);
  } catch (error) {
    console.error('Update model settings error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);