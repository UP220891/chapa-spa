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

export async function registerCliente(data: RegisterData) {
  const res = await axios.post(`${API_URL}/api/auth/register`, data);
  return res.data;
}

export async function login(data: LoginData) {
  const res = await axios.post(`${API_URL}/api/auth/login`, data);
  return res.data;
}

// Para empleados/admin, puedes crear funciones similares si lo necesitas
