// apps/web/src/services/authService.ts

// Base API URL - in a real app, this would be from environment variables
const API_BASE_URL = 'http://localhost:3001';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  departmentId?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// Local storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store authentication data
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store authentication data
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Logout - clear authentication data
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get the stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get the currently authenticated user
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getUser();
    return !!user && user.role === role;
  },

  /**
   * Validate the stored token
   */
  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout(); // Clear invalid authentication data
        return false;
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): { Authorization: string } | undefined {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
};