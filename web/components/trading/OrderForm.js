import { useState, useEffect } from 'react';

const OrderForm = ({ onSubmit, selectedAsset, marketData, disabled }) => {
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState('day');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Update limit price when market data changes
  useEffect(() => {
    if (marketData && marketData.length > 0) {
      const latestPrice = marketData[marketData.length - 1].close;
      setLimitPrice(latestPrice.toFixed(2));
      setStopPrice(latestPrice.toFixed(2));
    }
  }, [marketData]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Validate inputs
      if (!selectedAsset) {
        throw new Error('Please select an asset');
      }
      
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
        throw new Error('Limit price must be greater than 0');
      }
      
      if (orderType === 'stop' && (!stopPrice || parseFloat(stopPrice) <= 0)) {
        throw new Error('Stop price must be greater than 0');
      }
      
      if (orderType === 'stop_limit' && 
          (!limitPrice || parseFloat(limitPrice) <= 0 || 
           !stopPrice || parseFloat(stopPrice) <= 0)) {
        throw new Error('Limit and stop prices must be greater than 0');
      }
      
      // Prepare order data
      const orderData = {
        symbol: selectedAsset,
        qty: quantity,
        side,
        type: orderType,
        time_in_force: timeInForce
      };
      
      // Add limit price if applicable
      if (orderType === 'limit' || orderType === 'stop_limit') {
        orderData.limit_price = parseFloat(limitPrice);
      }
      
      // Add stop price if applicable
      if (orderType === 'stop' || orderType === 'stop_limit') {
        orderData.stop_price = parseFloat(stopPrice);
      }
      
      // Submit order
      const result = await onSubmit(orderData);
      
      // Show success message
      setSuccess(`Order placed successfully: ${result.id}`);
      
      // Reset form
      setQuantity(1);
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Get current price from market data
  const getCurrentPrice = () => {
    if (marketData && marketData.length > 0) {
      return marketData[marketData.length - 1].close;
    }
    return null;
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Calculate estimated cost
  const calculateEstimatedCost = () => {
    const currentPrice = getCurrentPrice();
    
    if (!currentPrice) return null;
    
    let price = currentPrice;
    
    if (orderType === 'limit' && limitPrice) {
      price = parseFloat(limitPrice);
    }
    
    return price * quantity;
  };
  
  const estimatedCost = calculateEstimatedCost();
  const currentPrice = getCurrentPrice();
  
  return (
    <div className="card order-form">
      <div className="card-header">
        Place Order
      </div>
      <div className="card-body">
        {!selectedAsset ? (
          <div className="no-asset-selected">
            <p>Please select an asset to trade</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}
            
            <div className="form-group">
              <label>Asset</label>
              <div className="asset-display">
                <strong>{selectedAsset}</strong>
                {currentPrice && (
                  <span className="current-price">
                    {formatCurrency(currentPrice)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>Side</label>
              <div className="side-selector">
                <button
                  type="button"
                  className={`side-button buy ${side === 'buy' ? 'active' : ''}`}
                  onClick={() => setSide('buy')}
                  disabled={disabled || loading}
                >
                  Buy
                </button>
                <button
                  type="button"
                  className={`side-button sell ${side === 'sell' ? 'active' : ''}`}
                  onClick={() => setSide('sell')}
                  disabled={disabled || loading}
                >
                  Sell
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="orderType">Order Type</label>
              <select
                id="orderType"
                className="form-control"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                disabled={disabled || loading}
              >
                <option value="market">Market</option>
                <option value="limit">Limit</option>
                <option value="stop">Stop</option>
                <option value="stop_limit">Stop Limit</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                className="form-control"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                min="1"
                step="1"
                required
                disabled={disabled || loading}
              />
            </div>
            
            {(orderType === 'limit' || orderType === 'stop_limit') && (
              <div className="form-group">
                <label htmlFor="limitPrice">Limit Price</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    id="limitPrice"
                    className="form-control"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    step="0.01"
                    min="0.01"
                    required
                    disabled={disabled || loading}
                  />
                </div>
              </div>
            )}
            
            {(orderType === 'stop' || orderType === 'stop_limit') && (
              <div className="form-group">
                <label htmlFor="stopPrice">Stop Price</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    id="stopPrice"
                    className="form-control"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    step="0.01"
                    min="0.01"
                    required
                    disabled={disabled || loading}
                  />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="timeInForce">Time in Force</label>
              <select
                id="timeInForce"
                className="form-control"
                value={timeInForce}
                onChange={(e) => setTimeInForce(e.target.value)}
                disabled={disabled || loading}
              >
                <option value="day">Day</option>
                <option value="gtc">Good Till Canceled</option>
                <option value="ioc">Immediate or Cancel</option>
                <option value="fok">Fill or Kill</option>
              </select>
            </div>
            
            {estimatedCost !== null && (
              <div className="estimated-cost">
                <div className="cost-label">Estimated Cost:</div>
                <div className="cost-value">{formatCurrency(estimatedCost)}</div>
              </div>
            )}
            
            <div className="form-group">
              <button
                type="submit"
                className={`btn btn-${side === 'buy' ? 'success' : 'danger'} w-100`}
                disabled={disabled || loading}
              >
                {loading ? 'Placing Order...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedAsset}`}
              </button>
            </div>
          </form>
        )}
      </div>
      
      <style jsx>{`
        .order-form {
          height: 100%;
        }
        
        .no-asset-selected {
          text-align: center;
          padding: 2rem;
          color: var(--secondary-color);
        }
        
        .asset-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: var(--light-color);
          border-radius: var(--border-radius);
          margin-bottom: 1rem;
        }
        
        .current-price {
          font-weight: bold;
        }
        
        .side-selector {
          display: flex;
          margin-bottom: 1rem;
        }
        
        .side-button {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          background-color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .side-button:first-child {
          border-radius: var(--border-radius) 0 0 var(--border-radius);
        }
        
        .side-button:last-child {
          border-radius: 0 var(--border-radius) var(--border-radius) 0;
        }
        
        .side-button.buy.active {
          background-color: var(--success-color);
          color: white;
          border-color: var(--success-color);
        }
        
        .side-button.sell.active {
          background-color: var(--danger-color);
          color: white;
          border-color: var(--danger-color);
        }
        
        .estimated-cost {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: var(--light-color);
          border-radius: var(--border-radius);
          margin-bottom: 1rem;
        }
        
        .cost-value {
          font-weight: bold;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

export default OrderForm;