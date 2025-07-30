"use client";

import React from "react";

import { crearCita, CitaForm, Servicio } from "@/servicios/citasService";

const CitasForm: React.FC = () => {
  const [form, setForm] = React.useState<CitaForm>({
    nombre: "",
    apellidos: "",
    email: "",
    numero: "",
    fecha: "",
    hora: "",
    servicio: "" as Servicio,
    notas: ""
  });
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
      setMensaje("¡Cita reservada exitosamente!");
      setForm({ nombre: "", apellidos: "", email: "", numero: "", fecha: "", hora: "", servicio: "", notas: "" });
    } catch (err: any) {
      setError(err?.message || "Error al reservar la cita");
    }
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-image-section">
          <img src="/images/cita.png" alt="Cita" className="register-image" />
        </div>
        <div className="register-form-section">
          <div className="register-header">
            <h1 className="register-heading">Reservación de cita</h1>
          </div>
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Primera fila: Nombres, Apellidos, Email */}
            <div className="register-row">
              <div className="register-col">
                <label htmlFor="nombre" className="register-label">Nombres</label>
                <input type="text" id="nombre" placeholder="Ingresar Nombres" className="register-input" required style={{ color: '#204d47' }} value={form.nombre} onChange={handleChange} />
              </div>
              <div className="register-col">
                <label htmlFor="apellidos" className="register-label">Apellidos</label>
                <input type="text" id="apellidos" placeholder="Ingresar Apellidos" className="register-input" required style={{ color: '#204d47' }} value={form.apellidos} onChange={handleChange} />
              </div>
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
                <input type="time" id="hora" className="register-input" required style={{ color: '#204d47' }} value={form.hora} onChange={handleChange} />
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
