import { useState } from 'react';

const PositionsList = ({ positions }) => {
  const [sortField, setSortField] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  
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
  
  // Sort positions
  const sortedPositions = [...positions].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
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
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  return (
    <div className="card positions-list">
      <div className="card-header">
        Positions
      </div>
      <div className="card-body">
        {positions.length === 0 ? (
          <p className="no-positions">No open positions.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('symbol')}>
                    Symbol {getSortIndicator('symbol')}
                  </th>
                  <th onClick={() => handleSort('quantity')}>
                    Quantity {getSortIndicator('quantity')}
                  </th>
                  <th onClick={() => handleSort('entryPrice')}>
                    Entry Price {getSortIndicator('entryPrice')}
                  </th>
                  <th onClick={() => handleSort('currentPrice')}>
                    Current Price {getSortIndicator('currentPrice')}
                  </th>
                  <th onClick={() => handleSort('marketValue')}>
                    Market Value {getSortIndicator('marketValue')}
                  </th>
                  <th onClick={() => handleSort('unrealizedPLPercent')}>
                    P&L {getSortIndicator('unrealizedPLPercent')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPositions.map((position) => (
                  <tr key={position.symbol}>
                    <td className="symbol">{position.symbol}</td>
                    <td>{position.quantity}</td>
                    <td>{formatCurrency(position.entryPrice)}</td>
                    <td>{formatCurrency(position.currentPrice)}</td>
                    <td>{formatCurrency(position.marketValue)}</td>
                    <td className={position.unrealizedPL >= 0 ? 'profit' : 'loss'}>
                      {formatCurrency(position.unrealizedPL)} ({formatPercentage(position.unrealizedPLPercent)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .positions-list {
          height: 100%;
        }
        
        .no-positions {
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
        
        .profit {
          color: var(--success-color);
        }
        
        .loss {
          color: var(--danger-color);
        }
      `}</style>
    </div>
  );
};

export default PositionsList;