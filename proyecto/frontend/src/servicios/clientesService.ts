// servicios/clientesService.ts
import axios from 'axios';
import { getToken, isAuthenticated } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Cliente {
  id_cliente: number;
  nombre_cliente: string;
  apellido_cliente: string;
  telefono: string;
  correo_electronico: string;
  fecha_registro: string;
  fecha_nacimiento?: string;
  password?: string;
}

export async function getClientes(): Promise<Cliente[]> {
  try {
    console.log('🔍 Obteniendo clientes de:', `${API_URL}/api/clientes`);
    
    // Verificar si el usuario está autenticado
    if (!isAuthenticated()) {
      throw new Error('No estás autenticado. Inicia sesión primero.');
    }
    
    // Obtener token del localStorage
    const token = getToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Inicia sesión primero.');
    }
    
    const res = await axios.get(`${API_URL}/api/clientes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
    });
    
    console.log('✅ Clientes obtenidos:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error al obtener clientes:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Token de autenticación inválido. Inicia sesión nuevamente.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para acceder a esta información.');
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('No se puede conectar con el servidor. Asegúrate de que el backend esté ejecutándose.');
    }
    
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
      throw new Error(`Error del servidor: ${error.response.status}`);
    }
    
    if (error.request) {
      throw new Error('Sin respuesta del servidor. Verifica tu conexión de red.');
    }
    
    throw new Error(`Error de conexión: ${error.message}`);
  }
}

export async function createCliente(data: Omit<Cliente, 'id_cliente' | 'fecha_registro'>): Promise<Cliente> {
  try {
    console.log('📝 Creando cliente:', data);
    
    // Verificar si el usuario está autenticado
    if (!isAuthenticated()) {
      throw new Error('No estás autenticado. Inicia sesión primero.');
    }
    
    // Obtener token del localStorage
    const token = getToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Inicia sesión primero.');
    }
    
    const res = await axios.post(`${API_URL}/api/clientes`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
    });
    
    console.log('✅ Cliente creado:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error al crear cliente:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Token de autenticación inválido. Inicia sesión nuevamente.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para crear clientes.');
    }
    
    if (error.response?.status === 400) {
      const errorMsg = error.response.data?.error || error.response.data?.detalle || 'Datos inválidos';
      throw new Error(errorMsg);
    }
    
    if (error.response) {
      throw new Error(`Error del servidor: ${error.response.status}`);
    }
    
    throw new Error(`Error de conexión: ${error.message}`);
  }
}
