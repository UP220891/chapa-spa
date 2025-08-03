"use client";
// Horarios del SPA
  const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const horariosSpa = {
    Lunes: { inicio: '09:00', fin: '18:00' },
    Martes: { inicio: '09:00', fin: '18:00' },
    Miércoles: { inicio: '09:00', fin: '18:00' },
    Jueves: { inicio: '09:00', fin: '18:00' },
    Viernes: { inicio: '09:00', fin: '18:00' },
    Sábado: { inicio: '10:00', fin: '14:00' },
    Domingo: null
  };
  const generarHoras = (inicio: string, fin: string) => {
    const horas: string[] = [];
    let h = parseInt(inicio.slice(0,2));
    let m = parseInt(inicio.slice(3,5));
    const hFin = parseInt(fin.slice(0,2));
    while (h <= hFin) {
      const horaStr = `${h.toString().padStart(2,'0')}:00`;
      horas.push(horaStr);
      h++;
    }
    return horas;
  };
  const getHorasDisponibles = (fecha: string) => {
    if (!fecha) return [];
    const [year, month, day] = fecha.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const diaActual = diasSemana[date.getDay()];
    const horario = horariosSpa[diaActual as keyof typeof horariosSpa];
    if (!horario) return [];
    return generarHoras(horario.inicio, horario.fin);
  };
import React from "react";
import { obtenerHorarios } from "@/servicios/horariosService";
import { useRouter } from "next/navigation";
import { Box, Card, CardContent, Typography, Divider } from "@mui/material";
import Navbar from "@/app/components/Navbar";
import { cancelarCitaCompleta, editarCita } from "@/servicios/citasService";

