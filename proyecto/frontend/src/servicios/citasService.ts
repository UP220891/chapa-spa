export async function cancelarCitaCompleta(cita: any): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Enviar todos los datos, solo cambiando el estado
  const payload = {
    id_cliente: cita.id_cliente,
    id_servicio: cita.id_servicio,
    id_empleado: cita.id_empleado,
    fecha: cita.fecha_cita?.split("T")[0],
    hora: cita.fecha_cita?.split("T")[1]?.slice(0,5),
    notas: cita.notas,
    id_estado_cita: 3, // Cancelada
    id_horario: cita.id_horario,
    costo_total: cita.costo_total
  };
  const res = await fetch(`${API_URL}/api/citas/${cita.id_cita}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Error al cancelar cita");
  return await res.json();
}
// Servicio para conectar el frontend con el backend para citas
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Servicio = "" | "masaje" | "facial" | "manicure";
export interface CitaForm {
  nombre: string;
  email: string;
  numero: string;
  fecha: string;
  id_horario: string;
  hora: string;
  servicio: Servicio;
  notas: string;
}

export interface CitaPayload {
  id_cliente: number;
  id_servicio: number;
  id_empleado: number;
  fecha: string;
  hora: string;
  notas: string;
  costo_total: number;
  id_estado_cita: number;
  id_horario: number | null;
}

// Obtener todas las citas del backend
export async function getCitas(): Promise<any[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  try {
    const res = await axios.get(`${API_URL}/api/citas`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return res.data;
  } catch (err: any) {
    const mensaje = err?.response?.data?.mensaje || err?.response?.data?.error || err?.message || "Error al obtener citas";
    throw new Error(mensaje);
  }
}

export async function crearCita(data: CitaPayload): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/citas`, {
    method: "POST",
    headers,
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al crear cita");
  return await res.json();
}

export async function cancelarCita(id_cita: number): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Solo cambiamos el estado a cancelado (id_estado_cita = 3)
  const res = await fetch(`${API_URL}/api/citas/${id_cita}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ id_estado_cita: 3 })
  });
  if (!res.ok) throw new Error("Error al cancelar cita");
  return await res.json();
}

export async function editarCita(
  id_cita: number,
  data: {
    fecha?: string;
    fecha_cita?: string;
    hora?: string;
    notas?: string;
    id_cliente?: number;
    id_empleado?: number;
    id_servicio?: number;
    id_estado_cita?: number;
  }
): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/citas/${id_cita}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    console.error('Error en editarCita:', res.status, errorData);
    throw new Error(`Error al editar cita: ${res.status} - ${errorData}`);
  }
  
  return await res.json();
}
