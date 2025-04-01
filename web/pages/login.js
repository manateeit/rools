import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/auth';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await signIn(email, password);
      
      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle demo login
  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would use actual demo credentials
      // For now, we'll just simulate a successful login
      setTimeout(() => {
        // Redirect to dashboard
        router.push('/');
      }, 1000);
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Failed to log in with demo account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <Head>
        <title>Login | Trading AI Agent Bot</title>
        <meta name="description" content="Log in to your Trading AI Agent Bot account" />
      </Head>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Trading AI Agent Bot</h1>
            <p>Log in to your account</p>
          </div>
          
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>
          
          <div className="login-divider">
            <span>or</span>
          </div>
          
          <button
            className="btn btn-secondary w-100"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Try Demo Account
          </button>
          
          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link href="/signup">
                <a>Sign up</a>
              </Link>
            </p>
            <p>
              <Link href="/forgot-password">
                <a>Forgot password?</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--background-color);
        }
        
        .login-container {
          width: 100%;
          max-width: 400px;
          padding: 1rem;
        }
        
        .login-card {
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          padding: 2rem;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .login-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        
        .login-header p {
          color: var(--secondary-color);
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .login-divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
          color: var(--secondary-color);
        }
        
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background-color: var(--border-color);
        }
        
        .login-divider span {
          padding: 0 1rem;
        }
        
        .login-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
        }
        
        .login-footer p {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}