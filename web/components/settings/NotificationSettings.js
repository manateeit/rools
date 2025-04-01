import { useState, useEffect } from 'react';

const NotificationSettings = ({ user, loading, onSuccess, onError }) => {
  const [emailNotifications, setEmailNotifications] = useState({
    tradeExecuted: true,
    orderFilled: true,
    orderCanceled: false,
    dailySummary: true,
    weeklyReport: true,
    marketAlerts: false
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    tradeExecuted: true,
    orderFilled: true,
    orderCanceled: true,
    dailySummary: false,
    weeklyReport: false,
    marketAlerts: true
  });
  
  const [emailAddress, setEmailAddress] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  // Load notification settings
  useEffect(() => {
    if (!user) return;
    
    const loadNotificationSettings = async () => {
      try {
        // Set email from user object
        setEmailAddress(user.email || '');
        
        // Fetch notification settings
        const response = await fetch('/api/user/notifications');
        
        if (response.ok) {
          const settings = await response.json();
          setEmailNotifications(settings.email || emailNotifications);
          setPushNotifications(settings.push || pushNotifications);
        }
      } catch (err) {
        console.error('Error loading notification settings:', err);
        
        // Use defaults in development
        if (process.env.NODE_ENV === 'development') {
          // Keep default values
        }
      }
    };
    
    loadNotificationSettings();
  }, [user]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      
      // Update notification settings
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailNotifications,
          push: pushNotifications
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update notification settings');
      }
      
      onSuccess('Notification settings updated successfully');
    } catch (err) {
      console.error('Error updating notification settings:', err);
      onError(err.message);
      
      // Simulate success in development
      if (process.env.NODE_ENV === 'development') {
        onSuccess('Notification settings updated successfully (Development Mode)');
      }
    } finally {
      setFormLoading(false);
    }
  };
  
  // Handle email notification toggle
  const handleEmailToggle = (key) => {
    setEmailNotifications({
      ...emailNotifications,
      [key]: !emailNotifications[key]
    });
  };
  
  // Handle push notification toggle
  const handlePushToggle = (key) => {
    setPushNotifications({
      ...pushNotifications,
      [key]: !pushNotifications[key]
    });
  };
  
  return (
    <div className="notification-settings">
      <h2>Notification Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="email-section">
          <h3>Email Notifications</h3>
          <p className="email-address">
            Notifications will be sent to: <strong>{emailAddress}</strong>
          </p>
          
          <div className="notification-options">
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="emailTradeExecuted"
                  className="form-check-input"
                  checked={emailNotifications.tradeExecuted}
                  onChange={() => handleEmailToggle('tradeExecuted')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="emailTradeExecuted">
                  Trade Executed
                </label>
              </div>
              <div className="option-description">
                Receive an email when a trade is executed by the system
              </div>
            </div>
            
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="emailOrderFilled"
                  className="form-check-input"
                  checked={emailNotifications.orderFilled}
                  onChange={() => handleEmailToggle('orderFilled')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="emailOrderFilled">
                  Order Filled
                </label>
              </div>
              <div className="option-description">
                Receive an email when an order is filled
              </div>
            </div>
            
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="emailOrderCanceled"
                  className="form-check-input"
                  checked={emailNotifications.orderCanceled}
                  onChange={() => handleEmailToggle('orderCanceled')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="emailOrderCanceled">
                  Order Canceled
                </label>
              </div>
              <div className="option-description">
                Receive an email when an order is canceled
              </div>
            </div>
            
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="emailDailySummary"
                  className="form-check-input"
                  checked={emailNotifications.dailySummary}
                  onChange={() => handleEmailToggle('dailySummary')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="emailDailySummary">
                  Daily Summary
                </label>
              </div>
              <div className="option-description">
                Receive a daily summary of your trading activity
              </div>
            </div>
            
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="emailWeeklyReport"
                  className="form-check-input"
                  checked={emailNotifications.weeklyReport}
                  onChange={() => handleEmailToggle('weeklyReport')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="emailWeeklyReport">
                  Weekly Report
                </label>
              </div>
              <div className="option-description">
                Receive a weekly report of your trading performance
              </div>
            </div>
            
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="emailMarketAlerts"
                  className="form-check-input"
                  checked={emailNotifications.marketAlerts}
                  onChange={() => handleEmailToggle('marketAlerts')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="emailMarketAlerts">
                  Market Alerts
                </label>
              </div>
              <div className="option-description">
                Receive alerts about significant market events
              </div>
            </div>
          </div>
        </div>
        
        <div className="push-section">
          <h3>Push Notifications</h3>
          <p className="push-description">
            Push notifications will be sent to your browser when you're logged in
          </p>
          
          <div className="notification-options">
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="pushTradeExecuted"
                  className="form-check-input"
                  checked={pushNotifications.tradeExecuted}
                  onChange={() => handlePushToggle('tradeExecuted')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="pushTradeExecuted">
                  Trade Executed
                </label>
              </div>
              <div className="option-description">
                Receive a push notification when a trade is executed by the system
              </div>
            </div>
            
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="pushOrderFilled"
                  className="form-check-input"
                  checked={pushNotifications.orderFilled}
                  onChange={() => handlePushToggle('orderFilled')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="pushOrderFilled">
                  Order Filled
                </label>
              </div>
              <div className="option-description">
                Receive a push notification when an order is filled
              </div>
            </div>
            
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="pushOrderCanceled"
                  className="form-check-input"
                  checked={pushNotifications.orderCanceled}
                  onChange={() => handlePushToggle('orderCanceled')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="pushOrderCanceled">
                  Order Canceled
                </label>
              </div>
              <div className="option-description">
                Receive a push notification when an order is canceled
              </div>
            </div>
            
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="pushDailySummary"
                  className="form-check-input"
                  checked={pushNotifications.dailySummary}
                  onChange={() => handlePushToggle('dailySummary')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="pushDailySummary">
                  Daily Summary
                </label>
              </div>
              <div className="option-description">
                Receive a daily summary of your trading activity
              </div>
            </div>
            
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="pushWeeklyReport"
                  className="form-check-input"
                  checked={pushNotifications.weeklyReport}
                  onChange={() => handlePushToggle('weeklyReport')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="pushWeeklyReport">
                  Weekly Report
                </label>
              </div>
              <div className="option-description">
                Receive a weekly report of your trading performance
              </div>
            </div>
            
            <div className="notification-option">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="pushMarketAlerts"
                  className="form-check-input"
                  checked={pushNotifications.marketAlerts}
                  onChange={() => handlePushToggle('marketAlerts')}
                  disabled={loading || formLoading}
                />
                <label className="form-check-label" htmlFor="pushMarketAlerts">
                  Market Alerts
                </label>
              </div>
              <div className="option-description">
                Receive alerts about significant market events
              </div>
            </div>
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
        .notification-settings {
          max-width: 800px;
        }
        
        h2 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        .email-section, .push-section {
          margin-bottom: 2rem;
        }
        
        .email-address, .push-description {
          margin-bottom: 1rem;
          color: var(--secondary-color);
        }
        
        .notification-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        .notification-option {
          padding: 0.75rem;
          background-color: var(--light-color);
          border-radius: var(--border-radius);
        }
        
        .option-description {
          margin-top: 0.25rem;
          font-size: 0.875rem;
          color: var(--secondary-color);
        }
        
        .form-group {
          margin-top: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .notification-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSettings;