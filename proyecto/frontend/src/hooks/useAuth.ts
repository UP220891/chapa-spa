// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { getUserFromToken, isAuthenticated, logout as logoutService } from '../servicios/authService';

export interface User {
  id: number;
  nombre: string;
  email: string;
  tipo: string;
}

export function useAuth() {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    setLoading(true);
    try {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      
      if (authenticated) {
        const userData = getUserFromToken();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuth(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setIsAuth(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutService();
      setIsAuth(false);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    isAuthenticated: isAuth,
    user,
    loading,
    login,
    logout,
    checkAuth
  };
}
