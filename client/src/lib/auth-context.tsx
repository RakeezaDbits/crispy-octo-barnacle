import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from './queryClient';

interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  customer: Customer | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedCustomer = localStorage.getItem('customer_data');
    
    if (savedToken && savedCustomer) {
      try {
        setToken(savedToken);
        setCustomer(JSON.parse(savedCustomer));
      } catch (error) {
        console.error('Error parsing saved customer data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('customer_data');
      }
    }
    setIsLoading(false);
  }, []);

  // Verify token on app load
  useEffect(() => {
    if (token && !customer) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const customerData = await response.json();
        setCustomer(customerData);
        localStorage.setItem('customer_data', JSON.stringify(customerData));
      } else {
        // Token is invalid
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    setToken(data.token);
    setCustomer(data.customer);
    
    // Save to localStorage
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('customer_data', JSON.stringify(data.customer));
  };

  const register = async (userData: { email: string; password: string; fullName: string; phone?: string }) => {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    setToken(data.token);
    setCustomer(data.customer);
    
    // Save to localStorage
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('customer_data', JSON.stringify(data.customer));
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer_data');
    
    // Call logout API if token exists
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(console.error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}