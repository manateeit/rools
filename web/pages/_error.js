import { logError } from '../lib/errorHandler';

/**
 * Custom error page for Next.js
 * 
 * This page is rendered when an error occurs on the server or client side.
 * 
 * @param {Object} props - Component props
 * @param {number} props.statusCode - HTTP status code
 * @param {Error} props.err - Error object
 * @returns {JSX.Element} - Error page component
 */
function Error({ statusCode, err }) {
  // Log the error
  if (err) {
    logError(err, { statusCode });
  }
  
  return (
    <div className="error-page">
      <div className="error-container">
        <h1 className="error-title">
          {statusCode ? `Error ${statusCode}` : 'An error occurred'}
        </h1>
        
        <p className="error-message">
          {statusCode === 404
            ? 'The page you are looking for does not exist.'
            : 'Sorry, something went wrong on our end.'}
        </p>
        
        <div className="error-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </button>
        </div>
        
        {process.env.NODE_ENV !== 'production' && err && (
          <div className="error-details">
            <h3>Error Details</h3>
            <p className="error-stack">{err.message}</p>
            <pre>{err.stack}</pre>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .error-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
          background-color: #f8f9fa;
        }
        
        .error-container {
          max-width: 800px;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .error-title {
          color: #dc3545;
          margin-top: 0;
          font-size: 2.5rem;
        }
        
        .error-message {
          font-size: 1.25rem;
          margin: 1.5rem 0;
        }
        
        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 2rem 0;
        }
        
        .error-details {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
          text-align: left;
        }
        
        .error-stack {
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          font-family: monospace;
          overflow-x: auto;
        }
        
        .error-details pre {
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.875rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}

/**
 * Get initial props for the error page
 * 
 * @param {Object} ctx - Context object
 * @param {Object} ctx.res - Response object
 * @param {Object} ctx.err - Error object
 * @returns {Object} - Initial props
 */
Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, err };
};

export default Error;