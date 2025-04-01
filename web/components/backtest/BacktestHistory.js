import { useState } from 'react';

const BacktestHistory = ({ backtests, onLoadBacktest, loading }) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending for dates, ascending for others
      setSortField(field);
      setSortDirection(field.includes('At') || field.includes('Date') ? 'desc' : 'asc');
    }
  };
  
  // Filter backtests based on search term
  const filteredBacktests = backtests.filter(backtest => 
    backtest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (backtest.description && backtest.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    backtest.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    backtest.symbols.some(symbol => symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Sort backtests
  const sortedBacktests = [...filteredBacktests].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle date values
    if (sortField.includes('At') || sortField.includes('Date')) {
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
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
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
    <div className="card backtest-history">
      <div className="card-header">
        Backtest History
      </div>
      <div className="card-body">
        <div className="search-container">
          <input
            type="text"
            className="form-control"
            placeholder="Search backtests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading backtest history...</p>
          </div>
        ) : backtests.length === 0 ? (
          <div className="no-backtests">
            <p>No backtest history found</p>
            <p>Run a backtest to see results here</p>
          </div>
        ) : filteredBacktests.length === 0 ? (
          <div className="no-results">
            <p>No backtests found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="backtests-list">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>
                      Name {getSortIndicator('name')}
                    </th>
                    <th onClick={() => handleSort('strategy')}>
                      Strategy {getSortIndicator('strategy')}
                    </th>
                    <th onClick={() => handleSort('createdAt')}>
                      Date {getSortIndicator('createdAt')}
                    </th>
                    <th onClick={() => handleSort('metrics.totalReturn')}>
                      Return {getSortIndicator('metrics.totalReturn')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBacktests.map((backtest) => {
                    const totalReturn = backtest.metrics?.totalReturn || 0;
                    
                    return (
                      <tr key={backtest.id}>
                        <td className="backtest-name">{backtest.name}</td>
                        <td>{backtest.strategy}</td>
                        <td>{formatDate(backtest.createdAt)}</td>
                        <td className={totalReturn >= 0 ? 'positive' : 'negative'}>
                          {formatPercentage(totalReturn * 100)}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onLoadBacktest(backtest.id)}
                          >
                            Load
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .backtest-history {
          height: 100%;
        }
        
        .search-container {
          margin-bottom: 1rem;
        }
        
        .loading, .no-backtests, .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }
        
        .backtests-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        th {
          cursor: pointer;
          user-select: none;
        }
        
        th:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .backtest-name {
          font-weight: bold;
        }
        
        .positive {
          color: var(--success-color);
        }
        
        .negative {
          color: var(--danger-color);
        }
      `}</style>
    </div>
  );
};

export default BacktestHistory;