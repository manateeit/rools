import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';

/**
 * Dashboard page component
 * 
 * @returns {JSX.Element} - Dashboard page component
 */
export default function Dashboard() {
  const { user } = useAuth();
  const [accountData, setAccountData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch account data
        const accountResponse = await fetch('/api/trading/account');
        if (!accountResponse.ok) {
          throw new Error('Failed to fetch account data');
        }
        const accountData = await accountResponse.json();
        setAccountData(accountData);
        
        // Fetch positions
        const positionsResponse = await fetch('/api/trading/positions');
        if (!positionsResponse.ok) {
          throw new Error('Failed to fetch positions');
        }
        const positionsData = await positionsResponse.json();
        setPositions(positionsData);
        
        // Fetch recent trades
        const tradesResponse = await fetch('/api/trading/trades?limit=5');
        if (!tradesResponse.ok) {
          throw new Error('Failed to fetch trades');
        }
        const tradesData = await tradesResponse.json();
        setRecentTrades(tradesData);
        
        // Fetch market data for major indices
        const symbols = ['SPY', 'QQQ', 'DIA'];
        const marketResponse = await fetch(`/api/trading/market-data?symbols=${symbols.join(',')}`);
        if (!marketResponse.ok) {
          throw new Error('Failed to fetch market data');
        }
        const marketData = await marketResponse.json();
        setMarketData(marketData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Refresh data every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };
  
  // Get badge color based on value
  const getBadgeColor = (value) => {
    if (value > 0) return 'badge-green';
    if (value < 0) return 'badge-red';
    return 'badge-gray';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner"></div>
        <p className="ml-3">Loading dashboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
      
      {/* Account Summary */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="text-lg font-medium text-gray-900">Account Summary</h2>
        </div>
        <div className="dashboard-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(accountData?.portfolio_value || 0)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Cash</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(accountData?.cash || 0)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Buying Power</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(accountData?.buying_power || 0)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Day Trade Count</p>
              <p className="text-2xl font-semibold text-gray-900">{accountData?.daytrade_count || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Positions */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="text-lg font-medium text-gray-900">Positions</h2>
        </div>
        <div className="dashboard-card-body">
          {positions.length === 0 ? (
            <p className="text-gray-500">No positions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entry Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P&L
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {positions.map((position) => (
                    <tr key={position.symbol}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {position.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {position.qty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(position.avg_entry_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(position.current_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(position.market_value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`badge ${getBadgeColor(position.unrealized_pl_percent)}`}>
                          {formatCurrency(position.unrealized_pl)} ({formatPercentage(position.unrealized_pl_percent)})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Trades */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="text-lg font-medium text-gray-900">Recent Trades</h2>
        </div>
        <div className="dashboard-card-body">
          {recentTrades.length === 0 ? (
            <p className="text-gray-500">No recent trades found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Side
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTrades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trade.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`badge ${trade.side === 'buy' ? 'badge-green' : 'badge-red'}`}>
                          {trade.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trade.qty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(trade.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(trade.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Market Overview */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2 className="text-lg font-medium text-gray-900">Market Overview</h2>
        </div>
        <div className="dashboard-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(marketData).map(([symbol, data]) => (
              <div key={symbol} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">{symbol}</p>
                  <span className={`badge ${getBadgeColor(data.percent_change)}`}>
                    {formatPercentage(data.percent_change)}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{formatCurrency(data.price)}</p>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Open: {formatCurrency(data.open)}</span>
                  <span>High: {formatCurrency(data.high)}</span>
                  <span>Low: {formatCurrency(data.low)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}