"use client";
import "../styles/notification.css";

import React from "react";
import { useSearchParams } from "next/navigation";

import { crearCita, CitaForm, Servicio } from "@/servicios/citasService";

const CitasForm: React.FC = () => {
  const [servicios, setServicios] = React.useState<any[]>([]);
  const [nombreServicio, setNombreServicio] = React.useState<string>("");
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
          // Si el param es id (número), busca el nombre por id
          const servicioEncontrado = data.find((s: any) => s.id?.toString() === servicioParam);
          if (servicioEncontrado) setNombreServicio(servicioEncontrado.nombre);
        }
      } catch {}
    }
    cargarServicios();
  }, [servicioParam]);
  // (Eliminado: segunda declaración de searchParams y servicioParam)
  const [usuario, setUsuario] = React.useState<any>(null);
  const [bloqueado, setBloqueado] = React.useState(true);
  // Convierte el id de servicio recibido en la URL a un valor válido del tipo Servicio
  const servicioInicial = servicioParam as Servicio;
  const [form, setForm] = React.useState<CitaForm>({
    nombre: "",
    email: "",
    numero: "",
    fecha: "",
    hora: "",
    servicio: servicioInicial,
    notas: ""
  });

  // Autocompleta nombre, email, número y servicio si hay usuario y parámetro de servicio
  // Solo autocompletar el servicio en automático si viene por parámetro
  React.useEffect(() => {
    setForm(prev => ({
      ...prev,
      servicio: prev.servicio || servicioInicial
    }));
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

  // Lógica de horarios del SPA
  const getHorasDisponibles = () => {
    if (!form.fecha) return [];
    const fecha = new Date(form.fecha);
    const dia = fecha.getDay(); // 0=Domingo, 6=Sábado
    let horas: string[] = [];
    if (dia === 0) return []; // Domingo cerrado
    if (dia >= 1 && dia <= 5) {
      // Lunes a viernes 9-18
      for (let h = 9; h <= 18; h++) {
        horas.push(h.toString().padStart(2, '0') + ':00');
      }
    } else if (dia === 6) {
      // Sábado 10-14
      for (let h = 10; h <= 14; h++) {
        horas.push(h.toString().padStart(2, '0') + ':00');
      }
    }
    return horas;
  };

  const autocompletarUsuario = () => {
    if (!usuario) {
      setNotification({ type: 'error', message: 'No se encontró información de usuario en el sistema.' });
      return;
    }
    let cambios: Partial<CitaForm> = {};
    if (usuario.nombre) cambios.nombre = usuario.nombre;
    if (usuario.email) cambios.email = usuario.email;
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
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");
    try {
      await crearCita(form);
      setNotification({ type: 'success', message: '¡Cita reservada exitosamente!' });
      setForm({ nombre: "", email: "", numero: "", fecha: "", hora: "", servicio: "", notas: "" });
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || "Error al reservar la cita" });
    }
    setLoading(false);
  };

  return (
    <div className="register-container" style={{ position: 'relative' }}>
      {nombreServicio && (
        <div style={{textAlign:'center',marginBottom:'1rem',fontWeight:600,color:'#204d47'}}>
          Servicio seleccionado: {nombreServicio}
        </div>
      )}
      {notification && (
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
      <div className="register-card">
        <div className="register-image-section">
          <img src="/images/cita.png" alt="Cita" className="register-image" />
        </div>
        <div className="register-form-section">
          <div className="register-header">
            <h1 className="register-heading">Reservación de cita</h1>
          </div>
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
            {/* Segunda fila: Número, Fecha, Hora */}
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
                <label htmlFor="hora" className="register-label">Hora</label>
                <select id="hora" className="register-input" required style={{ color: '#204d47' }} value={form.hora} onChange={handleChange} disabled={!form.fecha || getHorasDisponibles().length === 0}>
                  <option value="">Selecciona hora</option>
                  {getHorasDisponibles().map(hora => (
                    <option key={hora} value={hora}>{hora}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Tercera fila: Servicio */}
            <div className="register-row">
              <div className="register-col" style={{ flex: 2 }}>
                <label htmlFor="servicio" className="register-label">Servicio</label>
                <select id="servicio" className="register-input" required style={{ color: '#204d47' }} value={form.servicio} onChange={handleChange}>
                  <option value="">Servicio</option>
                  <option value="masaje">Masaje</option>
                  <option value="facial">Facial</option>
                  <option value="manicure">Manicure</option>
                  {/* Agrega más servicios aquí */}
                </select>
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
