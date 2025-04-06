// apps/web/src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on initial mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = authService.getUser();
      
      if (storedUser && authService.getToken()) {
        try {
          // Verify token is still valid
          const isValid = await authService.validateToken();
          
          if (isValid) {
            setUser(storedUser);
          } else {
            // If token is invalid, clear the stored data
            authService.logout();
          }
        } catch (error) {
          console.error('Token validation error:', error);
          authService.logout();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ username, password });
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: string) => {
    return !!user && user.role === role;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};