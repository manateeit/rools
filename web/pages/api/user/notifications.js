import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for user notification settings
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getNotificationSettings(req, res);
    case 'PUT':
      return updateNotificationSettings(req, res);
    default:
      return res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed' });
  }
}

/**
 * Get user notification settings
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function getNotificationSettings(req, res) {
  try {
    const { user, supabase } = req;
    
    // Get notification settings from database
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return res.status(400).json({ error: 'Failed to get notification settings', message: error.message });
    }
    
    // If no settings found, create default settings
    if (!data) {
      const defaultSettings = {
        user_id: user.id,
        email: {
          tradeExecuted: true,
          orderFilled: true,
          orderCanceled: false,
          dailySummary: true,
          weeklyReport: true,
          marketAlerts: false
        },
        push: {
          tradeExecuted: true,
          orderFilled: true,
          orderCanceled: true,
          dailySummary: false,
          weeklyReport: false,
          marketAlerts: true
        }
      };
      
      const { data: newData, error: insertError } = await supabase
        .from('notification_settings')
        .insert({
          user_id: user.id,
          settings: defaultSettings
        })
        .select()
        .single();
      
      if (insertError) {
        return res.status(400).json({ error: 'Failed to create notification settings', message: insertError.message });
      }
      
      return res.status(200).json(newData.settings);
    }
    
    // Return notification settings
    return res.status(200).json(data.settings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

/**
 * Update user notification settings
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function updateNotificationSettings(req, res) {
  try {
    const { user, supabase } = req;
    const { email, push } = req.body;
    
    // Validate input
    if (!email && !push) {
      return res.status(400).json({ error: 'Bad Request', message: 'Email or push notification settings are required' });
    }
    
    // Get current settings
    const { data: currentData, error: getError } = await supabase
      .from('notification_settings')
      .select('settings')
      .eq('user_id', user.id)
      .single();
    
    // Prepare settings object
    let settings = {
      email: {
        tradeExecuted: true,
        orderFilled: true,
        orderCanceled: false,
        dailySummary: true,
        weeklyReport: true,
        marketAlerts: false
      },
      push: {
        tradeExecuted: true,
        orderFilled: true,
        orderCanceled: true,
        dailySummary: false,
        weeklyReport: false,
        marketAlerts: true
      }
    };
    
    // If we have current settings, use them as base
    if (currentData && !getError) {
      settings = currentData.settings;
    }
    
    // Update with new settings
    if (email) {
      settings.email = { ...settings.email, ...email };
    }
    
    if (push) {
      settings.push = { ...settings.push, ...push };
    }
    
    // Update notification settings
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: user.id,
        settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: 'Failed to update notification settings', message: error.message });
    }
    
    // Return updated settings
    return res.status(200).json(data.settings);
  } catch (error) {
    console.error('Update notification settings error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);