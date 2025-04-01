import { useState, useEffect } from 'react';

const UserSettings = ({ user, loading, onSuccess, onError }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [currency, setCurrency] = useState('USD');
  const [darkMode, setDarkMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Load user settings
  useEffect(() => {
    if (!user) return;
    
    const loadUserSettings = async () => {
      try {
        // In a real implementation, this would fetch from an API
        // For now, we'll use the user object and some defaults
        setEmail(user.email || '');
        setName(user.user_metadata?.name || '');
        
        // Fetch user preferences
        const response = await fetch('/api/user/preferences');
        
        if (response.ok) {
          const preferences = await response.json();
          setTimezone(preferences.timezone || 'America/New_York');
          setCurrency(preferences.currency || 'USD');
          setDarkMode(preferences.darkMode || false);
        }
      } catch (err) {
        console.error('Error loading user settings:', err);
        
        // Use defaults in development
        if (process.env.NODE_ENV === 'development') {
          setTimezone('America/New_York');
          setCurrency('USD');
          setDarkMode(false);
        }
      }
    };
    
    loadUserSettings();
  }, [user]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      
      // Update user profile
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name
        })
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Update user preferences
      const preferencesResponse = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timezone,
          currency,
          darkMode
        })
      });
      
      if (!preferencesResponse.ok) {
        throw new Error('Failed to update preferences');
      }
      
      onSuccess('User settings updated successfully');
    } catch (err) {
      console.error('Error updating user settings:', err);
      onError(err.message);
      
      // Simulate success in development
      if (process.env.NODE_ENV === 'development') {
        onSuccess('User settings updated successfully (Development Mode)');
      }
    } finally {
      setFormLoading(false);
    }
  };
  
  return (
    <div className="user-settings">
      <h2>User Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            disabled
          />
          <small className="form-text text-muted">Email cannot be changed</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || formLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            className="form-control"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={loading || formLoading}
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Anchorage">Alaska Time (AKT)</option>
            <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
            <option value="UTC">Universal Time (UTC)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
            <option value="Australia/Sydney">Sydney (AEST)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            className="form-control"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={loading || formLoading}
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="JPY">Japanese Yen (JPY)</option>
            <option value="CAD">Canadian Dollar (CAD)</option>
            <option value="AUD">Australian Dollar (AUD)</option>
            <option value="CHF">Swiss Franc (CHF)</option>
            <option value="CNY">Chinese Yuan (CNY)</option>
          </select>
        </div>
        
        <div className="form-group">
          <div className="form-check">
            <input
              type="checkbox"
              id="darkMode"
              className="form-check-input"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              disabled={loading || formLoading}
            />
            <label className="form-check-label" htmlFor="darkMode">
              Dark Mode
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || formLoading}
          >
            {formLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      
      <style jsx>{`
        .user-settings {
          max-width: 600px;
        }
        
        h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default UserSettings;