import { useState, useEffect, useRef } from 'react';

const MarketData = ({ asset, data, loading }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('candle');
  const canvasRef = useRef(null);
  
  // Draw chart when data changes
  useEffect(() => {
    if (!data || data.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
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
    if (chartType === 'candle') {
      drawCandlestickChart(ctx, data, rect.width, rect.height);
    } else {
      drawLineChart(ctx, data, rect.width, rect.height);
    }
  }, [data, chartType, canvasRef]);
  
  // Draw candlestick chart
  const drawCandlestickChart = (ctx, data, width, height) => {
    const padding = { top: 20, right: 50, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Find min and max values
    const highValues = data.map(d => d.high);
    const lowValues = data.map(d => d.low);
    const maxValue = Math.max(...highValues) * 1.01; // Add some padding
    const minValue = Math.min(...lowValues) * 0.99;
    
    // Scale functions
    const xScale = (i) => padding.left + ((i + 0.5) / data.length) * chartWidth;
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
    
    const xLabelCount = Math.min(data.length, 5);
    for (let i = 0; i < data.length; i += Math.floor(data.length / xLabelCount)) {
      const x = xScale(i);
      const date = new Date(data[i].timestamp);
      
      let label;
      switch (timeframe) {
        case '1D':
          label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          break;
        case '1W':
        case '1M':
          label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          break;
        default:
          label = date.toLocaleDateString();
      }
      
      ctx.fillText(label, x, padding.top + chartHeight + 10);
    }
    
    // Draw candlesticks
    const candleWidth = Math.min(chartWidth / data.length * 0.8, 15);
    
    data.forEach((d, i) => {
      const x = xScale(i);
      const open = yScale(d.open);
      const close = yScale(d.close);
      const high = yScale(d.high);
      const low = yScale(d.low);
      
      // Draw high-low line
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, high);
      ctx.lineTo(x, low);
      ctx.stroke();
      
      // Draw candle body
      const isUp = d.close >= d.open;
      ctx.fillStyle = isUp ? '#28a745' : '#dc3545';
      
      const candleHeight = Math.abs(close - open);
      const y = isUp ? open : close;
      
      ctx.fillRect(x - candleWidth / 2, y, candleWidth, candleHeight);
      
      // Draw candle border
      ctx.strokeStyle = isUp ? '#1e7e34' : '#bd2130';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - candleWidth / 2, y, candleWidth, candleHeight);
    });
  };
  
  // Draw line chart
  const drawLineChart = (ctx, data, width, height) => {
    const padding = { top: 20, right: 50, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Find min and max values
    const closeValues = data.map(d => d.close);
    const maxValue = Math.max(...closeValues) * 1.01; // Add some padding
    const minValue = Math.min(...closeValues) * 0.99;
    
    // Scale functions
    const xScale = (i) => padding.left + (i / (data.length - 1)) * chartWidth;
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
    
    const xLabelCount = Math.min(data.length, 5);
    for (let i = 0; i < data.length; i += Math.floor(data.length / xLabelCount)) {
      const x = xScale(i);
      const date = new Date(data[i].timestamp);
      
      let label;
      switch (timeframe) {
        case '1D':
          label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          break;
        case '1W':
        case '1M':
          label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          break;
        default:
          label = date.toLocaleDateString();
      }
      
      ctx.fillText(label, x, padding.top + chartHeight + 10);
    }
    
    // Draw line
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.close);
      
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
    
    data.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.close);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.lineTo(xScale(data.length - 1), padding.top + chartHeight);
    ctx.lineTo(xScale(0), padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();
    
    // Draw points
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    
    data.forEach((d, i) => {
      // Only draw points at the ends
      if (i === 0 || i === data.length - 1) {
        const x = xScale(i);
        const y = yScale(d.close);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Calculate price change
  const calculatePriceChange = () => {
    if (!data || data.length < 2) return { change: 0, percent: 0 };
    
    const firstPrice = data[0].close;
    const lastPrice = data[data.length - 1].close;
    
    const change = lastPrice - firstPrice;
    const percent = (change / firstPrice) * 100;
    
    return { change, percent };
  };
  
  const { change, percent } = calculatePriceChange();
  const isPositive = change >= 0;
  
  // Get latest price
  const getLatestPrice = () => {
    if (!data || data.length === 0) return null;
    
    return data[data.length - 1].close;
  };
  
  const latestPrice = getLatestPrice();
  
  return (
    <div className="card market-data">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <div className="asset-info">
            {asset ? (
              <>
                <h3 className="asset-symbol">{asset}</h3>
                {latestPrice && (
                  <div className="price-info">
                    <span className="current-price">{formatCurrency(latestPrice)}</span>
                    <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(change)} ({percent.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </>
            ) : (
              <h3>Market Data</h3>
            )}
          </div>
          <div className="chart-controls">
            <div className="btn-group mr-2">
              <button 
                className={`btn btn-sm ${chartType === 'candle' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setChartType('candle')}
              >
                Candle
              </button>
              <button 
                className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setChartType('line')}
              >
                Line
              </button>
            </div>
            <div className="btn-group">
              <button 
                className={`btn btn-sm ${timeframe === '1D' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeframe('1D')}
              >
                1D
              </button>
              <button 
                className={`btn btn-sm ${timeframe === '1W' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeframe('1W')}
              >
                1W
              </button>
              <button 
                className={`btn btn-sm ${timeframe === '1M' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeframe('1M')}
              >
                1M
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        {!asset ? (
          <div className="no-asset-selected">
            <p>Please select an asset to view market data</p>
          </div>
        ) : loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading market data...</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="no-data">
            <p>No market data available for {asset}</p>
          </div>
        ) : (
          <div className="chart-container">
            <canvas ref={canvasRef} className="market-chart"></canvas>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .market-data {
          height: 100%;
        }
        
        .asset-info {
          display: flex;
          flex-direction: column;
        }
        
        .asset-symbol {
          font-size: 1.5rem;
          margin: 0;
        }
        
        .price-info {
          display: flex;
          align-items: center;
        }
        
        .current-price {
          font-size: 1.1rem;
          font-weight: bold;
          margin-right: 0.5rem;
        }
        
        .price-change {
          font-size: 0.9rem;
        }
        
        .positive {
          color: var(--success-color);
        }
        
        .negative {
          color: var(--danger-color);
        }
        
        .chart-controls {
          display: flex;
        }
        
        .mr-2 {
          margin-right: 0.5rem;
        }
        
        .no-asset-selected, .loading, .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          text-align: center;
        }
        
        .chart-container {
          position: relative;
          height: 300px;
          width: 100%;
        }
        
        .market-chart {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default MarketData;