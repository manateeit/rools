import { createApiHandler } from '../../../lib/middleware';

/**
 * API route for trading orders
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getOrders(req, res);
    case 'POST':
      return createOrder(req, res);
    default:
      return res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed' });
  }
}

/**
 * Get orders
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function getOrders(req, res) {
  try {
    // Get query parameters
    const { 
      status = 'open', 
      limit = 50, 
      after, 
      until, 
      direction = 'desc',
      nested = false
    } = req.query;
    
    // Initialize trading engine
    const tradingEngine = req.app.tradingEngine;
    
    if (!tradingEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Trading engine not initialized' });
    }
    
    // Prepare parameters for Alpaca
    const params = {
      status,
      limit: parseInt(limit),
      direction
    };
    
    // Add after date if provided
    if (after) {
      params.after = new Date(after);
    }
    
    // Add until date if provided
    if (until) {
      params.until = new Date(until);
    }
    
    // Get orders from Alpaca
    const orders = await tradingEngine.alpacaClient.getOrders(params);
    
    // Format response
    const formattedOrders = orders.map(order => formatOrder(order, nested));
    
    // Return orders
    return res.status(200).json(formattedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

/**
 * Create a new order
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function createOrder(req, res) {
  try {
    // Get order data from request body
    const {
      symbol,
      qty,
      side,
      type,
      time_in_force,
      limit_price,
      stop_price,
      trail_price,
      trail_percent,
      extended_hours,
      client_order_id
    } = req.body;
    
    // Validate required fields
    if (!symbol || !qty || !side || !type || !time_in_force) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Symbol, quantity, side, type, and time_in_force are required'
      });
    }
    
    // Initialize trading engine
    const tradingEngine = req.app.tradingEngine;
    
    if (!tradingEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Trading engine not initialized' });
    }
    
    // Prepare order parameters
    const orderParams = {
      symbol,
      qty,
      side,
      type,
      time_in_force
    };
    
    // Add optional parameters if provided
    if (limit_price) orderParams.limit_price = limit_price;
    if (stop_price) orderParams.stop_price = stop_price;
    if (trail_price) orderParams.trail_price = trail_price;
    if (trail_percent) orderParams.trail_percent = trail_percent;
    if (extended_hours !== undefined) orderParams.extended_hours = extended_hours;
    if (client_order_id) orderParams.client_order_id = client_order_id;
    
    // Create order with Alpaca
    const order = await tradingEngine.alpacaClient.createOrder(orderParams);
    
    // Store order in database
    await storeOrderRecord(req, order);
    
    // Format response
    const formattedOrder = formatOrder(order, true);
    
    // Return created order
    return res.status(201).json(formattedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

/**
 * Store order record in database
 * 
 * @param {Object} req - The request object
 * @param {Object} order - The order object
 */
async function storeOrderRecord(req, order) {
  try {
    const { user, supabase } = req;
    
    // Store order in database
    await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_id: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        quantity: order.qty,
        status: order.status,
        created_at: new Date().toISOString(),
        order_data: order
      });
  } catch (error) {
    console.error('Error storing order record:', error);
    // Don't throw error, just log it
  }
}

/**
 * Format order object
 * 
 * @param {Object} order - The order object from Alpaca
 * @param {boolean} nested - Whether to include nested objects
 * @returns {Object} - The formatted order
 */
function formatOrder(order, nested = false) {
  const formattedOrder = {
    id: order.id,
    client_order_id: order.client_order_id,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    quantity: parseFloat(order.qty),
    status: order.status,
    created_at: order.created_at,
    updated_at: order.updated_at,
    submitted_at: order.submitted_at,
    filled_at: order.filled_at,
    expired_at: order.expired_at,
    canceled_at: order.canceled_at
  };
  
  // Add price fields if available
  if (order.limit_price) formattedOrder.limit_price = parseFloat(order.limit_price);
  if (order.stop_price) formattedOrder.stop_price = parseFloat(order.stop_price);
  if (order.trail_price) formattedOrder.trail_price = parseFloat(order.trail_price);
  if (order.trail_percent) formattedOrder.trail_percent = parseFloat(order.trail_percent);
  
  // Add fill fields if available
  if (order.filled_qty) formattedOrder.filled_qty = parseFloat(order.filled_qty);
  if (order.filled_avg_price) formattedOrder.filled_avg_price = parseFloat(order.filled_avg_price);
  
  // Add nested objects if requested
  if (nested) {
    formattedOrder.legs = order.legs;
    formattedOrder.asset_class = order.asset_class;
    formattedOrder.asset_id = order.asset_id;
    formattedOrder.time_in_force = order.time_in_force;
    formattedOrder.extended_hours = order.extended_hours;
    formattedOrder.replaceable = order.replaceable;
  }
  
  return formattedOrder;
}

// Export the handler with authentication middleware
export default createApiHandler(handler);