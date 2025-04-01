import { useState, useEffect, useRef } from 'react';

const PerformanceChart = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('1W'); // Default to 1 week
  const canvasRef = useRef(null);
  
  // Fetch performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, this would fetch from an API
        // For now, we'll use mock data
        const data = getMockPerformanceData(timeframe);
        setPerformanceData(data);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerformanceData();
  }, [timeframe]);
  
  // Draw chart when data changes
  useEffect(() => {
    if (!performanceData || !canvasRef.current) return;
    
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
    drawChart(ctx, performanceData, rect.width, rect.height);
  }, [performanceData, canvasRef]);
  
  // Get mock performance data
  const getMockPerformanceData = (timeframe) => {
    const now = new Date();
    const data = [];
    let days;
    
    switch (timeframe) {
      case '1D':
        // Hourly data for 1 day
        for (let i = 0; i < 24; i++) {
          const date = new Date(now);
          date.setHours(date.getHours() - 23 + i);
          date.setMinutes(0, 0, 0);
          
          data.push({
            date: date.toISOString(),
            value: 100000 + Math.random() * 5000 - 2500 + i * 100
          });
        }
        break;
        
      case '1W':
        // Daily data for 1 week
        days = 7;
        for (let i = 0; i < days; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - (days - 1) + i);
          date.setHours(0, 0, 0, 0);
          
          data.push({
            date: date.toISOString(),
            value: 100000 + Math.random() * 5000 - 2500 + i * 300
          });
        }
        break;
        
      case '1M':
        // Daily data for 1 month
        days = 30;
        for (let i = 0; i < days; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - (days - 1) + i);
          date.setHours(0, 0, 0, 0);
          
          data.push({
            date: date.toISOString(),
            value: 100000 + Math.random() * 8000 - 4000 + i * 200
          });
        }
        break;
        
      case '3M':
        // Weekly data for 3 months
        const weeks = 12;
        for (let i = 0; i < weeks; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - (weeks - 1) * 7 + i * 7);
          date.setHours(0, 0, 0, 0);
          
          data.push({
            date: date.toISOString(),
            value: 100000 + Math.random() * 10000 - 5000 + i * 500
          });
        }
        break;
        
      case '1Y':
        // Monthly data for 1 year
        const months = 12;
        for (let i = 0; i < months; i++) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - (months - 1) + i);
          date.setDate(1);
          date.setHours(0, 0, 0, 0);
          
          data.push({
            date: date.toISOString(),
            value: 100000 + Math.random() * 15000 - 7500 + i * 1000
          });
        }
        break;
        
      default:
        // Default to 1 week
        days = 7;
        for (let i = 0; i < days; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - (days - 1) + i);
          date.setHours(0, 0, 0, 0);
          
          data.push({
            date: date.toISOString(),
            value: 100000 + Math.random() * 5000 - 2500 + i * 300
          });
        }
    }
    
    return data;
  };
  
  // Draw chart
  const drawChart = (ctx, data, width, height) => {
    const padding = { top: 20, right: 20, bottom: 30, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Find min and max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values) * 0.99; // Add some padding
    const maxValue = Math.max(...values) * 1.01;
    
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
    
    const xLabelCount = Math.min(data.length, timeframe === '1D' ? 6 : 5);
    for (let i = 0; i < data.length; i += Math.floor(data.length / xLabelCount)) {
      const x = xScale(i);
      const date = new Date(data[i].date);
      
      let label;
      switch (timeframe) {
        case '1D':
          label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          break;
        case '1W':
        case '1M':
          label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          break;
        case '3M':
          label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          break;
        case '1Y':
          label = date.toLocaleDateString([], { month: 'short' });
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
      const y = yScale(d.value);
      
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
      const y = yScale(d.value);
      
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
      // Only draw points for certain timeframes or at the ends
      if (i === 0 || i === data.length - 1 || 
          timeframe === '1Y' || timeframe === '3M' || 
          data.length <= 10) {
        const x = xScale(i);
        const y = yScale(d.value);
        
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    if (!performanceData || performanceData.length < 2) {
      return { change: 0, percent: 0 };
    }
    
    const firstValue = performanceData[0].value;
    const lastValue = performanceData[performanceData.length - 1].value;
    
    const change = lastValue - firstValue;
    const percent = (change / firstValue) * 100;
    
    return { change, percent };
  };
  
  const { change, percent } = calculatePerformanceMetrics();
  const isPositive = change >= 0;
  
  return (
    <div className="card performance-chart">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="chart-title">Portfolio Performance</h3>
            <div className={`performance-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{formatCurrency(change)} ({percent.toFixed(2)}%)
            </div>
          </div>
          <div className="timeframe-selector">
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
            <button 
              className={`btn btn-sm ${timeframe === '3M' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setTimeframe('3M')}
            >
              3M
            </button>
            <button 
              className={`btn btn-sm ${timeframe === '1Y' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setTimeframe('1Y')}
            >
              1Y
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading performance data...</p>
          </div>
        ) : error ? (
          <div className="error">
            <p>Failed to load performance data: {error}</p>
          </div>
        ) : (
          <div className="chart-container">
            <canvas ref={canvasRef} className="performance-canvas"></canvas>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .performance-chart {
          height: 100%;
        }
        
        .chart-title {
          font-size: 1.25rem;
          margin: 0;
        }
        
        .performance-change {
          font-size: 1rem;
          font-weight: bold;
        }
        
        .positive {
          color: var(--success-color);
        }
        
        .negative {
          color: var(--danger-color);
        }
        
        .timeframe-selector {
          display: flex;
          gap: 0.5rem;
        }
        
        .loading, .error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          text-align: center;
        }
        
        .error {
          color: var(--danger-color);
        }
        
        .chart-container {
          position: relative;
          height: 300px;
          width: 100%;
        }
        
        .performance-canvas {
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

export default PerformanceChart;