const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function obtenerEspecialidades() {
  const res = await fetch(`${API_URL}/api/especialidad`);
  if (!res.ok) throw new Error('Error al obtener especialidades');
  return res.json();
}
