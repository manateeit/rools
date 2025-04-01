import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children, supabase }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    // Check for active session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: { user: userData } } = await supabase.auth.getUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: { user: userData } } = await supabase.auth.getUser();
          setUser(userData);
        } else {
          setUser(null);
        }
        
        // Handle auth events
        switch (event) {
          case 'SIGNED_IN':
            // Redirect to dashboard after sign in
            if (router.pathname === '/login') {
              router.push('/');
            }
            break;
            
          case 'SIGNED_OUT':
            // Redirect to login after sign out
            router.push('/login');
            break;
            
          default:
            break;
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase, router]);
  
  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Update password
  const updatePassword = async (password) => {
    try {
      setLoading(true);
      
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Auth context value
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    supabase
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}