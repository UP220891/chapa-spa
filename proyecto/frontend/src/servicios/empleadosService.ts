import axios from 'axios';

// Configuración de la URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Función para obtener el token desde localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Tipos de datos para empleados
export interface EmpleadoData {
  nombre_empleado: string;
  email: string;
  password: string;
  telefono: string;  // Obligatorio
  id_especialidad: number;
  rol?: 'empleado' | 'admin';
  fecha_registro?: string;
}

export interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  email: string;
  telefono?: string;
  id_especialidad: number;
  rol: string;
  fecha_registro: string;
  horarios?: any[];
}

// Función para obtener todos los empleados
export const getEmpleados = async (): Promise<Empleado[]> => {
  try {
    console.log('🔍 Obteniendo empleados...');
    
    // Obtener token del localStorage
    const token = getToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Inicia sesión primero.');
    }
    
    const res = await axios.get(`${API_URL}/api/empleados`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
    });
    
    console.log('✅ Empleados obtenidos:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error al obtener empleados:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Token de autenticación inválido. Inicia sesión nuevamente.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para ver empleados.');
    }
    
    if (error.response) {
      throw new Error(`Error del servidor: ${error.response.status}`);
    }
    
    throw new Error(`Error de conexión: ${error.message}`);
  }
};

// Función para obtener un empleado por ID
export const getEmpleadoById = async (id: number): Promise<Empleado> => {
  try {
    console.log(`🔍 Obteniendo empleado con ID: ${id}`);
    
    // Obtener token del localStorage
    const token = getToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Inicia sesión primero.');
    }
    
    const res = await axios.get(`${API_URL}/api/empleados/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
    });
    
    console.log('✅ Empleado obtenido:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error al obtener empleado:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Token de autenticación inválido. Inicia sesión nuevamente.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Empleado no encontrado.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para ver este empleado.');
    }
    
    if (error.response) {
      throw new Error(`Error del servidor: ${error.response.status}`);
    }
    
    throw new Error(`Error de conexión: ${error.message}`);
  }
};

// Función para crear un nuevo empleado
export const crearEmpleado = async (data: EmpleadoData) => {
  try {
    console.log('📝 Creando empleado:', data);
    
    // Obtener token del localStorage
    const token = getToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Inicia sesión primero.');
    }
    
    console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
    console.log('📦 Datos a enviar al backend:', JSON.stringify(data, null, 2));
    
    const res = await axios.post(`${API_URL}/api/empleados`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
    });
    
    console.log('✅ Empleado creado:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error al crear empleado:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    
    if (error.response?.status === 401) {
      throw new Error('Token de autenticación inválido. Inicia sesión nuevamente.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para crear empleados.');
    }
    
    if (error.response?.status === 400) {
      const errorDetails = error.response.data?.errores || error.response.data?.error || error.response.data?.detalle || 'Datos inválidos';
      console.error('❌ Detalles del error 400:', errorDetails);
      
      if (Array.isArray(errorDetails)) {
        const messages = errorDetails.map(err => err.msg || err.message || err).join(', ');
        throw new Error(`Errores de validación: ${messages}`);
      }
      
      throw new Error(errorDetails);
    }
    
    if (error.response) {
      throw new Error(`Error del servidor: ${error.response.status}`);
    }
    
    throw new Error(`Error de conexión: ${error.message}`);
  }
};

// Función para actualizar un empleado
export const actualizarEmpleado = async (id: number, data: Partial<EmpleadoData>) => {
  try {
    console.log(`📝 Actualizando empleado ${id}:`, data);
    
    // Obtener token del localStorage
    const token = getToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Inicia sesión primero.');
    }
    
    const res = await axios.put(`${API_URL}/api/empleados/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
    });
    
    console.log('✅ Empleado actualizado:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error al actualizar empleado:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Token de autenticación inválido. Inicia sesión nuevamente.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para actualizar empleados.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Empleado no encontrado.');
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
};

// Función para eliminar un empleado
export const eliminarEmpleado = async (id: number) => {
  try {
    console.log(`🗑️ Eliminando empleado con ID: ${id}`);
    
    // Obtener token del localStorage
    const token = getToken();
    if (!token) {
      throw new Error('No hay token de autenticación. Inicia sesión primero.');
    }
    
    const res = await axios.delete(`${API_URL}/api/empleados/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
    });
    
    console.log('✅ Empleado eliminado:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error al eliminar empleado:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Token de autenticación inválido. Inicia sesión nuevamente.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para eliminar empleados.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Empleado no encontrado.');
    }
    
    if (error.response) {
      throw new Error(`Error del servidor: ${error.response.status}`);
    }
    
    throw new Error(`Error de conexión: ${error.message}`);
  }
};
