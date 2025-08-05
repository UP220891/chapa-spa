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
    empleado: ['read', 'write', 'delete', 'manage_users'], // Mismos permisos que admin
    cliente: ['read']
  };

  const userPermissions = permissions[userType as keyof typeof permissions] || [];
  return userPermissions.includes(requiredPermission);
}

// Función para redireccionar según el tipo de usuario
export function getRedirectPath(userType: string): string {
  switch (userType) {
    case 'admin':
    case 'empleado':
      return '/Administrador';  // Página del calendario de administración
    case 'cliente':
      return '/';  // Página principal donde pueden ver servicios y hacer citas
    default:
      return '/login';
  }
}
