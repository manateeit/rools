import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { logError } from '../lib/errorHandler';

/**
 * Custom 500 page for Next.js
 * 
 * This page is rendered when a server-side error occurs.
 * 
 * @returns {JSX.Element} - 500 page component
 */
export default function Custom500() {
  const router = useRouter();
  
  // Log the 500 error
  useEffect(() => {
    logError(new Error('Server error'), { 
      path: router.asPath,
      statusCode: 500
    });
  }, [router.asPath]);
  
  return (
    <div className="server-error-page">
      <div className="server-error-container">
        <h1 className="server-error-title">500</h1>
        <h2 className="server-error-subtitle">Server Error</h2>
        
        <p className="server-error-message">
          Sorry, something went wrong on our server. We're working to fix the issue.
        </p>
        
        <div className="server-error-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
          
          <Link href="/">
            <a className="btn btn-secondary">Go to Home</a>
          </Link>
        </div>
        
        <div className="server-error-help">
          <h3>What you can do:</h3>
          <ul>
            <li>Refresh the page and try again</li>
            <li>Clear your browser cache and cookies</li>
            <li>Try again later</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </div>
      </div>
      
      <style jsx>{`
        .server-error-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
          background-color: #f8f9fa;
        }
        
        .server-error-container {
          max-width: 800px;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .server-error-title {
          color: #dc3545;
          margin: 0;
          font-size: 6rem;
          line-height: 1;
        }
        
        .server-error-subtitle {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 2rem;
        }
        
        .server-error-message {
          font-size: 1.25rem;
          margin-bottom: 2rem;
        }
        
        .server-error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }
        
        .server-error-help {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
          text-align: left;
        }
        
        .server-error-help h3 {
          margin-bottom: 1rem;
        }
        
        .server-error-help ul {
          padding-left: 1.5rem;
        }
        
        .server-error-help li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}