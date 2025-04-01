import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

/**
 * Home page component
 * 
 * This component redirects to the dashboard if the user is authenticated,
 * or to the login page if the user is not authenticated.
 * 
 * @returns {JSX.Element} - Home page component
 */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="spinner"></div>
      <p className="ml-3 text-gray-600">Redirecting...</p>
    </div>
  );
}