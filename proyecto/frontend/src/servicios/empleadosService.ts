const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Interfaces
export interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  id_especialidad: number;
  rol: string;
  especialidad?: {
    id_especialidad: number;
    nombre_especialidad: string;
  };
}

export interface NuevoEmpleado {
  nombre_empleado: string;
  email: string;
  telefono: string;
  id_especialidad: number;
  rol?: string;
  fecha_registro?: string;
}

// Obtener todos los empleados
export async function getEmpleados(): Promise<Empleado[]> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');

  const res = await fetch(`${API_URL}/api/empleados`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Error al obtener empleados');
  }

  return res.json();
}

// Obtener empleado por ID
export async function getEmpleadoById(id: number): Promise<Empleado> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');

  const res = await fetch(`${API_URL}/api/empleados/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Error al obtener empleado');
  }

  return res.json();
}

// Crear nuevo empleado
export async function crearEmpleado(empleado: NuevoEmpleado): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');

  const res = await fetch(`${API_URL}/api/empleados`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nombre_empleado: empleado.nombre_empleado,
      email: empleado.email,
      telefono: empleado.telefono,
      id_especialidad: empleado.id_especialidad,
      rol: empleado.rol || 'empleado',
      fecha_registro: empleado.fecha_registro || new Date().toISOString()
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al crear empleado');
  }
}

// Actualizar empleado
export async function actualizarEmpleado(id: number, empleado: Partial<NuevoEmpleado>): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');

  const res = await fetch(`${API_URL}/api/empleados/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(empleado),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al actualizar empleado');
  }
}

// Eliminar empleado
export async function eliminarEmpleado(id: number): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');

  const res = await fetch(`${API_URL}/api/empleados/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al eliminar empleado');
  }
}
