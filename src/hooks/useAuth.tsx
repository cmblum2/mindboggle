
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session and set up auth state listener
  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (session?.user) {
          const { id, email } = session.user;
          const name = session.user.user_metadata?.name || email?.split('@')[0] || '';
          setUser({ id, email, name });
          
          // Show toast when email is confirmed
          if (event === 'SIGNED_IN' && window.localStorage.getItem('pendingEmailConfirmation') === 'true') {
            window.localStorage.removeItem('pendingEmailConfirmation');
            // Use setTimeout to ensure the toast system is initialized
            setTimeout(() => {
              const toast = require('@/hooks/use-toast').toast;
              toast({
                title: "Email confirmed!",
                description: "Thanks for confirming your email address.",
              });
            }, 500);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      if (session?.user) {
        const { id, email } = session.user;
        const name = session.user.user_metadata?.name || email?.split('@')[0] || '';
        setUser({ id, email, name });
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function - Modified to NOT automatically log in after signup
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        // Supabase returns different error messages for different providers
        // We want to standardize the "email already in use" error
        if (error.message.includes('already registered')) {
          throw new Error('Email address already in use');
        }
        throw error;
      }
      
      // Set a flag in localStorage to indicate that we're waiting for email confirmation
      window.localStorage.setItem('pendingEmailConfirmation', 'true');
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear any local state first to prevent UI flicker
      setUser(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    signup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