const HistorialCitas = () => {
  const [horarios, setHorarios] = React.useState<any[]>([]);
  // ...existing code...
  const router = useRouter();
  const [citas, setCitas] = React.useState<any[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [usuario, setUsuario] = React.useState<any | null>(null);
  // Estado para edición
  const [editandoId, setEditandoId] = React.useState<number | null>(null);
  // El tipo ahora acepta todos los campos requeridos por el backend
  const [editForm, setEditForm] = React.useState<{
    fecha?: string;
    hora?: string;
    notas?: string;
    id_cliente?: number;
    id_empleado?: number;
    id_servicio?: number;
    id_estado_cita?: number;
  }>({});

  // Cancelar cita
  const handleCancelar = async (id_cita: number) => {
    try {
      const citaActual = citas.find(c => c.id_cita === id_cita);
      if (!citaActual) throw new Error("Cita no encontrada");
      await cancelarCitaCompleta(citaActual);
      setCitas(prev => prev.map(c => c.id_cita === id_cita ? { ...c, estado_nombre: "Cancelada", id_estado_cita: 3 } : c));
    } catch (err: any) {
      setError(err.message || "Error al cancelar cita");
    }
  };

  // Editar cita
  const handleEditar = (cita: any) => {
    setEditandoId(cita.id_cita);
    setEditForm({
      fecha: cita.fecha_cita?.split("T")[0] || "",
      hora: cita.fecha_cita?.split("T")[1]?.slice(0,5) || "",
      notas: cita.notas || ""
    });
  };

  const handleGuardarEdicion = async (id_cita: number) => {
    try {
      // Buscar la cita actual
      const citaActual = citas.find(c => c.id_cita === id_cita);
      if (!citaActual) throw new Error("Cita no encontrada");
      // Usar los valores editados o los originales si no se editaron
      let nuevaHora = editForm.hora || citaActual.fecha_cita?.split("T")[1]?.slice(0,5);
      let nuevoIdHorario = citaActual.id_horario;
      // Si la hora es inválida, intentar extraerla de las notas
      if (!nuevaHora || nuevaHora === 'null' || nuevaHora === '' || nuevaHora === '00:00') {
        if (citaActual.notas) {
          const match = citaActual.notas.match(/(\d{1,2}:\d{2})/);
          if (match && match[1]) {
            nuevaHora = match[1];
          }
        }
      }
      // Si la cita usa horarios del backend y hay horarios cargados, buscar el id_horario correspondiente a la hora seleccionada
      if ((!nuevaHora || nuevaHora === 'null' || nuevaHora === '' || nuevaHora === '00:00') && horarios.length > 0 && nuevoIdHorario) {
        // Si no hay hora, reconstruir desde el horario
        const horario = horarios.find((h: any) => h.id_horario === nuevoIdHorario);
        if (horario && horario.hora_inicio) {
          const match = horario.hora_inicio.match(/T(\d{2}:\d{2})/);
          nuevaHora = match ? match[1] : horario.hora_inicio.slice(0,5);
        }
      }
      if (!nuevaHora || nuevaHora === 'null' || nuevaHora === '' || nuevaHora === '00:00') {
        alert('Selecciona una hora válida.');
        return;
      }
      if (horarios.length > 0 && nuevaHora) {
        const horarioEncontrado = horarios.find((h: any) => {
          const match = h.hora_inicio.match(/T(\d{2}:\d{2})/);
          const horaStr = match ? match[1] : h.hora_inicio.slice(0,5);
          return horaStr === nuevaHora;
        });
        if (horarioEncontrado) {
          nuevoIdHorario = horarioEncontrado.id_horario;
        }
      }
      const payload = {
        id_cliente: citaActual.id_cliente,
        id_empleado: citaActual.id_empleado,
        id_servicio: citaActual.id_servicio,
        fecha: editForm.fecha || citaActual.fecha_cita?.split("T")[0],
        hora: nuevaHora,
        notas: editForm.notas ?? citaActual.notas,
        id_estado_cita: citaActual.id_estado_cita,
        costo_total: citaActual.costo_total,
        id_horario: nuevoIdHorario
      };
      await editarCita(id_cita, payload);
      setCitas(prev => prev.map(c => {
        if (c.id_cita === id_cita) {
          let nuevaFechaCita = payload.fecha;
          if (payload.hora) {
            nuevaFechaCita += `T${payload.hora}:00`;
          }
          return {
            ...c,
            fecha_cita: nuevaFechaCita,
            hora: payload.hora,
            notas: payload.notas,
            id_horario: nuevoIdHorario
          };
        }
        return c;
      }));
      setEditandoId(null);
    } catch (err: any) {
      setError(err.message || "Error al editar cita");
    }
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setEditForm({});
  };

  React.useEffect(() => {
    const usuarioLocal = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");
    if (usuarioLocal && token) {
      const user = JSON.parse(usuarioLocal);
      setUsuario(user);
      // Log para depuración
      console.log("id_cliente:", user.id_cliente);
      console.log("token:", token);
      fetchCitas(user.id_cliente, token);
      // Traer horarios del backend
      obtenerHorarios().then(setHorarios).catch(() => setHorarios([]));
    } else {
      setCargando(false);
      setError("No has iniciado sesión");
    }
  }, []);
  // Función robusta para mostrar la hora real de la cita usando horarios del backend
  function getHoraCita(cita: any) {
    // Log de depuración para ver los datos de la cita
    console.log('Cita:', cita);
    // 1. Prioridad: mostrar la hora que el usuario seleccionó al reservar y nunca mostrar '00:00'
    if (cita.hora && cita.hora !== '00:00' && cita.hora !== '00:00:00') {
      if (/^\d{2}:\d{2}:\d{2}$/.test(cita.hora)) return cita.hora.slice(0,5);
      if (/^\d{2}:\d{2}$/.test(cita.hora)) return cita.hora;
    }
    // 2. Si el backend regresa la hora en el campo fecha_cita tipo 'YYYY-MM-DDTHH:mm:00'
    if (cita.fecha_cita && cita.fecha_cita.includes('T')) {
      const partes = cita.fecha_cita.split('T');
      if (partes[1]) {
        const hora = partes[1].slice(0,5);
        if (hora !== '00:00') return hora;
      }
    }
    // 3. Si hay id_horario y horarios cargados, buscar la hora exacta
    if (cita.id_horario && horarios.length > 0) {
      const horario = horarios.find((h: any) => h.id_horario === cita.id_horario);
      if (horario && horario.hora_inicio) {
        const match = horario.hora_inicio.match(/T(\d{2}:\d{2})/);
        if (match && match[1] !== '00:00') return match[1];
        if (/^\d{2}:\d{2}:\d{2}$/.test(horario.hora_inicio)) {
          const hora = horario.hora_inicio.slice(0,5);
          if (hora !== '00:00') return hora;
        }
        if (/^\d{2}:\d{2}$/.test(horario.hora_inicio) && horario.hora_inicio !== '00:00') {
          return horario.hora_inicio;
        }
      }
    }
    // 4. Si la fecha viene como 'YYYY-MM-DD HH:mm:ss'
    if (cita.fecha_cita && cita.fecha_cita.includes(' ')) {
      const partes = cita.fecha_cita.split(' ');
      if (partes[1]) {
        const hora = partes[1].slice(0,5);
        if (hora !== '00:00') return hora;
      }
    }
    // 5. Si la fecha tiene suficiente longitud, extraer la hora
    if (cita.fecha_cita && cita.fecha_cita.length >= 16) {
      const hora = cita.fecha_cita.slice(11,16);
      if (hora !== '00:00') return hora;
    }
    // 6. Si no hay hora válida, intentar extraer de las notas
    if (cita.notas) {
      // Buscar patrón HH:mm en las notas
      const match = cita.notas.match(/(\d{1,2}:\d{2})/);
      if (match && match[1]) {
        return match[1];
      }
    }
    // Si no hay hora válida, mostrar 'No asignada'
    return 'No asignada';
  }

  const fetchCitas = async (id_cliente: number, token: string) => {
    try {
      console.log("Petición a:", `${process.env.NEXT_PUBLIC_API_URL}/api/citas/cliente/${id_cliente}`);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/citas/cliente/${id_cliente}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      if (res.ok) {
        setCitas(data);
      } else {
        setError((data && data.mensaje) ? data.mensaje : `Error al cargar citas: ${text}`);
        console.error("Respuesta error:", text);
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error de conexión:", err);
    }
    setCargando(false);
  };

  return (
    <>
      <Navbar usuario={usuario} />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f7fafd", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card sx={{ minWidth: 600, maxWidth: 900, width: "100%", mx: 2, boxShadow: "0 8px 32px rgba(31,38,135,0.13)", borderRadius: 24, p: 7, background: "#fff", border: "none" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography sx={{ color: "#204d47", fontWeight: 900, fontSize: "2.2rem", letterSpacing: "0.04em", fontFamily: "Montserrat, sans-serif", textAlign: "center" }}>
              Historial de citas
            </Typography>
            <button
              style={{
                background: "#357a6c",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontFamily: "Montserrat, sans-serif",
                fontSize: "1rem",
                padding: "0.6rem 1.5rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px 0 rgba(31,38,135,0.08)",
                marginLeft: "1rem"
              }}
              onClick={() => router.push("/perfil")}
            >
              Regresar
            </button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <CardContent>
            {cargando ? (
              <Typography sx={{ color: "#204d47", fontWeight: 600, fontSize: "1.2rem", textAlign: "center" }}>Cargando...</Typography>
            ) : error ? (
              <Typography sx={{ color: "red", fontWeight: 600, fontSize: "1.1rem", textAlign: "center" }}>{error}</Typography>
            ) : citas.length === 0 ? (
              <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.1rem", textAlign: "center" }}>No tienes citas registradas.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {citas.map((cita, idx) => (
                  <Card
                    key={cita.id_cita || idx}
                    sx={{
                      boxShadow: "0 2px 8px rgba(31,38,135,0.08)",
                      borderRadius: 12,
                      p: 3,
                      background: cita.id_estado_cita === 3 ? "#e0e0e0" : "#e0f1ee"
                    }}
                  >
                    {editandoId === cita.id_cita ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.15rem", mb: 1 }}>
                          Editar cita
                        </Typography>
                        <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.08rem", mb: 1 }}>
                          Servicio: {cita.servicio_nombre ? cita.servicio_nombre : (cita.servicio ? cita.servicio : (cita.nombre_servicio ? cita.nombre_servicio : `ID ${cita.id_servicio}`))}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <input
                            type="date"
                            value={editForm.fecha}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setEditForm((f: typeof editForm) => ({ ...f, fecha: e.target.value, hora: '' }))}
                            style={{ padding: "8px", borderRadius: 6, border: "1px solid #357a6c" }}
                          />
                          <select
                            value={editForm.hora}
                            onChange={e => setEditForm((f: typeof editForm) => ({ ...f, hora: e.target.value }))}
                            style={{ padding: "8px", borderRadius: 6, border: "1px solid #357a6c" }}
                            disabled={!editForm.fecha}
                          >
                            <option value="">Selecciona hora</option>
                            {(() => {
                              if (!editForm.fecha) return null;
                              // Obtener el día de la semana en texto
                              const [year, month, day] = editForm.fecha.split('-').map(Number);
                              const date = new Date(year, month - 1, day);
                              const diaSemana = diasSemana[date.getDay()];
                              // Usar horariosSpa si no hay horarios del backend
                              let horasUnicas: string[] = [];
                              if (horarios.length === 0) {
                                const horario = horariosSpa[diaSemana as keyof typeof horariosSpa];
                                if (horario) {
                                  // Generar horas incluyendo la final
                                  let h = parseInt(horario.inicio.slice(0,2));
                                  const hFin = parseInt(horario.fin.slice(0,2));
                                  while (h <= hFin) {
                                    horasUnicas.push(`${h.toString().padStart(2,'0')}:00`);
                                    h++;
                                  }
                                }
                              } else {
                                // Filtrar horarios solo por el campo 'dia' del backend
                                const horariosFiltrados = horarios.filter((h: any) => h.dia === diaSemana);
                                horasUnicas = Array.from(new Set(
                                  horariosFiltrados
                                    .map((h: any) => {
                                      const match = h.hora_inicio.match(/T(\d{2}:\d{2})/);
                                      const horaStr = match ? match[1] : h.hora_inicio.slice(0,5);
                                      return horaStr !== "00:00" ? horaStr : null;
                                    })
                                    .filter(Boolean)
                                ));
                                // Si la hora final no está incluida y el día es válido, agregarla
                                const horario = horariosSpa[diaSemana as keyof typeof horariosSpa];
                                if (horario) {
                                  const horaFin = horario.fin;
                                  if (!horasUnicas.includes(horaFin)) {
                                    horasUnicas.push(horaFin);
                                  }
                                }
                              }
                              return horasUnicas.map(horaStr => (
                                <option key={horaStr} value={horaStr}>{horaStr}</option>
                              ));
                            })()}
                          </select>
                          {/* DEBUG: mostrar las horas únicas generadas */}
                          <div style={{ fontSize: '0.9em', color: '#357a6c', marginLeft: '12px' }}>
                            {editForm.fecha && (
                              <>
                                <span>Horas generadas: </span>
                                {(() => {
                                  // Verificar si algún horario tiene campo de día
                                  const tieneDia = horarios.some((h: any) => h.dia || h.dia_semana);
                                  let horariosFiltrados = horarios;
                                  if (tieneDia) {
                                    const [year, month, day] = editForm.fecha.split('-').map(Number);
                                    const date = new Date(year, month - 1, day);
                                    const diaSemana = diasSemana[date.getDay()];
                                    horariosFiltrados = horarios.filter((h: any) => (h.dia || h.dia_semana) === diaSemana);
                                  }
                                  const horasUnicas = Array.from(new Set(
                                    horariosFiltrados
                                      .map((h: any) => {
                                        const match = h.hora_inicio.match(/T(\d{2}:\d{2})/);
                                        const horaStr = match ? match[1] : h.hora_inicio.slice(0,5);
                                        return horaStr !== "00:00" ? horaStr : null;
                                      })
                                      .filter(Boolean)
                                  ));
                                  return horasUnicas.length > 0
                                    ? horasUnicas.join(', ')
                                    : 'Ninguna';
                                })()}
                              </>
                            )}
                          </div>
                        </Box>
                        <textarea
                          value={editForm.notas}
                          onChange={e => setEditForm((f: typeof editForm) => ({ ...f, notas: e.target.value }))}
                          rows={2}
                          placeholder="Notas"
                          style={{ padding: "8px", borderRadius: 6, border: "1px solid #357a6c", marginTop: "8px" }}
                        />
                        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                          <button style={{ background: "#357a6c", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, fontFamily: "Montserrat, sans-serif", fontSize: "1rem", padding: "0.5rem 1.2rem", cursor: "pointer" }} onClick={() => handleGuardarEdicion(cita.id_cita)}>Guardar</button>
                          <button style={{ background: "#e0f1ee", color: "#357a6c", border: "1px solid #357a6c", borderRadius: "8px", fontWeight: 700, fontFamily: "Montserrat, sans-serif", fontSize: "1rem", padding: "0.5rem 1.2rem", cursor: "pointer" }} onClick={handleCancelarEdicion}>Cancelar</button>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.15rem", mb: 1 }}>
                          Servicio: {cita.servicio_nombre ? cita.servicio_nombre : (cita.servicio ? cita.servicio : (cita.nombre_servicio ? cita.nombre_servicio : `ID ${cita.id_servicio}`))}
                        </Typography>
                        <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.08rem", mb: 1 }}>
                          Fecha: {(() => {
                            // Mostrar la fecha que el usuario seleccionó
                            if (cita.fecha_cita) {
                              if (cita.fecha_cita.includes('T')) {
                                return cita.fecha_cita.split('T')[0];
                              }
                              if (cita.fecha_cita.includes(' ')) {
                                return cita.fecha_cita.split(' ')[0];
                              }
                              // Si la fecha viene como 'YYYY-MM-DD', mostrar tal cual
                              if (cita.fecha_cita.length >= 10) return cita.fecha_cita.slice(0,10);
                            }
                            return '';
                          })()} {getHoraCita(cita)}
                        </Typography>
                        <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.08rem", mb: 1 }}>
                          Estado: {cita.estado_nombre || cita.id_estado_cita}
                        </Typography>
                        {cita.notas && (
                          <Typography sx={{ color: "#204d47", fontWeight: 400, fontSize: "1rem", mt: 1 }}>
                            Notas: {cita.notas}
                          </Typography>
                        )}
                        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                          {cita.id_estado_cita !== 3 && (
                            <button style={{ background: "#dc3545", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, fontFamily: "Montserrat, sans-serif", fontSize: "1rem", padding: "0.5rem 1.2rem", cursor: "pointer" }} onClick={() => handleCancelar(cita.id_cita)}>Cancelar cita</button>
                          )}
                          {cita.id_estado_cita !== 3 && (
                            <button style={{ background: "#357a6c", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, fontFamily: "Montserrat, sans-serif", fontSize: "1rem", padding: "0.5rem 1.2rem", cursor: "pointer" }} onClick={() => handleEditar(cita)}>Editar cita</button>
                          )}
                        </Box>
                      </>
                    )}
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default HistorialCitas;
