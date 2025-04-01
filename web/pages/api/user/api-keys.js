import { createApiHandler } from '../../../lib/middleware';
import crypto from 'crypto';

/**
 * API route for user API keys
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getApiKeys(req, res);
    case 'POST':
      return addApiKey(req, res);
    default:
      return res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed' });
  }
}

/**
 * Get user API keys
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function getApiKeys(req, res) {
  try {
    const { user, supabase } = req;
    
    // Get API keys from database
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, type, created_at, last_used')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({ error: 'Failed to get API keys', message: error.message });
    }
    
    // Return API keys
    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Get API keys error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

/**
 * Add a new API key
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function addApiKey(req, res) {
  try {
    const { user, supabase } = req;
    const { name, type, key, secret } = req.body;
    
    // Validate input
    if (!name || !type || !key) {
      return res.status(400).json({ error: 'Bad Request', message: 'Name, type, and key are required' });
    }
    
    // Validate type
    const validTypes = ['alpaca', 'openai', 'supabase'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid API key type' });
    }
    
    // Encrypt API key and secret
    const encryptionKey = process.env.API_KEY_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return res.status(500).json({ error: 'Server Configuration Error', message: 'Encryption key not configured' });
    }
    
    // Encrypt key
    const encryptedKey = encryptData(key, encryptionKey);
    
    // Encrypt secret if provided
    let encryptedSecret = null;
    if (secret) {
      encryptedSecret = encryptData(secret, encryptionKey);
    }
    
    // Add API key to database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        type,
        key: encryptedKey,
        secret: encryptedSecret,
        created_at: new Date().toISOString()
      })
      .select('id, name, type, created_at')
      .single();
    
    if (error) {
      return res.status(400).json({ error: 'Failed to add API key', message: error.message });
    }
    
    // Return new API key
    return res.status(201).json(data);
  } catch (error) {
    console.error('Add API key error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  }
}

/**
 * Encrypt data using AES-256-GCM
 * 
 * @param {string} data - The data to encrypt
 * @param {string} key - The encryption key
 * @returns {string} - The encrypted data as a base64 string
 */
function encryptData(data, key) {
  // Create a buffer from the key (must be 32 bytes for AES-256)
  const keyBuffer = Buffer.from(key);
  
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Get the auth tag
  const authTag = cipher.getAuthTag();
  
  // Combine IV, encrypted data, and auth tag
  return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'base64')]).toString('base64');
}

// Export the handler with authentication middleware
export default createApiHandler(handler);