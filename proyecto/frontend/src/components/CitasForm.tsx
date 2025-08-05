"use client";
import "../styles/notification.css";

import React from "react";

import { CitaForm, crearCita } from "@/servicios/citasService";

const CitasForm: React.FC = () => {
  const [servicios, setServicios] = React.useState<any[]>([]);
  const [clientes, setClientes] = React.useState<any[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = React.useState<any>(null);
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

  // Cargar clientes disponibles
  React.useEffect(() => {
    async function cargarClientes() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch(`${API_URL}/api/clientes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setClientes(data);
          console.log('Clientes cargados:', data);
        }
      } catch (error) {
        console.error('Error cargando clientes:', error);
      }
    }
    cargarClientes();
  }, []);

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
          // Permitir si es cliente o empleado (admin o empleado)
          if (user.id_cliente || user.tipo_usuario === 'empleado' || user.rol === 'admin' || user.rol === 'empleado') {
            setBloqueado(false);
          } else {
            setBloqueado(true);
          }
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
    while (h <= hFin) {
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
  const [fieldErrors, setFieldErrors] = React.useState({
    nombre: false,
    email: false,
    numero: false,
    fecha: false,
    hora: false,
    servicio: false
  });

  // Función para validar campos en tiempo real
  const validateField = (fieldName: string, value: any) => {
    let isValid = true;
    
    switch (fieldName) {
      case 'nombre':
        isValid = value && value.trim().length > 0;
        break;
      case 'email':
        isValid = value && value.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        break;
      case 'numero':
        isValid = value && value.trim().length > 0 && /^[\d\s\-\+\(\)]+$/.test(value.trim());
        break;
      case 'fecha':
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          isValid = selectedDate >= today;
        } else {
          isValid = false;
        }
        break;
      case 'hora':
        isValid = value && value !== '' && value !== '00:00';
        break;
      case 'servicio':
        isValid = value && value.trim().length > 0;
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: !isValid
    }));
    
    return isValid;
  };

  // Función para validar todos los campos
  const validateAllFields = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = form.fecha ? new Date(form.fecha) : null;
    
    const errors = {
      nombre: !form.nombre?.trim(),
      email: !form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
      numero: !form.numero?.trim() || !/^[\d\s\-\+\(\)]+$/.test(form.numero.trim()),
      fecha: !form.fecha || !selectedDate || selectedDate < today,
      hora: !form.hora || form.hora === '' || form.hora === '00:00',
      servicio: !form.servicio?.trim()
    };
    
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const fieldName = e.target.id;
    const value = e.target.value;
    
    // Si el campo es hora, buscar el id_horario que corresponde a la hora seleccionada y el día
    if (fieldName === "hora") {
      let idHorario = "";
      if (form.fecha && value) {
        const [year, month, day] = form.fecha.split('-').map(Number);
        const fecha = new Date(year, month - 1, day);
        const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        const diaActual = diasSemana[fecha.getDay()];
        // Buscar el horario exacto por día y hora
        const horarioExacto = horarios.find(h => h.dia === diaActual && (h.hora_inicio?.slice(0,5) === value || (h.hora_inicio?.match(/T(\d{2}:\d{2})/)?.[1] === value)));
        if (horarioExacto) {
          idHorario = String(horarioExacto.id_horario);
        }
      }
      setForm({
        ...form,
        hora: value,
        id_horario: idHorario
      });
      validateField('hora', value);
    } else if (fieldName === "fecha") {
      // Si cambia la fecha y ya hay hora seleccionada, asigna el id_horario del horario del día
      let idHorario = form.id_horario;
      if (value && form.hora) {
        const [year, month, day] = value.split('-').map(Number);
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
      setForm({ ...form, fecha: value, id_horario: idHorario });
      validateField('fecha', value);
    } else {
      setForm({ ...form, [fieldName]: value });
      validateField(fieldName, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    if (!validateAllFields()) {
      setNotification({ type: 'error', message: 'Por favor completa todos los campos correctamente' });
      return;
    }
    
    setLoading(true);
    setMensaje("");
    setError("");
    try {
      // Buscar el id_servicio correspondiente al nombre seleccionado
      const servicioSeleccionado = servicios.find((s: any) => (s.nombre_servicio || s.nombre) === form.servicio);
      const id_servicio = Number(servicioSeleccionado?.id_servicio || servicioSeleccionado?.id);
      if (!id_servicio) throw new Error("No se encontró el servicio seleccionado");

      // Obtener id_cliente del cliente seleccionado o del usuario actual
      let id_cliente;
      if (clienteSeleccionado) {
        id_cliente = clienteSeleccionado.id_cliente;
      } else if (usuario?.id_cliente) {
        id_cliente = usuario.id_cliente;
      } else {
        throw new Error("Debes seleccionar un cliente o iniciar sesión como cliente");
      }

      // Asignar id_empleado por defecto (puedes cambiar la lógica si tienes selección de empleado)
      const id_empleado = 1; // Por defecto, o puedes obtenerlo de la base de datos o del usuario

      // Adaptar fecha y hora
      const fecha = form.fecha;
      const id_horario = form.id_horario ? Number(form.id_horario) : null;
      // Validar que la hora seleccionada sea válida y no vacía ni '00:00'
      let hora = form.hora;
      if (!hora || hora === '00:00') {
        throw new Error('Debes seleccionar una hora válida para la cita');
      }

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
      <div style={{ display:'flex', justifyContent:'center', marginBottom:'0.8rem', marginTop:'0.3rem' }}>
        <button
          type="button"
          style={{
            background:'#204d47',
            color:'#fff',
            border:'none',
            borderRadius:'6px',
            padding:'0.4rem 1rem 0.4rem 1.3rem',
            fontWeight:600,
            fontSize:'0.9rem',
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
          <span style={{ position:'absolute', left:'0.8rem', top:'50%', transform:'translateY(-50%)', fontSize:'1.1em' }}>←</span>
          <span style={{ marginLeft:'0.6rem' }}>Regresar a servicios</span>
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
            <div style={{textAlign:'center',marginBottom:'0.8rem',fontWeight:600,color:'#204d47',fontSize:'0.9rem'}}>
              Servicio seleccionado: {nombreServicio}
            </div>
          )}
          {bloqueado && (
            <div style={{ color: 'red', fontWeight: 600, textAlign: 'center', marginBottom: '0.8rem', fontSize:'0.9rem' }}>
              Debes iniciar sesión como cliente o empleado para reservar una cita.
            </div>
          )}
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Selector de cliente */}
            {clientes.length > 0 && (
              <div className="register-row" style={{ marginBottom: '1rem' }}>
                <div className="register-col" style={{ flex: 2 }}>
                  <label htmlFor="cliente" className="register-label">Seleccionar Cliente</label>
                  <select
                    id="cliente"
                    className="register-input"
                    style={{ color: '#204d47' }}
                    value={clienteSeleccionado?.id_cliente || ""}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        // Si selecciona "Seleccionar cliente...", limpiar formulario
                        setClienteSeleccionado(null);
                        setForm(prev => ({
                          ...prev,
                          nombre: "",
                          email: "",
                          numero: ""
                        }));
                      } else {
                        const cliente = clientes.find(c => c.id_cliente === Number(e.target.value));
                        setClienteSeleccionado(cliente);
                        if (cliente) {
                          setForm(prev => ({
                            ...prev,
                            nombre: cliente.nombre_cliente || "",
                            email: cliente.correo_electronico || "",
                            numero: cliente.telefono || ""
                          }));
                        }
                      }
                    }}
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((cliente: any) => (
                      <option key={cliente.id_cliente} value={cliente.id_cliente}>
                        {cliente.nombre_cliente} - {cliente.correo_electronico}
                      </option>
                    ))}
                  </select>
                  {clienteSeleccionado && (
                    <div style={{ color: '#357a6c', fontWeight: 500, marginTop: 6, fontSize: '0.85rem' }}>
                      Cliente seleccionado: <b>{clienteSeleccionado.nombre_cliente}</b>
                    </div>
                  )}
                </div>
                <div className="register-col"></div>
              </div>
            )}
            
            {/* Primera fila: Nombres, Apellidos, Email */}
            <div className="register-row">
              <div className="register-col">
                <label htmlFor="nombre" className="register-label">Nombres</label>
                <input 
                  type="text" 
                  id="nombre" 
                  placeholder="Ingresar Nombres" 
                  className="register-input" 
                  required 
                  style={{ 
                    color: '#204d47',
                    borderColor: fieldErrors.nombre ? '#e53e3e' : undefined,
                    backgroundColor: fieldErrors.nombre ? '#fed7d7' : (clienteSeleccionado ? '#e0f1ee' : undefined)
                  }} 
                  value={form.nombre} 
                  onChange={handleChange}
                  onBlur={e => validateField('nombre', e.target.value)}
                  readOnly={!!clienteSeleccionado}
                />
                {fieldErrors.nombre && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                    El nombre es obligatorio
                  </span>
                )}
              </div>
              {/* Eliminar campo apellidos */}
              <div className="register-col">
                <label htmlFor="email" className="register-label">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Ingresar Email" 
                  className="register-input" 
                  required 
                  style={{ 
                    color: '#204d47',
                    borderColor: fieldErrors.email ? '#e53e3e' : undefined,
                    backgroundColor: fieldErrors.email ? '#fed7d7' : (clienteSeleccionado ? '#e0f1ee' : undefined)
                  }} 
                  value={form.email} 
                  onChange={handleChange}
                  onBlur={e => validateField('email', e.target.value)}
                  readOnly={!!clienteSeleccionado}
                />
                {fieldErrors.email && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                    Ingresa un email válido
                  </span>
                )}
              </div>
            </div>
            {/* Segunda fila: Número, Fecha, Hora (sin campo Horario) */}
            <div className="register-row">
              <div className="register-col">
                <label htmlFor="numero" className="register-label">Número</label>
                <input 
                  type="tel" 
                  id="numero" 
                  placeholder="Ingresar Número" 
                  className="register-input" 
                  required 
                  style={{ 
                    color: '#204d47',
                    borderColor: fieldErrors.numero ? '#e53e3e' : undefined,
                    backgroundColor: fieldErrors.numero ? '#fed7d7' : (clienteSeleccionado ? '#e0f1ee' : undefined)
                  }} 
                  value={form.numero} 
                  onChange={handleChange}
                  onBlur={e => validateField('numero', e.target.value)}
                  readOnly={!!clienteSeleccionado}
                />
                {fieldErrors.numero && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                    Ingresa un número válido
                  </span>
                )}
              </div>
              <div className="register-col">
                <label htmlFor="fecha" className="register-label">Fecha</label>
                <input 
                  type="date" 
                  id="fecha" 
                  className="register-input" 
                  required 
                  style={{ 
                    color: '#204d47',
                    borderColor: fieldErrors.fecha ? '#e53e3e' : undefined,
                    backgroundColor: fieldErrors.fecha ? '#fed7d7' : undefined
                  }} 
                  value={form.fecha} 
                  onChange={handleChange}
                  onBlur={e => validateField('fecha', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {fieldErrors.fecha && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                    Selecciona una fecha válida
                  </span>
                )}
              </div>
              <div className="register-col">
                <label htmlFor="id_horario" className="register-label">Horario</label>
                {form.fecha && getHorasDisponibles().length === 0 ? (
                  <div style={{ color: 'red', fontWeight: 500, marginTop: 8 }}>
                    No hay horarios disponibles para el día seleccionado.
                  </div>
                ) : (
                  <>
                    <select 
                      id="hora" 
                      className="register-input" 
                      required 
                      style={{ 
                        color: '#204d47',
                        borderColor: fieldErrors.hora ? '#e53e3e' : undefined,
                        backgroundColor: fieldErrors.hora ? '#fed7d7' : undefined
                      }} 
                      value={form.hora || ""} 
                      onChange={handleChange}
                      onBlur={e => validateField('hora', e.target.value)}
                      disabled={!form.fecha || getHorasDisponibles().length === 0}
                    >
                      <option value="">Selecciona hora</option>
                      {getHorasDisponibles().map((hora) => (
                        <option key={hora} value={hora}>{hora}</option>
                      ))}
                    </select>
                    {fieldErrors.hora && (
                      <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                        Selecciona una hora
                      </span>
                    )}
                  </>
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
                  style={{ 
                    color: '#204d47', 
                    background: !!servicioInicial ? '#e0f1ee' : undefined,
                    borderColor: fieldErrors.servicio ? '#e53e3e' : undefined,
                    backgroundColor: fieldErrors.servicio ? '#fed7d7' : (!!servicioInicial ? '#e0f1ee' : undefined)
                  }}
                  value={form.servicio}
                  onChange={handleChange}
                  onBlur={e => validateField('servicio', e.target.value)}
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
                {fieldErrors.servicio && !servicioInicial && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                    Selecciona un servicio
                  </span>
                )}
              </div>
              <div className="register-col"></div>
              <div className="register-col"></div>
            </div>
            {/* Cuarta fila: Notas */}
            <div className="register-row">
              <div className="register-col" style={{ flex: 3 }}>
                <label htmlFor="notas" className="register-label" style={{fontSize:'0.9rem'}}>Notas</label>
                <textarea id="notas" placeholder="Notas adicionales" className="register-input" style={{ resize: 'vertical', minHeight: '60px', maxHeight: '120px', color: '#204d47', fontSize:'0.9rem', padding:'0.5rem' }} value={form.notas} onChange={handleChange} />
              </div>
            </div>
            {/* Botón */}
            <div className="register-row" style={{ justifyContent: 'center', marginTop: '1rem' }}>
              <button
                type="submit"
                className="register-button"
                disabled={loading || Object.values(fieldErrors).some(error => error)}
                style={{
                  opacity: loading || Object.values(fieldErrors).some(error => error) ? 0.6 : 1,
                  cursor: loading || Object.values(fieldErrors).some(error => error) ? 'not-allowed' : 'pointer',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem'
                }}
              >
                {loading ? "Reservando..." : "Reservar cita"}
              </button>
            </div>
            {mensaje && <div style={{ color: '#204d47', fontWeight: 600, textAlign: 'center', marginTop: '0.8rem', fontSize:'0.9rem' }}>{mensaje}</div>}
            {error && <div style={{ color: 'red', fontWeight: 600, textAlign: 'center', marginTop: '0.8rem', fontSize:'0.9rem' }}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );    
};

export default CitasForm;
