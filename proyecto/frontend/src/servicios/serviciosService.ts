import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: number;
  imagen: string;
}

export async function getServicios(): Promise<Servicio[]> {
  try {
    const res = await axios.get(`${API_URL}/api/servicios`);
    return res.data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.mensaje || err?.message || "Error al obtener servicios");
  }
}

export interface ServicioNuevo {
  nombre: string;
  descripcion: string;
  duracion: string;
  precio: number;
  imagen: string;
}

export async function crearServicio(servicio: ServicioNuevo, token?: string): Promise<Servicio> {
  try {
    // Mapear los datos al formato esperado por el backend
    const payload = {
      nombre_servicio: servicio.nombre,
      descripcion: servicio.descripcion,
      duracion: Number(servicio.duracion),
      precio: servicio.precio,
      imagen: servicio.imagen // base64
    };
    const res = await axios.post(`${API_URL}/api/servicios`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.mensaje || err?.message || "Error al crear servicio");
  }
}
