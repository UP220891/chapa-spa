// servicios/authService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  fechaNacimiento: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  usuario: {
    id_cliente?: number;
    id_empleado?: number;
    nombre_cliente?: string;
    nombre_empleado?: string;
    email?: string;
    tipo_usuario: string;
    id_especialidad?: number;
    id_horarios?: number[];
    telefono?: string;
    fecha_nacimiento?: string;
    especialidad?: string;
    horarios?: any[];
    [key: string]: any; // Para permitir propiedades adicionales
  };
}

// Función para guardar el token en localStorage
export function saveToken(token: string): void {
  localStorage.setItem('token', token);
}

// Función para obtener el token de localStorage
export function getToken(): string | null {
  return localStorage.getItem('token');
}

// Función para eliminar el token de localStorage
export function removeToken(): void {
  localStorage.removeItem('token');
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Verificar si el token no ha expirado (opcional)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Función para obtener información del usuario del token
export function getUserFromToken(): any {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Convertir la estructura del backend a la estructura esperada por el frontend
    return {
      id: payload.id_cliente || payload.id_empleado || payload.id || 0,
      nombre: payload.nombre_cliente || payload.nombre_empleado || payload.nombre || '',
      email: payload.email || '',
      tipo: payload.tipo_usuario || 'cliente',
      // Incluir todos los campos adicionales del token
      ...payload
    };
  } catch {
    return null;
  }
}

export async function registerCliente(data: RegisterData): Promise<AuthResponse> {
  try {
    const res = await axios.post(`${API_URL}/api/auth/register`, data);
    
    if (res.data.token) {
      saveToken(res.data.token);
    }
    
    return res.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error en el registro');
  }
}

export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, data);
    
    if (res.data.token) {
      saveToken(res.data.token);
    }
    
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Credenciales inválidas');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Error en el login');
  }
}

export async function logout(): Promise<void> {
  removeToken();
  // Si tienes un endpoint de logout en el backend, también puedes llamarlo aquí
}

// Interceptor para añadir automáticamente el token a las peticiones
export function setupAxiosInterceptors() {
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        removeToken();
        // Redirigir al login o mostrar mensaje
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}
