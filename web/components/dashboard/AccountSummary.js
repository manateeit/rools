import { useState } from 'react';

const AccountSummary = ({ accountInfo }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!accountInfo) {
    return (
      <div className="card">
        <div className="card-header">
          Account Summary
        </div>
        <div className="card-body">
          <p>No account information available.</p>
        </div>
      </div>
    );
  }
  
  const {
    status,
    currency,
    cash,
    portfolioValue,
    buyingPower,
    daytradeCount,
    isPaperAccount
  } = accountInfo;
  
  // Calculate unrealized P&L
  const unrealizedPL = portfolioValue - cash;
  const unrealizedPLPercent = cash > 0 ? (unrealizedPL / cash) * 100 : 0;
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(value);
  };
  
  return (
    <div className="card account-summary">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          Account Summary
          {isPaperAccount && (
            <span className="paper-trading-badge">Paper Trading</span>
          )}
        </div>
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      <div className="card-body">
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Portfolio Value</div>
            <div className="summary-value">{formatCurrency(portfolioValue)}</div>
          </div>
          
          <div className="summary-item">
            <div className="summary-label">Cash</div>
            <div className="summary-value">{formatCurrency(cash)}</div>
          </div>
          
          <div className="summary-item">
            <div className="summary-label">Unrealized P&L</div>
            <div className={`summary-value ${unrealizedPL >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(unrealizedPL)} ({unrealizedPLPercent.toFixed(2)}%)
            </div>
          </div>
          
          <div className="summary-item">
            <div className="summary-label">Buying Power</div>
            <div className="summary-value">{formatCurrency(buyingPower)}</div>
          </div>
        </div>
        
        {showDetails && (
          <div className="additional-details mt-3">
            <hr />
            <div className="row">
              <div className="col-md-4">
                <div className="detail-item">
                  <div className="detail-label">Account Status</div>
                  <div className="detail-value">
                    <span className={`status-badge status-${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="detail-item">
                  <div className="detail-label">Currency</div>
                  <div className="detail-value">{currency}</div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="detail-item">
                  <div className="detail-label">Day Trades</div>
                  <div className="detail-value">{daytradeCount}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .account-summary {
          margin-bottom: 1.5rem;
        }
        
        .paper-trading-badge {
          display: inline-block;
          background-color: var(--warning-color);
          color: #000;
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
          margin-left: 0.5rem;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        
        .summary-item {
          padding: 0.5rem;
        }
        
        .summary-label {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin-bottom: 0.25rem;
        }
        
        .summary-value {
          font-size: 1.25rem;
          font-weight: bold;
        }
        
        .detail-item {
          margin-bottom: 0.5rem;
        }
        
        .detail-label {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin-bottom: 0.25rem;
        }
        
        .detail-value {
          font-weight: 500;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-active {
          background-color: var(--success-color);
          color: white;
        }
        
        .status-inactive {
          background-color: var(--danger-color);
          color: white;
        }
        
        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default AccountSummary;