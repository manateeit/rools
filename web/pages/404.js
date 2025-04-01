import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { logError } from '../lib/errorHandler';

/**
 * Custom 404 page for Next.js
 * 
 * This page is rendered when a page is not found.
 * 
 * @returns {JSX.Element} - 404 page component
 */
export default function Custom404() {
  const router = useRouter();
  
  // Log the 404 error
  useEffect(() => {
    logError(new Error('Page not found'), { 
      path: router.asPath,
      statusCode: 404
    });
  }, [router.asPath]);
  
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        
        <p className="not-found-message">
          The page you are looking for does not exist or has been moved.
        </p>
        
        <div className="not-found-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => router.back()}
          >
            Go Back
          </button>
          
          <Link href="/">
            <a className="btn btn-secondary">Go to Home</a>
          </Link>
        </div>
        
        <div className="not-found-help">
          <h3>Looking for something?</h3>
          <ul>
            <li>
              <Link href="/dashboard">
                <a>Dashboard</a>
              </Link>
              - View your trading dashboard
            </li>
            <li>
              <Link href="/trading">
                <a>Trading</a>
              </Link>
              - Execute trades and manage positions
            </li>
            <li>
              <Link href="/backtest">
                <a>Backtesting</a>
              </Link>
              - Test trading strategies
            </li>
            <li>
              <Link href="/settings">
                <a>Settings</a>
              </Link>
              - Configure your account
            </li>
          </ul>
        </div>
      </div>
      
      <style jsx>{`
        .not-found-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
          background-color: #f8f9fa;
        }
        
        .not-found-container {
          max-width: 800px;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .not-found-title {
          color: #dc3545;
          margin: 0;
          font-size: 6rem;
          line-height: 1;
        }
        
        .not-found-subtitle {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 2rem;
        }
        
        .not-found-message {
          font-size: 1.25rem;
          margin-bottom: 2rem;
        }
        
        .not-found-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }
        
        .not-found-help {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
          text-align: left;
        }
        
        .not-found-help h3 {
          margin-bottom: 1rem;
        }
        
        .not-found-help ul {
          padding-left: 1.5rem;
        }
        
        .not-found-help li {
          margin-bottom: 0.5rem;
        }
        
        .not-found-help a {
          color: #007bff;
          text-decoration: none;
          font-weight: bold;
        }
        
        .not-found-help a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}