import { useState, useEffect, useRef } from 'react';

const BacktestResults = ({ results, loading }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const equityChartRef = useRef(null);
  const tradesChartRef = useRef(null);
  
  // Draw charts when results change
  useEffect(() => {
    if (!results || !results.results) return;
    
    // Draw equity chart
    if (equityChartRef.current && results.results.dailyEquity) {
      drawEquityChart(equityChartRef.current, results.results.dailyEquity);
    }
    
    // Draw trades chart
    if (tradesChartRef.current && results.results.trades) {
      drawTradesChart(tradesChartRef.current, results.results.trades);
    }
  }, [results, activeTab]);
  
  // Draw equity chart
  const drawEquityChart = (canvas, equityData) => {
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    // Draw chart
    const padding = { top: 20, right: 50, bottom: 30, left: 70 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    
    // Find min and max values
    const values = equityData.map(d => d.equity);
    const minValue = Math.min(...values) * 0.99; // Add some padding
    const maxValue = Math.max(...values) * 1.01;
    
    // Scale functions
    const xScale = (i) => padding.left + (i / (equityData.length - 1)) * chartWidth;
    const yScale = (value) => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = padding.top + (i / yTicks) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      
      // Y-axis labels
      const value = maxValue - (i / yTicks) * (maxValue - minValue);
      ctx.fillStyle = '#666';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatCurrency(value), padding.left - 10, y);
    }
    
    // X-axis labels
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const xLabelCount = Math.min(equityData.length, 5);
    for (let i = 0; i < equityData.length; i += Math.floor(equityData.length / xLabelCount)) {
      const x = xScale(i);
      const date = new Date(equityData[i].date);
      
      const label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      ctx.fillText(label, x, padding.top + chartHeight + 10);
    }
    
    // Draw line
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    equityData.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.equity);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw area
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(0, 123, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 123, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    equityData.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.equity);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.lineTo(xScale(equityData.length - 1), padding.top + chartHeight);
    ctx.lineTo(xScale(0), padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();
    
    // Draw points
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    
    equityData.forEach((d, i) => {
      // Only draw points at the ends
      if (i === 0 || i === equityData.length - 1) {
        const x = xScale(i);
        const y = yScale(d.equity);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });
  };
  
  // Draw trades chart
  const drawTradesChart = (canvas, tradesData) => {
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    // Draw chart
    const padding = { top: 20, right: 50, bottom: 30, left: 70 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    
    // Find min and max dates
    const entryDates = tradesData.map(d => new Date(d.entryDate).getTime());
    const exitDates = tradesData.map(d => new Date(d.exitDate).getTime());
    const minDate = Math.min(...entryDates);
    const maxDate = Math.max(...exitDates);
    
    // Find min and max PnL
    const pnlValues = tradesData.map(d => d.pnl);
    const maxPnl = Math.max(...pnlValues, 0);
    const minPnl = Math.min(...pnlValues, 0);
    const pnlRange = Math.max(Math.abs(maxPnl), Math.abs(minPnl)) * 1.1;
    
    // Scale functions
    const xScale = (date) => padding.left + ((date - minDate) / (maxDate - minDate)) * chartWidth;
    const yScale = (pnl) => padding.top + chartHeight / 2 - (pnl / pnlRange) * (chartHeight / 2);
    
    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight / 2);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight / 2);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      if (i === yTicks / 2) continue; // Skip the center line (already drawn as x-axis)
      
      const y = padding.top + (i / yTicks) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      
      // Y-axis labels
      const pnl = pnlRange - (i / yTicks) * (pnlRange * 2);
      ctx.fillStyle = '#666';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatCurrency(pnl), padding.left - 10, y);
    }
    
    // X-axis labels
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const xLabelCount = 5;
    for (let i = 0; i < xLabelCount; i++) {
      const date = new Date(minDate + (i / (xLabelCount - 1)) * (maxDate - minDate));
      const x = xScale(date.getTime());
      
      const label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      ctx.fillText(label, x, padding.top + chartHeight + 10);
    }
    
    // Draw trades
    tradesData.forEach(trade => {
      const entryDate = new Date(trade.entryDate).getTime();
      const exitDate = new Date(trade.exitDate).getTime();
      const pnl = trade.pnl;
      
      const x1 = xScale(entryDate);
      const x2 = xScale(exitDate);
      const y = yScale(pnl);
      const zeroY = yScale(0);
      
      // Draw bar
      ctx.fillStyle = pnl >= 0 ? 'rgba(40, 167, 69, 0.7)' : 'rgba(220, 53, 69, 0.7)';
      ctx.fillRect(x1, y, x2 - x1, zeroY - y);
      
      // Draw border
      ctx.strokeStyle = pnl >= 0 ? 'rgb(40, 167, 69)' : 'rgb(220, 53, 69)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x1, y, x2 - x1, zeroY - y);
    });
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Sort trades
  const sortTrades = (trades, field = 'entryDate', direction = 'desc') => {
    return [...trades].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle date values
      if (field.includes('Date')) {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  };
  
  if (!results) {
    return (
      <div className="card backtest-results">
        <div className="card-header">
          Backtest Results
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Running backtest...</p>
            </div>
          ) : (
            <div className="no-results">
              <p>No backtest results to display</p>
              <p>Use the form to run a backtest</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  const { metrics, name, description, strategy, parameters, symbols, startDate, endDate } = results;
  const trades = results.results?.trades || [];
  
  return (
    <div className="card backtest-results">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="backtest-name">{name}</h3>
            {description && <div className="backtest-description">{description}</div>}
          </div>
          <div className="backtest-date">
            {formatDate(startDate)} - {formatDate(endDate)}
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="backtest-tabs">
          <button 
            className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button 
            className={`tab-button ${activeTab === 'equity' ? 'active' : ''}`}
            onClick={() => setActiveTab('equity')}
          >
            Equity Curve
          </button>
          <button 
            className={`tab-button ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            Trades
          </button>
          <button 
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'summary' && (
            <div className="summary-tab">
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">Total Return</div>
                  <div className={`metric-value ${metrics.totalReturn >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercentage(metrics.totalReturn * 100)}
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Annualized Return</div>
                  <div className={`metric-value ${metrics.annualizedReturn >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercentage(metrics.annualizedReturn * 100)}
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Max Drawdown</div>
                  <div className="metric-value negative">
                    {formatPercentage(metrics.maxDrawdown * 100)}
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Sharpe Ratio</div>
                  <div className={`metric-value ${metrics.sharpeRatio >= 1 ? 'positive' : ''}`}>
                    {metrics.sharpeRatio.toFixed(2)}
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Win Rate</div>
                  <div className="metric-value">
                    {formatPercentage(metrics.winRate * 100)}
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Trade Count</div>
                  <div className="metric-value">
                    {metrics.tradeCount}
                  </div>
                </div>
              </div>
              
              <div className="summary-charts">
                <div className="summary-chart">
                  <h4>Equity Curve</h4>
                  <div className="chart-container">
                    <canvas ref={equityChartRef} className="equity-chart"></canvas>
                  </div>
                </div>
                
                <div className="summary-chart">
                  <h4>Trade PnL</h4>
                  <div className="chart-container">
                    <canvas ref={tradesChartRef} className="trades-chart"></canvas>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'equity' && (
            <div className="equity-tab">
              <div className="chart-container large">
                <canvas ref={equityChartRef} className="equity-chart"></canvas>
              </div>
            </div>
          )}
          
          {activeTab === 'trades' && (
            <div className="trades-tab">
              {trades.length === 0 ? (
                <div className="no-trades">
                  <p>No trades were executed in this backtest</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Side</th>
                        <th>Entry Date</th>
                        <th>Entry Price</th>
                        <th>Exit Date</th>
                        <th>Exit Price</th>
                        <th>Quantity</th>
                        <th>P&L</th>
                        <th>P&L %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortTrades(trades).map((trade, index) => (
                        <tr key={index}>
                          <td>{trade.symbol}</td>
                          <td className={trade.side === 'buy' ? 'buy' : 'sell'}>
                            {trade.side.toUpperCase()}
                          </td>
                          <td>{formatDate(trade.entryDate)}</td>
                          <td>{formatCurrency(trade.entryPrice)}</td>
                          <td>{formatDate(trade.exitDate)}</td>
                          <td>{formatCurrency(trade.exitPrice)}</td>
                          <td>{trade.quantity}</td>
                          <td className={trade.pnl >= 0 ? 'positive' : 'negative'}>
                            {formatCurrency(trade.pnl)}
                          </td>
                          <td className={trade.pnlPercent >= 0 ? 'positive' : 'negative'}>
                            {formatPercentage(trade.pnlPercent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="settings-tab">
              <div className="settings-section">
                <h4>Backtest Settings</h4>
                <div className="settings-grid">
                  <div className="setting-item">
                    <div className="setting-label">Strategy</div>
                    <div className="setting-value">{strategy}</div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-label">Symbols</div>
                    <div className="setting-value">{symbols.join(', ')}</div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-label">Start Date</div>
                    <div className="setting-value">{formatDate(startDate)}</div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-label">End Date</div>
                    <div className="setting-value">{formatDate(endDate)}</div>
                  </div>
                </div>
              </div>
              
              <div className="settings-section">
                <h4>Strategy Parameters</h4>
                <div className="settings-grid">
                  {parameters && Object.entries(parameters).map(([key, value]) => (
                    <div className="setting-item" key={key}>
                      <div className="setting-label">{key}</div>
                      <div className="setting-value">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .backtest-results {
          height: 100%;
        }
        
        .backtest-name {
          font-size: 1.25rem;
          margin: 0;
        }
        
        .backtest-description {
          font-size: 0.875rem;
          color: var(--secondary-color);
        }
        
        .backtest-date {
          font-size: 0.875rem;
          color: var(--secondary-color);
        }
        
        .loading, .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }
        
        .backtest-tabs {
          display: flex;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .tab-button {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
        }
        
        .tab-button.active {
          border-bottom-color: var(--primary-color);
          font-weight: bold;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .metric-item {
          padding: 1rem;
          background-color: var(--light-color);
          border-radius: var(--border-radius);
        }
        
        .metric-label {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin-bottom: 0.25rem;
        }
        
        .metric-value {
          font-size: 1.25rem;
          font-weight: bold;
        }
        
        .positive {
          color: var(--success-color);
        }
        
        .negative {
          color: var(--danger-color);
        }
        
        .summary-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .summary-chart h4 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .chart-container {
          position: relative;
          height: 200px;
          width: 100%;
        }
        
        .chart-container.large {
          height: 400px;
        }
        
        .equity-chart, .trades-chart {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .no-trades {
          text-align: center;
          padding: 2rem;
          color: var(--secondary-color);
        }
        
        .buy {
          color: var(--success-color);
        }
        
        .sell {
          color: var(--danger-color);
        }
        
        .settings-section {
          margin-bottom: 1.5rem;
        }
        
        .settings-section h4 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        .setting-item {
          padding: 0.5rem;
        }
        
        .setting-label {
          font-size: 0.875rem;
          color: var(--secondary-color);
          margin-bottom: 0.25rem;
        }
        
        .setting-value {
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .summary-charts {
            grid-template-columns: 1fr;
          }
          
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BacktestResults;