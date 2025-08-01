const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function obtenerHorarios() {
  const res = await fetch(`${API_URL}/api/horarios`);
  if (!res.ok) throw new Error('Error al obtener horarios');
  return res.json();
}
