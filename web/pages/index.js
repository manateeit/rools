import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';

// Dashboard components
import AccountSummary from '../components/dashboard/AccountSummary';
import PositionsList from '../components/dashboard/PositionsList';
import MarketOverview from '../components/dashboard/MarketOverview';
import RecentTrades from '../components/dashboard/RecentTrades';
import PerformanceChart from '../components/dashboard/PerformanceChart';

export default function Dashboard() {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState(null);
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [error, setError] = useState(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch account information
        const accountResponse = await fetch('/api/trading/account');
        if (!accountResponse.ok) {
          throw new Error('Failed to fetch account information');
        }
        const accountData = await accountResponse.json();
        setAccountInfo(accountData);
        
        // Fetch positions
        const positionsResponse = await fetch('/api/trading/positions');
        if (!positionsResponse.ok) {
          throw new Error('Failed to fetch positions');
        }
        const positionsData = await positionsResponse.json();
        setPositions(positionsData);
        
        // Fetch recent trades
        const tradesResponse = await fetch('/api/trading/trades?limit=10');
        if (!tradesResponse.ok) {
          throw new Error('Failed to fetch recent trades');
        }
        const tradesData = await tradesResponse.json();
        setTrades(tradesData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Refresh data every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  // Handle mock data for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && loading && !accountInfo) {
      // Mock data for development
      setAccountInfo({
        status: 'ACTIVE',
        currency: 'USD',
        cash: 100000,
        portfolioValue: 105250.75,
        buyingPower: 100000,
        daytradeCount: 0,
        isPaperAccount: true
      });
      
      setPositions([
        {
          symbol: 'AAPL',
          quantity: 10,
          entryPrice: 175.25,
          currentPrice: 180.50,
          marketValue: 1805.00,
          unrealizedPL: 52.50,
          unrealizedPLPercent: 3.00
        },
        {
          symbol: 'MSFT',
          quantity: 5,
          entryPrice: 350.10,
          currentPrice: 355.75,
          marketValue: 1778.75,
          unrealizedPL: 28.25,
          unrealizedPLPercent: 1.61
        },
        {
          symbol: 'GOOGL',
          quantity: 8,
          entryPrice: 140.20,
          currentPrice: 142.80,
          marketValue: 1142.40,
          unrealizedPL: 20.80,
          unrealizedPLPercent: 1.85
        }
      ]);
      
      setTrades([
        {
          id: '1',
          symbol: 'AAPL',
          side: 'buy',
          quantity: 10,
          price: 175.25,
          executedAt: '2025-03-30T14:30:00Z',
          status: 'filled'
        },
        {
          id: '2',
          symbol: 'MSFT',
          side: 'buy',
          quantity: 5,
          price: 350.10,
          executedAt: '2025-03-30T15:15:00Z',
          status: 'filled'
        },
        {
          id: '3',
          symbol: 'GOOGL',
          side: 'buy',
          quantity: 8,
          price: 140.20,
          executedAt: '2025-03-31T10:45:00Z',
          status: 'filled'
        }
      ]);
      
      setLoading(false);
    }
  }, [loading, accountInfo]);
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="dashboard">
      <Head>
        <title>Dashboard | Trading AI Agent Bot</title>
        <meta name="description" content="Trading AI Agent Bot Dashboard" />
      </Head>
      
      <h1 className="page-title">Dashboard</h1>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-12">
              <AccountSummary accountInfo={accountInfo} />
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-8">
              <PerformanceChart />
            </div>
            <div className="col-4">
              <MarketOverview />
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-6">
              <PositionsList positions={positions} />
            </div>
            <div className="col-6">
              <RecentTrades trades={trades} />
            </div>
          </div>
        </>
      )}
      
      <style jsx>{`
        .dashboard {
          padding: 1rem 0;
        }
        
        .page-title {
          margin-bottom: 1.5rem;
        }
        
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
}