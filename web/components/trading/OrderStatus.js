import { useState } from 'react';

const OrderStatus = ({ orders, loading }) => {
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending for dates, ascending for others
      setSortField(field);
      setSortDirection(field.includes('_at') ? 'desc' : 'asc');
    }
  };
  
  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle date values
    if (sortField.includes('_at')) {
      const aDate = new Date(aValue || 0);
      const bDate = new Date(bValue || 0);
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }
    
    // Handle numeric values
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle string values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });
  
  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '-';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'filled':
        return 'status-filled';
      case 'partially_filled':
        return 'status-partially-filled';
      case 'canceled':
        return 'status-canceled';
      case 'rejected':
        return 'status-rejected';
      case 'new':
      case 'accepted':
        return 'status-new';
      case 'pending_new':
      case 'accepted_for_bidding':
        return 'status-pending';
      case 'done_for_day':
        return 'status-done';
      case 'expired':
        return 'status-expired';
      case 'replaced':
        return 'status-replaced';
      case 'pending_cancel':
      case 'pending_replace':
        return 'status-pending-cancel';
      case 'stopped':
      case 'suspended':
        return 'status-stopped';
      case 'calculated':
        return 'status-calculated';
      default:
        return 'status-unknown';
    }
  };
  
  return (
    <div className="card order-status">
      <div className="card-header">
        Recent Orders
      </div>
      <div className="card-body">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <p>No recent orders</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('created_at')}>
                    Date {getSortIndicator('created_at')}
                  </th>
                  <th onClick={() => handleSort('symbol')}>
                    Symbol {getSortIndicator('symbol')}
                  </th>
                  <th onClick={() => handleSort('side')}>
                    Side {getSortIndicator('side')}
                  </th>
                  <th onClick={() => handleSort('type')}>
                    Type {getSortIndicator('type')}
                  </th>
                  <th onClick={() => handleSort('quantity')}>
                    Qty {getSortIndicator('quantity')}
                  </th>
                  <th onClick={() => handleSort('filled_avg_price')}>
                    Price {getSortIndicator('filled_avg_price')}
                  </th>
                  <th onClick={() => handleSort('status')}>
                    Status {getSortIndicator('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{formatDate(order.created_at)}</td>
                    <td className="symbol">{order.symbol}</td>
                    <td className={order.side === 'buy' ? 'buy' : 'sell'}>
                      {order.side.toUpperCase()}
                    </td>
                    <td>
                      {order.type.toUpperCase()}
                      {order.type === 'limit' && order.limit_price && ` @ ${formatCurrency(order.limit_price)}`}
                      {order.type === 'stop' && order.stop_price && ` @ ${formatCurrency(order.stop_price)}`}
                      {order.type === 'stop_limit' && order.stop_price && order.limit_price && 
                        ` @ ${formatCurrency(order.stop_price)}/${formatCurrency(order.limit_price)}`}
                    </td>
                    <td>
                      {order.filled_qty ? (
                        <span>
                          {order.filled_qty}/{order.quantity}
                        </span>
                      ) : (
                        order.quantity
                      )}
                    </td>
                    <td>{formatCurrency(order.filled_avg_price)}</td>
                    <td>
                      <span className={`status ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .order-status {
          height: 100%;
        }
        
        .loading, .no-orders {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }
        
        th {
          cursor: pointer;
          user-select: none;
        }
        
        th:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .symbol {
          font-weight: bold;
        }
        
        .buy {
          color: var(--success-color);
        }
        
        .sell {
          color: var(--danger-color);
        }
        
        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        
        .status-filled {
          background-color: var(--success-color);
          color: white;
        }
        
        .status-partially-filled {
          background-color: #17a2b8;
          color: white;
        }
        
        .status-new, .status-accepted {
          background-color: var(--primary-color);
          color: white;
        }
        
        .status-pending, .status-pending-cancel {
          background-color: var(--warning-color);
          color: black;
        }
        
        .status-canceled, .status-rejected, .status-expired, .status-stopped {
          background-color: var(--secondary-color);
          color: white;
        }
        
        .status-replaced {
          background-color: #6f42c1;
          color: white;
        }
        
        .status-done {
          background-color: #20c997;
          color: white;
        }
        
        .status-calculated {
          background-color: #fd7e14;
          color: white;
        }
        
        .status-unknown {
          background-color: var(--light-color);
          color: var(--dark-color);
        }
      `}</style>
    </div>
  );
};

export default OrderStatus;