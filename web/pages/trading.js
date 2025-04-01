import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';

// Trading components
import AssetSelector from '../components/trading/AssetSelector';
import OrderForm from '../components/trading/OrderForm';
import StrategySelector from '../components/trading/StrategySelector';
import MarketData from '../components/trading/MarketData';
import OrderStatus from '../components/trading/OrderStatus';

export default function Trading() {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Fetch orders when user or selected asset changes
  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch recent orders
        const ordersResponse = await fetch('/api/trading/orders?limit=10');
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders');
        }
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  // Fetch market data when selected asset changes
  useEffect(() => {
    if (!selectedAsset) return;
    
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch market data for selected asset
        const marketDataResponse = await fetch(`/api/trading/market-data?symbols=${selectedAsset}&timeframe=1D&limit=10`);
        if (!marketDataResponse.ok) {
          throw new Error('Failed to fetch market data');
        }
        const marketDataResult = await marketDataResponse.json();
        setMarketData(marketDataResult[selectedAsset] || []);
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketData();
    
    // Refresh data every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    
    return () => clearInterval(interval);
  }, [selectedAsset]);
  
  // Handle asset selection
  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
  };
  
  // Handle order submission
  const handleOrderSubmit = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Submit order
      const orderResponse = await fetch('/api/trading/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...orderData,
          symbol: selectedAsset
        })
      });
      
      if (!orderResponse.ok) {
        throw new Error('Failed to place order');
      }
      
      const orderResult = await orderResponse.json();
      
      // Update orders list
      setOrders([orderResult, ...orders]);
      
      return orderResult;
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Handle strategy execution
  const handleStrategyExecute = async (strategy) => {
    try {
      setLoading(true);
      setError(null);
      
      // Execute strategy
      const strategyResponse = await fetch('/api/trading/strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          strategy,
          assets: selectedAsset ? [selectedAsset] : []
        })
      });
      
      if (!strategyResponse.ok) {
        throw new Error('Failed to execute strategy');
      }
      
      const strategyResult = await strategyResponse.json();
      
      // Update orders list with new orders from strategy
      const newOrders = strategyResult
        .filter(result => result.success && result.decision.action !== 'hold')
        .map(result => result.result);
      
      setOrders([...newOrders, ...orders]);
      
      return strategyResult;
    } catch (err) {
      console.error('Error executing strategy:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Handle mock data for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !selectedAsset) {
      // Set default asset for development
      setSelectedAsset('AAPL');
      
      // Mock market data
      setMarketData([
        {
          timestamp: '2025-03-31T14:30:00Z',
          open: 175.25,
          high: 176.75,
          low: 174.50,
          close: 176.25,
          volume: 1500000
        },
        {
          timestamp: '2025-03-30T14:30:00Z',
          open: 174.50,
          high: 175.75,
          low: 173.80,
          close: 175.25,
          volume: 1450000
        },
        {
          timestamp: '2025-03-29T14:30:00Z',
          open: 173.75,
          high: 175.00,
          low: 173.25,
          close: 174.50,
          volume: 1400000
        }
      ]);
      
      // Mock orders
      setOrders([
        {
          id: '1',
          symbol: 'AAPL',
          side: 'buy',
          quantity: 10,
          type: 'market',
          status: 'filled',
          created_at: '2025-03-31T10:30:00Z',
          filled_at: '2025-03-31T10:30:05Z',
          filled_qty: 10,
          filled_avg_price: 175.25
        },
        {
          id: '2',
          symbol: 'MSFT',
          side: 'buy',
          quantity: 5,
          type: 'limit',
          limit_price: 350.00,
          status: 'filled',
          created_at: '2025-03-30T11:15:00Z',
          filled_at: '2025-03-30T11:20:12Z',
          filled_qty: 5,
          filled_avg_price: 349.95
        }
      ]);
      
      setLoading(false);
    }
  }, [selectedAsset]);
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="trading-page">
      <Head>
        <title>Trading | Trading AI Agent Bot</title>
        <meta name="description" content="Execute trades with the Trading AI Agent Bot" />
      </Head>
      
      <h1 className="page-title">Trading</h1>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      <div className="row">
        <div className="col-md-3">
          <AssetSelector onSelect={handleAssetSelect} selectedAsset={selectedAsset} />
          
          <div className="mt-4">
            <OrderForm 
              onSubmit={handleOrderSubmit} 
              selectedAsset={selectedAsset} 
              marketData={marketData} 
              disabled={loading || !selectedAsset} 
            />
          </div>
          
          <div className="mt-4">
            <StrategySelector 
              onExecute={handleStrategyExecute} 
              selectedAsset={selectedAsset} 
              disabled={loading || !selectedAsset} 
            />
          </div>
        </div>
        
        <div className="col-md-9">
          <div className="row">
            <div className="col-12">
              <MarketData 
                asset={selectedAsset} 
                data={marketData} 
                loading={loading && !marketData} 
              />
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-12">
              <OrderStatus orders={orders} loading={loading && orders.length === 0} />
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .trading-page {
          padding: 1rem 0;
        }
        
        .page-title {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}