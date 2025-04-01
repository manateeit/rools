import { useState, useEffect } from 'react';

const ApiKeySettings = ({ user, loading, onSuccess, onError }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState('alpaca');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  // Load API keys
  useEffect(() => {
    if (!user) return;
    
    const loadApiKeys = async () => {
      try {
        // Fetch API keys
        const response = await fetch('/api/user/api-keys');
        
        if (response.ok) {
          const keys = await response.json();
          setApiKeys(keys);
        }
      } catch (err) {
        console.error('Error loading API keys:', err);
        onError('Failed to load API keys');
        
        // Use mock data in development
        if (process.env.NODE_ENV === 'development') {
          setApiKeys([
            {
              id: '1',
              name: 'Alpaca Trading',
              type: 'alpaca',
              createdAt: '2025-03-15T10:00:00Z',
              lastUsed: '2025-03-30T15:30:00Z'
            },
            {
              id: '2',
              name: 'OpenAI GPT-4',
              type: 'openai',
              createdAt: '2025-03-20T14:20:00Z',
              lastUsed: '2025-03-31T09:45:00Z'
            }
          ]);
        }
      }
    };
    
    loadApiKeys();
  }, [user, onError]);
  
  // Handle add API key form submission
  const handleAddKey = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      
      // Validate inputs
      if (!newKeyName.trim()) {
        throw new Error('Key name is required');
      }
      
      if (!newKeyValue.trim()) {
        throw new Error('API key is required');
      }
      
      if (newKeyType === 'alpaca' && !newKeySecret.trim()) {
        throw new Error('API secret is required for Alpaca keys');
      }
      
      // Add API key
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newKeyName,
          type: newKeyType,
          key: newKeyValue,
          secret: newKeySecret
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add API key');
      }
      
      const newKey = await response.json();
      
      // Update API keys list
      setApiKeys([...apiKeys, newKey]);
      
      // Reset form
      setNewKeyName('');
      setNewKeyType('alpaca');
      setNewKeyValue('');
      setNewKeySecret('');
      setShowAddForm(false);
      
      onSuccess('API key added successfully');
    } catch (err) {
      console.error('Error adding API key:', err);
      onError(err.message);
      
      // Simulate success in development
      if (process.env.NODE_ENV === 'development') {
        const mockKey = {
          id: Date.now().toString(),
          name: newKeyName,
          type: newKeyType,
          createdAt: new Date().toISOString(),
          lastUsed: null
        };
        
        setApiKeys([...apiKeys, mockKey]);
        
        // Reset form
        setNewKeyName('');
        setNewKeyType('alpaca');
        setNewKeyValue('');
        setNewKeySecret('');
        setShowAddForm(false);
        
        onSuccess('API key added successfully (Development Mode)');
      }
    } finally {
      setFormLoading(false);
    }
  };
  
  // Handle delete API key
  const handleDeleteKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete API key
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }
      
      // Update API keys list
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      
      onSuccess('API key deleted successfully');
    } catch (err) {
      console.error('Error deleting API key:', err);
      onError(err.message);
      
      // Simulate success in development
      if (process.env.NODE_ENV === 'development') {
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
        onSuccess('API key deleted successfully (Development Mode)');
      }
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Get key type display name
  const getKeyTypeDisplay = (type) => {
    switch (type) {
      case 'alpaca':
        return 'Alpaca';
      case 'openai':
        return 'OpenAI';
      case 'supabase':
        return 'Supabase';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <div className="api-key-settings">
      <div className="header-actions">
        <h2>API Keys</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading || formLoading}
        >
          {showAddForm ? 'Cancel' : 'Add API Key'}
        </button>
      </div>
      
      {showAddForm && (
        <div className="add-key-form">
          <form onSubmit={handleAddKey}>
            <div className="form-group">
              <label htmlFor="keyName">Key Name</label>
              <input
                type="text"
                id="keyName"
                className="form-control"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Alpaca Trading"
                required
                disabled={formLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="keyType">Key Type</label>
              <select
                id="keyType"
                className="form-control"
                value={newKeyType}
                onChange={(e) => setNewKeyType(e.target.value)}
                disabled={formLoading}
              >
                <option value="alpaca">Alpaca</option>
                <option value="openai">OpenAI</option>
                <option value="supabase">Supabase</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="keyValue">API Key</label>
              <input
                type="text"
                id="keyValue"
                className="form-control"
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
                placeholder="Enter API key"
                required
                disabled={formLoading}
              />
            </div>
            
            {newKeyType === 'alpaca' && (
              <div className="form-group">
                <label htmlFor="keySecret">API Secret</label>
                <input
                  type="password"
                  id="keySecret"
                  className="form-control"
                  value={newKeySecret}
                  onChange={(e) => setNewKeySecret(e.target.value)}
                  placeholder="Enter API secret"
                  required
                  disabled={formLoading}
                />
              </div>
            )}
            
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-success"
                disabled={formLoading}
              >
                {formLoading ? 'Adding...' : 'Add Key'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
                disabled={formLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading API keys...</p>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="no-keys">
          <p>No API keys found</p>
          <p>Add an API key to connect to external services</p>
        </div>
      ) : (
        <div className="api-keys-list">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td>{key.name}</td>
                    <td>{getKeyTypeDisplay(key.type)}</td>
                    <td>{formatDate(key.createdAt)}</td>
                    <td>{formatDate(key.lastUsed)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="api-keys-info">
        <h3>About API Keys</h3>
        <p>
          API keys are used to connect to external services like Alpaca for trading and OpenAI for LLM capabilities.
          Your API keys are encrypted and stored securely.
        </p>
        <h4>Required API Keys</h4>
        <ul>
          <li><strong>Alpaca:</strong> Required for trading and market data</li>
          <li><strong>OpenAI:</strong> Required for AI-assisted trading strategies</li>
        </ul>
      </div>
      
      <style jsx>{`
        .api-key-settings {
          max-width: 800px;
        }
        
        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        h2 {
          font-size: 1.5rem;
          margin: 0;
        }
        
        .add-key-form {
          background-color: var(--light-color);
          padding: 1.5rem;
          border-radius: var(--border-radius);
          margin-bottom: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .loading, .no-keys {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          background-color: var(--light-color);
          border-radius: var(--border-radius);
          margin-bottom: 1.5rem;
        }
        
        .api-keys-list {
          margin-bottom: 1.5rem;
        }
        
        .api-keys-info {
          background-color: var(--light-color);
          padding: 1.5rem;
          border-radius: var(--border-radius);
        }
        
        .api-keys-info h3 {
          font-size: 1.25rem;
          margin-top: 0;
          margin-bottom: 1rem;
        }
        
        .api-keys-info h4 {
          font-size: 1rem;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .api-keys-info ul {
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default ApiKeySettings;