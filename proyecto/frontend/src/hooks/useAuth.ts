// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { getUserFromToken, isAuthenticated, logout as logoutService } from '../servicios/authService';

export interface User {
  id: number;
  nombre: string;
  email: string;
  tipo: string;
  // Campos adicionales opcionales
  nombre_cliente?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  correo_electronico?: string;
  nombre_empleado?: string;
  id_especialidad?: number;
  id_horarios?: number[];
  especialidad?: string;
  horarios?: any[];
  // Permitir campos adicionales
  [key: string]: any;
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
        // Primero intentar obtener del localStorage
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
          } catch {
            // Si falla, intentar obtener del token
            const userData = getUserFromToken();
            setUser(userData);
            // Guardar en localStorage para próxima vez
            if (userData) {
              localStorage.setItem('usuario', JSON.stringify(userData));
            }
          }
        } else {
          // Si no hay en localStorage, obtener del token
          const userData = getUserFromToken();
          setUser(userData);
          // Guardar en localStorage para próxima vez
          if (userData) {
            localStorage.setItem('usuario', JSON.stringify(userData));
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem('usuario');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuth(false);
      setUser(null);
      localStorage.removeItem('usuario');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setIsAuth(true);
    setUser(userData);
    // Guardar la información del usuario en localStorage para persistencia
    localStorage.setItem('usuario', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await logoutService();
      setIsAuth(false);
      setUser(null);
      // Limpiar también la información del usuario de localStorage
      localStorage.removeItem('usuario');
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
