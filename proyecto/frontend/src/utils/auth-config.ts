// utils/auth-config.ts
import { setupAxiosInterceptors } from '../servicios/authService';

// Configurar interceptors de axios al cargar la aplicación
export function initializeAuth() {
  setupAxiosInterceptors();
}

// Función para verificar si el usuario tiene permisos específicos
export function hasPermission(userType: string, requiredPermission: string): boolean {
  const permissions = {
    admin: ['read', 'write', 'delete', 'manage_users'],
    empleado: ['read', 'write'],
    cliente: ['read']
  };

  const userPermissions = permissions[userType as keyof typeof permissions] || [];
  return userPermissions.includes(requiredPermission);
}

// Función para redireccionar según el tipo de usuario
export function getRedirectPath(userType: string): string {
  switch (userType) {
    case 'admin':
      return '/admin/dashboard';
    case 'empleado':
      return '/empleado/dashboard';
    case 'cliente':
      return '/cliente/dashboard';
    default:
      return '/login';
  }
}
