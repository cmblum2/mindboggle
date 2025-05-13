
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication service - would be replaced with real auth in production
const mockLogin = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simple validation - in real app would check against a backend
      if (email && password.length >= 6) {
        const user: User = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0],
          email
        };
        localStorage.setItem('mindboggle_user', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

const mockSignup = (name: string, email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simple validation - in real app would check against a backend
      if (name && email && password.length >= 6) {
        const user: User = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          name,
          email
        };
        localStorage.setItem('mindboggle_user', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('Invalid information'));
      }
    }, 1000);
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check local storage for user on mount
    const storedUser = localStorage.getItem('mindboggle_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('mindboggle_user');
      }
    }
    setIsLoading(false);
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await mockLogin(email, password);
      setUser(user);
      toast.success('Welcome back!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await mockSignup(name, email, password);
      setUser(user);
      toast.success('Account created!');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('mindboggle_user');
    setUser(null);
    toast.success('Logged out successfully');
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
