import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';

// Backtesting components
import BacktestForm from '../components/backtest/BacktestForm';
import BacktestResults from '../components/backtest/BacktestResults';
import BacktestHistory from '../components/backtest/BacktestHistory';

export default function Backtest() {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [backtestResults, setBacktestResults] = useState(null);
  const [backtestHistory, setBacktestHistory] = useState([]);
  const [error, setError] = useState(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Fetch backtest history
  useEffect(() => {
    if (!user) return;
    
    const fetchBacktestHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch backtest history
        const historyResponse = await fetch('/api/backtest/list');
        if (!historyResponse.ok) {
          throw new Error('Failed to fetch backtest history');
        }
        const historyData = await historyResponse.json();
        setBacktestHistory(historyData);
      } catch (err) {
        console.error('Error fetching backtest history:', err);
        setError(err.message);
        
        // Use mock data in development
        if (process.env.NODE_ENV === 'development') {
          setBacktestHistory(getMockBacktestHistory());
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBacktestHistory();
  }, [user]);
  
  // Handle backtest submission
  const handleBacktestSubmit = async (backtestConfig) => {
    try {
      setLoading(true);
      setError(null);
      setBacktestResults(null);
      
      // Run backtest
      const backtestResponse = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backtestConfig)
      });
      
      if (!backtestResponse.ok) {
        throw new Error('Failed to run backtest');
      }
      
      const backtestData = await backtestResponse.json();
      setBacktestResults(backtestData);
      
      // Update history
      setBacktestHistory([backtestData, ...backtestHistory]);
      
      return backtestData;
    } catch (err) {
      console.error('Error running backtest:', err);
      setError(err.message);
      
      // Use mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockResults = getMockBacktestResults(backtestConfig);
        setBacktestResults(mockResults);
        setBacktestHistory([mockResults, ...backtestHistory]);
        return mockResults;
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Handle loading a backtest from history
  const handleLoadBacktest = async (backtestId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find backtest in history
      const backtest = backtestHistory.find(b => b.id === backtestId);
      
      if (backtest) {
        setBacktestResults(backtest);
      } else {
        // Fetch backtest from API
        const backtestResponse = await fetch(`/api/backtest/${backtestId}`);
        if (!backtestResponse.ok) {
          throw new Error('Failed to fetch backtest');
        }
        const backtestData = await backtestResponse.json();
        setBacktestResults(backtestData);
      }
    } catch (err) {
      console.error('Error loading backtest:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Get mock backtest history for development
  const getMockBacktestHistory = () => {
    return [
      {
        id: '1',
        name: 'AAPL Momentum Strategy',
        description: 'Testing momentum strategy on Apple stock',
        strategy: 'momentum',
        parameters: {
          lookbackPeriod: 14,
          overboughtThreshold: 70,
          oversoldThreshold: 30
        },
        symbols: ['AAPL'],
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-03-31T00:00:00Z',
        metrics: {
          totalReturn: 0.12,
          annualizedReturn: 0.48,
          maxDrawdown: 0.05,
          sharpeRatio: 1.8,
          winRate: 0.65,
          tradeCount: 12
        },
        createdAt: '2025-03-30T10:00:00Z'
      },
      {
        id: '2',
        name: 'MSFT Mean Reversion',
        description: 'Testing mean reversion strategy on Microsoft stock',
        strategy: 'meanReversion',
        parameters: {
          lookbackPeriod: 20,
          deviationThreshold: 2
        },
        symbols: ['MSFT'],
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-03-31T00:00:00Z',
        metrics: {
          totalReturn: 0.08,
          annualizedReturn: 0.32,
          maxDrawdown: 0.04,
          sharpeRatio: 1.5,
          winRate: 0.60,
          tradeCount: 8
        },
        createdAt: '2025-03-29T14:30:00Z'
      }
    ];
  };
  
  // Get mock backtest results for development
  const getMockBacktestResults = (config) => {
    return {
      id: Date.now().toString(),
      name: config.name,
      description: config.description,
      strategy: config.strategy,
      parameters: config.parameters,
      symbols: config.symbols,
      startDate: config.startDate,
      endDate: config.endDate,
      metrics: {
        totalReturn: Math.random() * 0.2,
        annualizedReturn: Math.random() * 0.5,
        maxDrawdown: Math.random() * 0.1,
        sharpeRatio: 1 + Math.random() * 2,
        winRate: 0.5 + Math.random() * 0.3,
        tradeCount: Math.floor(Math.random() * 20) + 5
      },
      results: {
        dailyEquity: generateMockEquityCurve(config.startDate, config.endDate),
        trades: generateMockTrades(config.symbols, config.startDate, config.endDate)
      },
      createdAt: new Date().toISOString()
    };
  };
  
  // Generate mock equity curve for development
  const generateMockEquityCurve = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end - start) / (24 * 60 * 60 * 1000));
    
    const equity = [];
    let currentEquity = 100000;
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }
      
      // Random daily change (-1% to +1.5%)
      const dailyChange = (Math.random() * 2.5 - 1) / 100;
      currentEquity = currentEquity * (1 + dailyChange);
      
      equity.push({
        date: date.toISOString(),
        equity: currentEquity
      });
    }
    
    return equity;
  };
  
  // Generate mock trades for development
  const generateMockTrades = (symbols, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end - start) / (24 * 60 * 60 * 1000));
    
    const trades = [];
    const tradeCount = Math.floor(Math.random() * 15) + 5;
    
    for (let i = 0; i < tradeCount; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      // Random date within range
      const tradeDate = new Date(start);
      tradeDate.setDate(tradeDate.getDate() + Math.floor(Math.random() * days));
      
      // Skip weekends
      if (tradeDate.getDay() === 0 || tradeDate.getDay() === 6) {
        continue;
      }
      
      // Random price between $50 and $500
      const entryPrice = 50 + Math.random() * 450;
      
      // Random exit price with bias towards profit
      const exitPrice = entryPrice * (0.9 + Math.random() * 0.2);
      
      // Random quantity between 1 and 20
      const quantity = Math.floor(Math.random() * 20) + 1;
      
      // Random exit date after entry date
      const exitDate = new Date(tradeDate);
      exitDate.setDate(exitDate.getDate() + Math.floor(Math.random() * (days - (exitDate.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))));
      
      // Skip weekends for exit date
      if (exitDate.getDay() === 0 || exitDate.getDay() === 6) {
        continue;
      }
      
      trades.push({
        symbol,
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        quantity,
        entryPrice,
        entryDate: tradeDate.toISOString(),
        exitPrice,
        exitDate: exitDate.toISOString(),
        pnl: (exitPrice - entryPrice) * quantity * (Math.random() > 0.5 ? 1 : -1),
        pnlPercent: ((exitPrice / entryPrice) - 1) * 100 * (Math.random() > 0.5 ? 1 : -1)
      });
    }
    
    return trades;
  };
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="backtest-page">
      <Head>
        <title>Backtesting | Trading AI Agent Bot</title>
        <meta name="description" content="Backtest trading strategies with the Trading AI Agent Bot" />
      </Head>
      
      <h1 className="page-title">Backtesting</h1>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      <div className="row">
        <div className="col-md-4">
          <BacktestForm 
            onSubmit={handleBacktestSubmit} 
            loading={loading} 
          />
          
          <div className="mt-4">
            <BacktestHistory 
              backtests={backtestHistory} 
              onLoadBacktest={handleLoadBacktest} 
              loading={loading} 
            />
          </div>
        </div>
        
        <div className="col-md-8">
          <BacktestResults 
            results={backtestResults} 
            loading={loading && !backtestResults} 
          />
        </div>
      </div>
      
      <style jsx>{`
        .backtest-page {
          padding: 1rem 0;
        }
        
        .page-title {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}