import { useState, useEffect } from 'react';

const MarketOverview = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch market data for major indices
        const symbols = ['SPY', 'QQQ', 'DIA', 'IWM'];
        const response = await fetch(`/api/trading/market-data?symbols=${symbols.join(',')}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        
        const data = await response.json();
        setMarketData(data);
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError(err.message);
        
        // Use mock data in development
        if (process.env.NODE_ENV === 'development') {
          setMarketData(getMockMarketData());
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchMarketData, 300000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get mock market data for development
  const getMockMarketData = () => {
    return {
      'SPY': [
        {
          timestamp: new Date().toISOString(),
          open: 500.25,
          high: 505.75,
          low: 498.50,
          close: 503.25,
          volume: 75000000
        }
      ],
      'QQQ': [
        {
          timestamp: new Date().toISOString(),
          open: 420.10,
          high: 425.50,
          low: 418.75,
          close: 424.80,
          volume: 45000000
        }
      ],
      'DIA': [
        {
          timestamp: new Date().toISOString(),
          open: 380.50,
          high: 383.25,
          low: 379.80,
          close: 382.75,
          volume: 25000000
        }
      ],
      'IWM': [
        {
          timestamp: new Date().toISOString(),
          open: 210.25,
          high: 212.50,
          low: 209.75,
          close: 211.80,
          volume: 30000000
        }
      ]
    };
  };
  
  // Get index name
  const getIndexName = (symbol) => {
    const indexMap = {
      'SPY': 'S&P 500',
      'QQQ': 'NASDAQ',
      'DIA': 'Dow Jones',
      'IWM': 'Russell 2000'
    };
    
    return indexMap[symbol] || symbol;
  };
  
  // Calculate price change
  const calculatePriceChange = (data) => {
    if (!data || data.length === 0) return { change: 0, percent: 0 };
    
    const latestData = data[data.length - 1];
    const change = latestData.close - latestData.open;
    const percent = (change / latestData.open) * 100;
    
    return { change, percent };
  };
  
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
  
  return (
    <div className="card market-overview">
      <div className="card-header">
        Market Overview
      </div>
      <div className="card-body">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading market data...</p>
          </div>
        ) : error && !marketData ? (
          <div className="error">
            <p>Failed to load market data: {error}</p>
          </div>
        ) : (
          <div className="market-indices">
            {marketData && Object.keys(marketData).map((symbol) => {
              const data = marketData[symbol];
              const { change, percent } = calculatePriceChange(data);
              const isPositive = change >= 0;
              
              if (!data || data.length === 0) return null;
              
              const latestData = data[data.length - 1];
              
              return (
                <div key={symbol} className="market-index">
                  <div className="index-header">
                    <div className="index-name">{getIndexName(symbol)}</div>
                    <div className="index-symbol">{symbol}</div>
                  </div>
                  <div className="index-price">{formatCurrency(latestData.close)}</div>
                  <div className={`index-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(change)} ({formatPercentage(percent)})
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .market-overview {
          height: 100%;
        }
        
        .loading, .error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }
        
        .error {
          color: var(--danger-color);
        }
        
        .market-indices {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        .market-index {
          padding: 1rem;
          border-radius: var(--border-radius);
          background-color: var(--light-color);
          transition: transform 0.2s;
        }
        
        .market-index:hover {
          transform: translateY(-2px);
          box-shadow: var(--box-shadow);
        }
        
        .index-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .index-name {
          font-weight: bold;
        }
        
        .index-symbol {
          color: var(--secondary-color);
          font-size: 0.875rem;
        }
        
        .index-price {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
        }
        
        .index-change {
          font-size: 1rem;
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

export default MarketOverview;