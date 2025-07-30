"use client";

const CitasForm = () => {
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
          <form className="register-form">
            {/* Primera fila: Nombres, Apellidos, Email */}
            <div className="register-row">
              <div className="register-col">
                <label htmlFor="nombre" className="register-label">Nombres</label>
                <input type="text" id="nombre" placeholder="Ingresar Nombres" className="register-input" required style={{ color: '#204d47' }} />
              </div>
              <div className="register-col">
                <label htmlFor="apellidos" className="register-label">Apellidos</label>
                <input type="text" id="apellidos" placeholder="Ingresar Apellidos" className="register-input" required style={{ color: '#204d47' }} />
              </div>
              <div className="register-col">
                <label htmlFor="email" className="register-label">Email</label>
                <input type="email" id="email" placeholder="Ingresar Email" className="register-input" required style={{ color: '#204d47' }} />
              </div>
            </div>
            {/* Segunda fila: Número, Fecha, Hora */}
            <div className="register-row">
              <div className="register-col">
                <label htmlFor="numero" className="register-label">Número</label>
                <input type="tel" id="numero" placeholder="Ingresar Número" className="register-input" required style={{ color: '#204d47' }} />
              </div>
              <div className="register-col">
                <label htmlFor="fecha" className="register-label">Fecha</label>
                <input type="date" id="fecha" className="register-input" required style={{ color: '#204d47' }} />
              </div>
              <div className="register-col">
                <label htmlFor="hora" className="register-label">Hora</label>
                <input type="time" id="hora" className="register-input" required style={{ color: '#204d47' }} />
              </div>
            </div>
            {/* Tercera fila: Servicio */}
            <div className="register-row">
              <div className="register-col" style={{ flex: 2 }}>
                <label htmlFor="servicio" className="register-label">Servicio</label>
                <select id="servicio" className="register-input" required style={{ color: '#204d47' }}>
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
                <textarea id="notas" placeholder="Notas adicionales" className="register-input" style={{ resize: 'vertical', minHeight: '80px', maxHeight: '180px', color: '#204d47' }} />
              </div>
            </div>
            {/* Botón */}
            <div className="register-row" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="register-button"
              >
                Reservar cita
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );    
};

export default CitasForm;
