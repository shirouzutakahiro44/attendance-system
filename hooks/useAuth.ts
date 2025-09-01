import { useState, useEffect, createContext, useContext } from 'react';
import { SafeUser } from '@/lib/auth';

interface AuthContextType {
  user: SafeUser | null;
  loading: boolean;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthLogic() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored auth data on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const demoMode = localStorage.getItem('demoMode');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('demoMode');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (employeeId: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('sessionToken', data.sessionToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      const sessionToken = localStorage.getItem('sessionToken');
      const demoMode = localStorage.getItem('demoMode');
      
      // Skip API call in demo mode
      if (token && !demoMode) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-session-token': sessionToken || '',
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      localStorage.removeItem('demoMode');
      setUser(null);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    error,
  };
}

export { AuthContext };