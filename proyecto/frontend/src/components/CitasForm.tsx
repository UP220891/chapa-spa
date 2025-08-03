"use client";
import "../styles/notification.css";

import React from "react";
import { useSearchParams } from "next/navigation";

import { crearCita, CitaForm, Servicio } from "@/servicios/citasService";

const CitasForm: React.FC = () => {
  const [servicios, setServicios] = React.useState<any[]>([]);
  const [nombreServicio, setNombreServicio] = React.useState<string>("");
  const [servicioInicial, setServicioInicial] = React.useState<string>("");
  // Solo una vez:
  // Solo una vez:
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  let servicioParam = searchParams?.get("servicio") || "";
  if (servicioParam === "undefined" || !["masaje", "facial", "manicure"].includes(servicioParam)) {
    servicioParam = "";
  }

  React.useEffect(() => {
    // Cargar servicios y buscar el nombre si hay servicioParam
    async function cargarServicios() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/servicios`);
        const data = await res.json();
        setServicios(data);
        if (servicioParam) {
          // Buscar por nombre (case-insensitive)
          const servicioEncontrado = data.find((s: any) =>
            (s.nombre_servicio || s.nombre || "").toLowerCase() === decodeURIComponent(servicioParam).toLowerCase()
          );
          if (servicioEncontrado) {
            setServicioInicial(servicioEncontrado.nombre_servicio || servicioEncontrado.nombre);
            setNombreServicio(servicioEncontrado.nombre_servicio || servicioEncontrado.nombre);
          } else {
            setServicioInicial("");
            setNombreServicio("");
          }
        }
      } catch {}
    }
    cargarServicios();
  }, [servicioParam]);
  // (Eliminado: segunda declaración de searchParams y servicioParam)
  const [usuario, setUsuario] = React.useState<any>(null);
  const [bloqueado, setBloqueado] = React.useState(true);
  // Convierte el id de servicio recibido en la URL a un valor válido del tipo Servicio
  // Normaliza el parámetro a minúsculas y lo valida
  // Ya no se usa la declaración previa, solo el estado servicioInicial
  const [form, setForm] = React.useState<CitaForm>({
    nombre: "",
    email: "",
    numero: "",
    fecha: "",
    id_horario: "",
    hora: "",
    servicio: "",
    notas: ""
  });

  // Autocompleta nombre, email, número y servicio si hay usuario y parámetro de servicio
  // Autocompletar el campo servicio si hay servicioInicial
  React.useEffect(() => {
    if (servicioInicial) {
      setForm(prev => ({
        ...prev,
        servicio: servicioInicial as any // acepta cualquier string
      }));
    }
  }, [servicioInicial]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const usuarioLocal = localStorage.getItem("usuario");
      if (usuarioLocal) {
        try {
          const user = JSON.parse(usuarioLocal);
          setUsuario(user);
          setBloqueado(false);
        } catch {
          setUsuario(null);
          setBloqueado(true);
        }
      } else {
        setUsuario(null);
        setBloqueado(true);
      }
    }
  }, []);

  // Obtener horarios reales desde el backend
  const [horarios, setHorarios] = React.useState<any[]>([]);
  React.useEffect(() => {
    async function cargarHorarios() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/horarios`);
        const data = await res.json();
        setHorarios(data);
        console.log('Horarios recibidos del backend:', data);
      } catch {}
    }
    cargarHorarios();
  }, []);

  // Filtrar horarios por día seleccionado
  const getHora = (str: string) => {
    // Si el string ya es tipo '09:00:00.000Z', extrae solo la hora
    if (typeof str === 'string' && str.includes('T')) {
      return str.slice(11, 16); // 'HH:MM'
    }
    // Si es tipo '09:00', regresa tal cual
    if (typeof str === 'string' && str.length === 5) {
      return str;
    }
    // Fallback: usar Date
    const date = new Date(str);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  // Generar las horas disponibles en intervalos de 1 hora
  const generarHoras = (inicio: string, fin: string) => {
    const horas: string[] = [];
    let h = parseInt(inicio.slice(0,2));
    let m = parseInt(inicio.slice(3,5));
    const hFin = parseInt(fin.slice(0,2));
    while (h < hFin) {
      const horaStr = `${h.toString().padStart(2,'0')}:00`;
      horas.push(horaStr);
      h++;
    }
    return horas;
  };

  // Filtrar horarios por día seleccionado y generar opciones de hora
  const getHorasDisponibles = () => {
    if (!form.fecha) return [];
    const [year, month, day] = form.fecha.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const diaActual = diasSemana[fecha.getDay()];
    const horarioDia = horarios.find(h => h.dia === diaActual);
    if (!horarioDia) return [];
    const inicio = getHora(horarioDia.hora_inicio);
    const fin = getHora(horarioDia.hora_fin);
    // Solo mostrar si es día válido
    if (["Lunes","Martes","Miércoles","Jueves","Viernes"].includes(diaActual)) {
      return generarHoras('09:00', '18:00');
    }
    if (diaActual === "Sábado") {
      return generarHoras('10:00', '14:00');
    }
    return [];
  };
  const autocompletarUsuario = () => {
    if (!usuario) {
      setNotification({ type: 'error', message: 'No se encontró información de usuario en el sistema.' });
      return;
    }
    let cambios: Partial<CitaForm> = {};
    if (usuario.nombre_cliente) cambios.nombre = usuario.nombre_cliente;
    if (usuario.correo_electronico) cambios.email = usuario.correo_electronico;
    if (usuario.telefono) cambios.numero = usuario.telefono;
    setForm(prev => ({
      ...prev,
      ...cambios,
      servicio: prev.servicio // nunca sobreescribas el servicio
    }));
  };
  const [notification, setNotification] = React.useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showNotification, setShowNotification] = React.useState(false);
  React.useEffect(() => {
    if (notification) {
      setShowNotification(true);
      if (notification.type === 'success') {
        const timer = setTimeout(() => {
          setShowNotification(false);
          setNotification(null);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [notification]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [mensaje, setMensaje] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Si el campo es hora, asigna el id_horario del horario del día seleccionado
    if (e.target.id === "hora") {
      let idHorario = "";
      if (form.fecha) {
        const [year, month, day] = form.fecha.split('-').map(Number);
        const fecha = new Date(year, month - 1, day);
        const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        const diaActual = diasSemana[fecha.getDay()];
        const horarioDia = horarios.find(h => h.dia === diaActual);
        if (horarioDia) {
          idHorario = String(horarioDia.id_horario);
        }
      }
      setForm({
        ...form,
        hora: e.target.value,
        id_horario: idHorario
      });
    } else if (e.target.id === "fecha") {
      // Si cambia la fecha y ya hay hora seleccionada, asigna el id_horario del horario del día
      let idHorario = form.id_horario;
      if (e.target.value && form.hora) {
        const [year, month, day] = e.target.value.split('-').map(Number);
        const fecha = new Date(year, month - 1, day);
        const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        const diaActual = diasSemana[fecha.getDay()];
        const horarioDia = horarios.find(h => h.dia === diaActual);
        if (horarioDia) {
          idHorario = String(horarioDia.id_horario);
        } else {
          idHorario = "";
        }
      }
      setForm({ ...form, fecha: e.target.value, id_horario: idHorario });
    } else {
      setForm({ ...form, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");
    try {
      // Buscar el id_servicio correspondiente al nombre seleccionado
      const servicioSeleccionado = servicios.find((s: any) => (s.nombre_servicio || s.nombre) === form.servicio);
      const id_servicio = Number(servicioSeleccionado?.id_servicio || servicioSeleccionado?.id);
      if (!id_servicio) throw new Error("No se encontró el servicio seleccionado");

      // Obtener id_cliente del usuario
      const id_cliente = usuario?.id_cliente;
      if (!id_cliente) throw new Error("No se encontró el id_cliente del usuario");

      // Asignar id_empleado por defecto (puedes cambiar la lógica si tienes selección de empleado)
      const id_empleado = 1; // Por defecto, o puedes obtenerlo de la base de datos o del usuario

      // Adaptar fecha y hora
      const fecha = form.fecha;
      const id_horario = form.id_horario ? Number(form.id_horario) : null;
      const hora = form.hora;

      // Opcionales
      const notas = form.notas || "";
      // Buscar el costo del servicio seleccionado
      let costo_total = 0;
      if (servicioSeleccionado && (servicioSeleccionado.precio || servicioSeleccionado.costo)) {
        costo_total = Number(servicioSeleccionado.precio || servicioSeleccionado.costo);
      }
      const id_estado_cita = 1; // Estado inicial, puedes cambiarlo

      // Crear el objeto que espera el backend
      const citaPayload = {
        id_cliente,
        id_servicio,
        id_empleado,
        fecha,
        hora,
        id_horario,
        notas,
        costo_total,
        id_estado_cita
      };

      await crearCita(citaPayload);
      setNotification({ type: 'success', message: '¡Cita reservada exitosamente!' });
      setForm({ nombre: "", email: "", numero: "", fecha: "", id_horario: "", hora: "", servicio: "", notas: "" });
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || "Error al reservar la cita" });
    }
    setLoading(false);
  };

  return (
    <div className="register-container" style={{ position: 'relative' }}>
      {/* Botón regresar a servicios arriba y centrado */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.2rem', marginTop:'0.5rem' }}>
        <button
          type="button"
          style={{
            background:'#204d47',
            color:'#fff',
            border:'none',
            borderRadius:'8px',
            padding:'0.5rem 1.3rem 0.5rem 1.7rem',
            fontWeight:600,
            fontSize:'1rem',
            boxShadow:'0 2px 8px rgba(32,77,71,0.10)',
            position:'relative',
            transition:'background 0.2s',
            cursor:'pointer',
            marginLeft:0,
            marginTop:0,
            marginBottom:0,
          }}
          onMouseOver={e => (e.currentTarget.style.background='#357a6c')}
          onMouseOut={e => (e.currentTarget.style.background='#204d47')}
          onClick={() => { window.location.href = '/servicio'; }}
        >
          <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', fontSize:'1.2em' }}>←</span>
          <span style={{ marginLeft:'0.7rem' }}>Regresar a servicios</span>
        </button>
      </div>
      <div className="register-card">
        {(notification && typeof notification.type === 'string' && typeof notification.message === 'string') && (
          <div
            className={`notification-popup ${notification.type} ${showNotification ? 'show' : 'hide'}`}
            style={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
          >
            <span className="notification-icon">
              {notification.type === 'error' ? '⚠️' : '✅'}
            </span>
            {notification.message}
            <button
              className="notification-close"
              onClick={() => {
                setShowNotification(false);
                setTimeout(() => setNotification(null), 400);
              }}
              aria-label="Cerrar notificación"
            >
              &times;
            </button>
          </div>
        )}
        <div className="register-image-section">
          <img src="/images/cita.png" alt="Cita" className="register-image" />
        </div>
        <div className="register-form-section">
          <div className="register-header">
            <h1 className="register-heading">Reservación de cita</h1>
          </div>
          {nombreServicio && (
            <div style={{textAlign:'center',marginBottom:'1rem',fontWeight:600,color:'#204d47'}}>
              Servicio seleccionado: {nombreServicio}
            </div>
          )}
          {bloqueado && (
            <div style={{ color: 'red', fontWeight: 600, textAlign: 'center', marginBottom: '1rem' }}>
              Debes iniciar sesión para reservar una cita.
            </div>
          )}
          {!bloqueado && (
            <button type="button" style={{ marginBottom: '1rem', background: '#204d47', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 500, cursor: 'pointer' }} onClick={autocompletarUsuario}>
              Autocompletar mis datos
            </button>
          )}
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Primera fila: Nombres, Apellidos, Email */}
            <div className="register-row">
              <div className="register-col">
                <label htmlFor="nombre" className="register-label">Nombres</label>
                <input type="text" id="nombre" placeholder="Ingresar Nombres" className="register-input" required style={{ color: '#204d47' }} value={form.nombre} onChange={handleChange} />
              </div>
              {/* Eliminar campo apellidos */}
              <div className="register-col">
                <label htmlFor="email" className="register-label">Email</label>
                <input type="email" id="email" placeholder="Ingresar Email" className="register-input" required style={{ color: '#204d47' }} value={form.email} onChange={handleChange} />
              </div>
            </div>
            {/* Segunda fila: Número, Fecha, Hora (sin campo Horario) */}
            <div className="register-row">
              <div className="register-col">
                <label htmlFor="numero" className="register-label">Número</label>
                <input type="tel" id="numero" placeholder="Ingresar Número" className="register-input" required style={{ color: '#204d47' }} value={form.numero} onChange={handleChange} />
              </div>
              <div className="register-col">
                <label htmlFor="fecha" className="register-label">Fecha</label>
                <input type="date" id="fecha" className="register-input" required style={{ color: '#204d47' }} value={form.fecha} onChange={handleChange} />
              </div>
              <div className="register-col">
                <label htmlFor="id_horario" className="register-label">Horario</label>
                {form.fecha && getHorasDisponibles().length === 0 ? (
                  <div style={{ color: 'red', fontWeight: 500, marginTop: 8 }}>
                    No hay horarios disponibles para el día seleccionado.
                  </div>
                ) : (
                  <select id="hora" className="register-input" required style={{ color: '#204d47' }} value={form.hora || ""} onChange={handleChange} disabled={!form.fecha || getHorasDisponibles().length === 0}>
                    <option value="">Selecciona hora</option>
                    {getHorasDisponibles().map((hora) => (
                      <option key={hora} value={hora}>{hora}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            {/* Tercera fila: Servicio */}
            <div className="register-row">
              <div className="register-col" style={{ flex: 2 }}>
                <label htmlFor="servicio" className="register-label">Servicio</label>
                <select
                  id="servicio"
                  className="register-input"
                  required
                  style={{ color: '#204d47', background: !!servicioInicial ? '#e0f1ee' : undefined }}
                  value={form.servicio}
                  onChange={handleChange}
                  disabled={!!servicioInicial}
                >
                  <option value="">Servicio</option>
                  {servicios.map((s: any) => (
                    <option key={s.id_servicio || s.id} value={s.nombre_servicio || s.nombre}>
                      {s.nombre_servicio || s.nombre}
                    </option>
                  ))}
                </select>
                {servicioInicial && (
                  <div style={{ color: '#357a6c', fontWeight: 500, marginTop: 6 }}>
                    Servicio seleccionado automáticamente: <b>{servicioInicial}</b>
                  </div>
                )}
              </div>
              <div className="register-col"></div>
              <div className="register-col"></div>
            </div>
            {/* Cuarta fila: Notas */}
            <div className="register-row">
              <div className="register-col" style={{ flex: 3 }}>
                <label htmlFor="notas" className="register-label">Notas</label>
                <textarea id="notas" placeholder="Notas adicionales" className="register-input" style={{ resize: 'vertical', minHeight: '80px', maxHeight: '180px', color: '#204d47' }} value={form.notas} onChange={handleChange} />
              </div>
            </div>
            {/* Botón */}
            <div className="register-row" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? "Reservando..." : "Reservar cita"}
              </button>
            </div>
            {mensaje && <div style={{ color: '#204d47', fontWeight: 600, textAlign: 'center', marginTop: '1rem' }}>{mensaje}</div>}
            {error && <div style={{ color: 'red', fontWeight: 600, textAlign: 'center', marginTop: '1rem' }}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );    
};

export default CitasForm;
