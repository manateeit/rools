import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AuthProvider, useAuth } from '../lib/auth';
import Layout from '../components/layout/Layout';
import ErrorBoundary from '../components/ErrorBoundary';

// Import global styles
import '../styles/globals.css';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/reset-password', '/forgot-password'];

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent({ Component, pageProps }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  
  // Check authentication and redirect if needed
  useEffect(() => {
    if (loading) return;
    
    const isPublicRoute = publicRoutes.includes(router.pathname);
    
    if (!user && !isPublicRoute) {
      // Redirect to login if not authenticated and not on a public route
      router.push('/login');
    } else if (user && isPublicRoute && router.pathname !== '/reset-password') {
      // Redirect to dashboard if authenticated and on a public route (except reset password)
      router.push('/dashboard');
    } else {
      setIsReady(true);
    }
  }, [user, loading, router]);
  
  // Show loading state
  if (loading || !isReady) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100vw;
          }
          
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #007bff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }
  
  // Get error context for error boundary
  const errorContext = {
    path: router.pathname,
    userId: user?.id,
    isAuthenticated: !!user
  };
  
  // Render page with or without layout based on route
  const isPublicRoute = publicRoutes.includes(router.pathname);
  
  if (isPublicRoute) {
    return (
      <>
        <Head>
          <title>Trading AI Agent Bot</title>
          <meta name="description" content="AI-powered trading bot with LLM capabilities" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ErrorBoundary errorContext={errorContext}>
          <Component {...pageProps} />
        </ErrorBoundary>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>Trading AI Agent Bot</title>
        <meta name="description" content="AI-powered trading bot with LLM capabilities" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ErrorBoundary errorContext={errorContext}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ErrorBoundary>
    </>
  );
}

export default MyApp;