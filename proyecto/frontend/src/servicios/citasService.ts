// Servicio para conectar el frontend con el backend para citas
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Servicio = "" | "masaje" | "facial" | "manicure";
export interface CitaForm {
  nombre: string;
  apellidos: string;
  email: string;
  numero: string;
  fecha: string;
  hora: string;
  servicio: Servicio;
  notas: string;
}

export async function crearCita(form: CitaForm): Promise<any> {
  // Obtener token y usuario
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const usuarioLocal = typeof window !== "undefined" ? localStorage.getItem("usuario") : null;
  const usuario = usuarioLocal ? JSON.parse(usuarioLocal) : {};

  // Mapear datos al formato que espera el backend
  const serviciosMap: Record<Servicio, number> = {
    "": 0,
    masaje: 1,
    facial: 2,
    manicure: 3
    // Agrega más servicios si tienes
  };
  const id_servicio = serviciosMap[form.servicio];
  const fecha_cita = form.fecha && form.hora ? `${form.fecha}T${form.hora}` : form.fecha;
  const datos = {
    id_cliente: usuario.id_cliente || null,
    id_servicio,
    id_empleado: null,
    fecha_cita,
    notas: form.notas,
    costo_total: null,
    id_estado_cita: null,
    id_horario: null
  };

  try {
    const res = await axios.post(`${API_URL}/api/citas`, datos, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return res.data;
  } catch (err: any) {
    const mensaje = err?.response?.data?.mensaje || err?.response?.data?.error || err?.message || "Error al crear cita";
    throw new Error(mensaje);
  }
}
