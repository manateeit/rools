import { createApiHandler } from '../../../../lib/middleware';

/**
 * API route for managing a specific order
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getOrder(req, res);
    case 'DELETE':
      return cancelOrder(req, res);
    default:
      return res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed' });
  }
}

/**
 * Get a specific order
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function getOrder(req, res) {
  try {
    const { id } = req.query;
    
    // Initialize trading engine
    const tradingEngine = req.app.tradingEngine;
    
    if (!tradingEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Trading engine not initialized' });
    }
    
    // Get order from Alpaca
    const order = await tradingEngine.alpacaClient.getOrder(id);
    
    // Format response
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
      canceled_at: order.canceled_at,
      asset_class: order.asset_class,
      asset_id: order.asset_id,
      time_in_force: order.time_in_force,
      extended_hours: order.extended_hours,
      legs: order.legs
    };
    
    // Add price fields if available
    if (order.limit_price) formattedOrder.limit_price = parseFloat(order.limit_price);
    if (order.stop_price) formattedOrder.stop_price = parseFloat(order.stop_price);
    if (order.trail_price) formattedOrder.trail_price = parseFloat(order.trail_price);
    if (order.trail_percent) formattedOrder.trail_percent = parseFloat(order.trail_percent);
    
    // Add fill fields if available
    if (order.filled_qty) formattedOrder.filled_qty = parseFloat(order.filled_qty);
    if (order.filled_avg_price) formattedOrder.filled_avg_price = parseFloat(order.filled_avg_price);
    
    // Return order
    return res.status(200).json(formattedOrder);
  } catch (error) {
    console.error('Get order error:', error);
    
    // Handle 404 error
    if (error.statusCode === 404) {
      return res.status(404).json({ error: 'Not Found', message: 'Order not found' });
    }
    
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

/**
 * Cancel an order
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response
 */
async function cancelOrder(req, res) {
  try {
    const { id } = req.query;
    
    // Initialize trading engine
    const tradingEngine = req.app.tradingEngine;
    
    if (!tradingEngine) {
      return res.status(500).json({ error: 'Server Error', message: 'Trading engine not initialized' });
    }
    
    // Cancel order with Alpaca
    const response = await tradingEngine.alpacaClient.cancelOrder(id);
    
    // Update order status in database
    await updateOrderStatus(req, id, 'canceled');
    
    // Return success
    return res.status(200).json({ success: true, message: 'Order canceled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    
    // Handle 404 error
    if (error.statusCode === 404) {
      return res.status(404).json({ error: 'Not Found', message: 'Order not found' });
    }
    
    // Handle order already canceled
    if (error.statusCode === 422) {
      return res.status(422).json({ error: 'Unprocessable Entity', message: 'Order cannot be canceled' });
    }
    
    return res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred' });
  }
}

/**
 * Update order status in database
 * 
 * @param {Object} req - The request object
 * @param {string} orderId - The order ID
 * @param {string} status - The new status
 */
async function updateOrderStatus(req, orderId, status) {
  try {
    const { user, supabase } = req;
    
    // Update order status in database
    await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .eq('user_id', user.id);
  } catch (error) {
    console.error('Error updating order status:', error);
    // Don't throw error, just log it
  }
}

// Export the handler with authentication middleware
export default createApiHandler(handler);