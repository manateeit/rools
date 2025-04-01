import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';

// Settings components
import ApiKeySettings from '../components/settings/ApiKeySettings';
import UserSettings from '../components/settings/UserSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import ModelSettings from '../components/settings/ModelSettings';

export default function Settings() {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('user');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Load user data
  useEffect(() => {
    if (!user) return;
    
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load user data
        // This would typically fetch user preferences, API keys, etc.
        
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle success message
  const handleSuccess = (message) => {
    setSuccess(message);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 5000);
  };
  
  // Handle error message
  const handleError = (message) => {
    setError(message);
  };
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="settings-page">
      <Head>
        <title>Settings | Trading AI Agent Bot</title>
        <meta name="description" content="Configure your Trading AI Agent Bot settings" />
      </Head>
      
      <h1 className="page-title">Settings</h1>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      
      <div className="row">
        <div className="col-md-3">
          <div className="settings-tabs">
            <button 
              className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
              onClick={() => handleTabChange('user')}
            >
              User Settings
            </button>
            <button 
              className={`tab-button ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => handleTabChange('api')}
            >
              API Keys
            </button>
            <button 
              className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => handleTabChange('notifications')}
            >
              Notifications
            </button>
            <button 
              className={`tab-button ${activeTab === 'models' ? 'active' : ''}`}
              onClick={() => handleTabChange('models')}
            >
              LLM Models
            </button>
          </div>
        </div>
        
        <div className="col-md-9">
          <div className="settings-content">
            {activeTab === 'user' && (
              <UserSettings 
                user={user} 
                loading={loading} 
                onSuccess={handleSuccess} 
                onError={handleError} 
              />
            )}
            
            {activeTab === 'api' && (
              <ApiKeySettings 
                user={user} 
                loading={loading} 
                onSuccess={handleSuccess} 
                onError={handleError} 
              />
            )}
            
            {activeTab === 'notifications' && (
              <NotificationSettings 
                user={user} 
                loading={loading} 
                onSuccess={handleSuccess} 
                onError={handleError} 
              />
            )}
            
            {activeTab === 'models' && (
              <ModelSettings 
                user={user} 
                loading={loading} 
                onSuccess={handleSuccess} 
                onError={handleError} 
              />
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .settings-page {
          padding: 1rem 0;
        }
        
        .page-title {
          margin-bottom: 1.5rem;
        }
        
        .settings-tabs {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-color);
          height: 100%;
        }
        
        .tab-button {
          padding: 0.75rem 1rem;
          text-align: left;
          background: none;
          border: none;
          border-left: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .tab-button:hover {
          background-color: var(--light-color);
        }
        
        .tab-button.active {
          border-left-color: var(--primary-color);
          background-color: var(--light-color);
          font-weight: bold;
        }
        
        .settings-content {
          padding: 1rem;
        }
        
        @media (max-width: 768px) {
          .settings-tabs {
            flex-direction: row;
            overflow-x: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 1rem;
          }
          
          .tab-button {
            border-left: none;
            border-bottom: 3px solid transparent;
          }
          
          .tab-button.active {
            border-left-color: transparent;
            border-bottom-color: var(--primary-color);
          }
        }
      `}</style>
    </div>
  );
}