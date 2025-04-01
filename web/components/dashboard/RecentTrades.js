import { useState } from 'react';

const RecentTrades = ({ trades }) => {
  const [sortField, setSortField] = useState('executedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort trades
  const sortedTrades = [...trades].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle date values
    if (sortField === 'executedAt') {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  return (
    <div className="card recent-trades">
      <div className="card-header">
        Recent Trades
      </div>
      <div className="card-body">
        {trades.length === 0 ? (
          <p className="no-trades">No recent trades.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('executedAt')}>
                    Date {getSortIndicator('executedAt')}
                  </th>
                  <th onClick={() => handleSort('symbol')}>
                    Symbol {getSortIndicator('symbol')}
                  </th>
                  <th onClick={() => handleSort('side')}>
                    Side {getSortIndicator('side')}
                  </th>
                  <th onClick={() => handleSort('quantity')}>
                    Quantity {getSortIndicator('quantity')}
                  </th>
                  <th onClick={() => handleSort('price')}>
                    Price {getSortIndicator('price')}
                  </th>
                  <th onClick={() => handleSort('status')}>
                    Status {getSortIndicator('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTrades.map((trade) => (
                  <tr key={trade.id}>
                    <td>{formatDate(trade.executedAt)}</td>
                    <td className="symbol">{trade.symbol}</td>
                    <td className={trade.side === 'buy' ? 'buy' : 'sell'}>
                      {trade.side.toUpperCase()}
                    </td>
                    <td>{trade.quantity}</td>
                    <td>{formatCurrency(trade.price)}</td>
                    <td>
                      <span className={`status status-${trade.status}`}>
                        {trade.status}
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
        .recent-trades {
          height: 100%;
        }
        
        .no-trades {
          text-align: center;
          padding: 2rem;
          color: var(--secondary-color);
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
        
        .status-canceled {
          background-color: var(--secondary-color);
          color: white;
        }
        
        .status-rejected {
          background-color: var(--danger-color);
          color: white;
        }
        
        .status-pending {
          background-color: var(--warning-color);
          color: black;
        }
      `}</style>
    </div>
  );
};

export default RecentTrades;