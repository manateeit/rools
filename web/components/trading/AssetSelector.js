import { useState, useEffect } from 'react';

const AssetSelector = ({ onSelect, selectedAsset }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  
  // Fetch available assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch assets from API
        const response = await fetch('/api/trading/assets');
        
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        
        const data = await response.json();
        setAssets(data);
      } catch (err) {
        console.error('Error fetching assets:', err);
        setError(err.message);
        
        // Use mock data in development
        if (process.env.NODE_ENV === 'development') {
          setAssets(getMockAssets());
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssets();
  }, []);
  
  // Fetch user's watchlist
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        // Fetch watchlist from API
        const response = await fetch('/api/trading/watchlist');
        
        if (!response.ok) {
          throw new Error('Failed to fetch watchlist');
        }
        
        const data = await response.json();
        setWatchlist(data);
      } catch (err) {
        console.error('Error fetching watchlist:', err);
        
        // Use mock data in development
        if (process.env.NODE_ENV === 'development') {
          setWatchlist(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']);
        }
      }
    };
    
    fetchWatchlist();
  }, []);
  
  // Get mock assets for development
  const getMockAssets = () => {
    return [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', tradable: true },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', tradable: true },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', tradable: true },
      { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', tradable: true },
      { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', tradable: true },
      { symbol: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', tradable: true },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', tradable: true },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', tradable: true },
      { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', tradable: true },
      { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', tradable: true },
      { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', tradable: true },
      { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE', tradable: true },
      { symbol: 'MA', name: 'Mastercard Incorporated', exchange: 'NYSE', tradable: true },
      { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', exchange: 'NYSE', tradable: true },
      { symbol: 'HD', name: 'The Home Depot, Inc.', exchange: 'NYSE', tradable: true }
    ];
  };
  
  // Filter assets based on search term
  const filteredAssets = assets.filter(asset => 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle asset selection
  const handleAssetSelect = (symbol) => {
    onSelect(symbol);
  };
  
  // Add asset to watchlist
  const addToWatchlist = async (symbol) => {
    try {
      // Add to watchlist API
      const response = await fetch('/api/trading/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to watchlist');
      }
      
      // Update local watchlist
      setWatchlist([...watchlist, symbol]);
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      
      // In development, just update local state
      if (process.env.NODE_ENV === 'development') {
        setWatchlist([...watchlist, symbol]);
      }
    }
  };
  
  // Remove asset from watchlist
  const removeFromWatchlist = async (symbol) => {
    try {
      // Remove from watchlist API
      const response = await fetch(`/api/trading/watchlist/${symbol}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from watchlist');
      }
      
      // Update local watchlist
      setWatchlist(watchlist.filter(item => item !== symbol));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      
      // In development, just update local state
      if (process.env.NODE_ENV === 'development') {
        setWatchlist(watchlist.filter(item => item !== symbol));
      }
    }
  };
  
  return (
    <div className="card asset-selector">
      <div className="card-header">
        Select Asset
      </div>
      <div className="card-body">
        <div className="search-container">
          <input
            type="text"
            className="form-control"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading assets...</p>
          </div>
        ) : error && assets.length === 0 ? (
          <div className="error">
            <p>Failed to load assets: {error}</p>
          </div>
        ) : (
          <>
            <div className="asset-tabs">
              <button 
                className={`tab-button ${!searchTerm ? 'active' : ''}`}
                onClick={() => setSearchTerm('')}
              >
                Watchlist
              </button>
              <button 
                className={`tab-button ${searchTerm ? 'active' : ''}`}
                onClick={() => setSearchTerm(' ')}
              >
                All Assets
              </button>
            </div>
            
            <div className="assets-list">
              {searchTerm ? (
                filteredAssets.length > 0 ? (
                  filteredAssets.map(asset => (
                    <div 
                      key={asset.symbol}
                      className={`asset-item ${selectedAsset === asset.symbol ? 'selected' : ''}`}
                      onClick={() => handleAssetSelect(asset.symbol)}
                    >
                      <div className="asset-info">
                        <div className="asset-symbol">{asset.symbol}</div>
                        <div className="asset-name">{asset.name}</div>
                      </div>
                      <div className="asset-actions">
                        {watchlist.includes(asset.symbol) ? (
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWatchlist(asset.symbol);
                            }}
                          >
                            Remove
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToWatchlist(asset.symbol);
                            }}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>No assets found matching "{searchTerm}"</p>
                  </div>
                )
              ) : (
                watchlist.length > 0 ? (
                  assets
                    .filter(asset => watchlist.includes(asset.symbol))
                    .map(asset => (
                      <div 
                        key={asset.symbol}
                        className={`asset-item ${selectedAsset === asset.symbol ? 'selected' : ''}`}
                        onClick={() => handleAssetSelect(asset.symbol)}
                      >
                        <div className="asset-info">
                          <div className="asset-symbol">{asset.symbol}</div>
                          <div className="asset-name">{asset.name}</div>
                        </div>
                        <div className="asset-actions">
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWatchlist(asset.symbol);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="no-results">
                    <p>Your watchlist is empty</p>
                    <p>Search for assets to add them to your watchlist</p>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
      
      <style jsx>{`
        .asset-selector {
          height: 100%;
        }
        
        .search-container {
          margin-bottom: 1rem;
        }
        
        .loading, .error, .no-results {
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
        
        .asset-tabs {
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
        
        .assets-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .asset-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .asset-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .asset-item.selected {
          background-color: rgba(0, 123, 255, 0.1);
        }
        
        .asset-info {
          flex: 1;
        }
        
        .asset-symbol {
          font-weight: bold;
        }
        
        .asset-name {
          font-size: 0.875rem;
          color: var(--secondary-color);
        }
        
        .asset-actions {
          margin-left: 1rem;
        }
      `}</style>
    </div>
  );
};

export default AssetSelector;