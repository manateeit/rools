import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/auth';

const Layout = ({ children }) => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  const isActive = (path) => {
    return router.pathname === path ? 'active' : '';
  };
  
  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link href="/">
                <a>
                  <h1>Trading AI Bot</h1>
                </a>
              </Link>
            </div>
            
            <button 
              className="mobile-menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            
            <nav className={`main-nav ${isMobileMenuOpen ? 'open' : ''}`}>
              <ul>
                <li className={isActive('/')}>
                  <Link href="/">
                    <a>Dashboard</a>
                  </Link>
                </li>
                <li className={isActive('/trading')}>
                  <Link href="/trading">
                    <a>Trading</a>
                  </Link>
                </li>
                <li className={isActive('/backtest')}>
                  <Link href="/backtest">
                    <a>Backtesting</a>
                  </Link>
                </li>
                <li className={isActive('/settings')}>
                  <Link href="/settings">
                    <a>Settings</a>
                  </Link>
                </li>
                {user ? (
                  <li>
                    <button onClick={handleSignOut} className="btn-link">
                      Sign Out
                    </button>
                  </li>
                ) : (
                  <li className={isActive('/login')}>
                    <Link href="/login">
                      <a>Login</a>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Trading AI Agent Bot. All rights reserved.</p>
        </div>
      </footer>
      
      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        .header {
          background-color: var(--dark-color);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo h1 {
          font-size: 1.5rem;
          margin: 0;
        }
        
        .logo a {
          color: white;
          text-decoration: none;
        }
        
        .main-nav ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .main-nav li {
          margin-left: 1.5rem;
        }
        
        .main-nav a, .main-nav .btn-link {
          color: white;
          text-decoration: none;
          font-size: 1rem;
          transition: color 0.3s;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        
        .main-nav a:hover, .main-nav .btn-link:hover {
          color: var(--primary-color);
        }
        
        .main-nav li.active a {
          color: var(--primary-color);
          font-weight: bold;
        }
        
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }
        
        .mobile-menu-toggle span {
          display: block;
          width: 25px;
          height: 3px;
          background-color: white;
          margin: 5px 0;
          transition: all 0.3s;
        }
        
        .main-content {
          flex: 1;
          padding: 2rem 0;
        }
        
        .footer {
          background-color: var(--light-color);
          padding: 1rem 0;
          text-align: center;
          margin-top: auto;
        }
        
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block;
          }
          
          .main-nav {
            position: fixed;
            top: 60px;
            left: 0;
            width: 100%;
            background-color: var(--dark-color);
            padding: 1rem;
            transform: translateY(-100%);
            transition: transform 0.3s;
            z-index: 100;
            visibility: hidden;
          }
          
          .main-nav.open {
            transform: translateY(0);
            visibility: visible;
          }
          
          .main-nav ul {
            flex-direction: column;
          }
          
          .main-nav li {
            margin: 0.5rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;