import { Component } from 'react';
import { logError } from '../lib/errorHandler';

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree,
 * log those errors, and display a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when an error occurs
   * 
   * @param {Error} error - The error that was thrown
   * @returns {Object} - New state with error information
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  /**
   * Catch errors in any components below and re-render with error message
   * 
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Component stack information
   */
  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    logError(error, { 
      componentStack: errorInfo.componentStack,
      ...this.props.errorContext
    });
    
    this.setState({ errorInfo });
  }

  /**
   * Reset the error state
   */
  resetError = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children } = this.props;
    
    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback(error, errorInfo, this.resetError);
      }
      
      // Otherwise, use the default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>Something went wrong</h2>
            <p>We're sorry, but an error occurred while rendering this page.</p>
            
            <div className="error-actions">
              <button 
                className="btn btn-primary" 
                onClick={this.resetError}
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
            
            {process.env.NODE_ENV !== 'production' && (
              <div className="error-details">
                <h3>Error Details</h3>
                <p className="error-message">{error?.toString()}</p>
                
                {errorInfo && (
                  <div className="error-stack">
                    <h4>Component Stack</h4>
                    <pre>{errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <style jsx>{`
            .error-boundary {
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
            }
            
            h2 {
              color: #dc3545;
              margin-top: 0;
            }
            
            .error-actions {
              display: flex;
              gap: 1rem;
              margin: 2rem 0;
            }
            
            .error-details {
              margin-top: 2rem;
              padding-top: 1rem;
              border-top: 1px solid #dee2e6;
            }
            
            .error-message {
              padding: 1rem;
              background-color: #f8f9fa;
              border-radius: 4px;
              font-family: monospace;
              overflow-x: auto;
            }
            
            .error-stack {
              margin-top: 1rem;
            }
            
            .error-stack pre {
              padding: 1rem;
              background-color: #f8f9fa;
              border-radius: 4px;
              overflow-x: auto;
              font-size: 0.875rem;
            }
          `}</style>
        </div>
      );
    }

    // If there's no error, render children normally
    return children;
  }
}

export default ErrorBoundary;