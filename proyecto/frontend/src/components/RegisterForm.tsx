"use client";
import React from 'react';

const RegisterForm = () => {
  return (
    <div className="register-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(90deg, #f7fafd 60%, #fff 40%)' }}>
      <div className="register-card" style={{ maxWidth: '1500px', minWidth: '900px', height: '800px', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)', borderRadius: '32px', background: 'transparent', display: 'flex', overflow: 'hidden', margin: 'auto', padding: '0', gap: '0' }}>
        <div className="register-form-section" style={{ flex: '1 1 0%', flexShrink: 0, padding: '4rem 3rem 4rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2rem', marginRight: '0', minWidth: '520px', maxWidth: '600px', background: 'transparent', height: '100%' }}>
          <h2 className="register-title" style={{ marginBottom: '0.2rem' }}>CHAPASPA´S</h2>
          <h1 className="register-heading" style={{ marginBottom: '0.7rem' }}>Registro</h1>
          <form className="register-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="name" className="register-label">Nombre</label>
                <input type="text" id="name" placeholder="Nombre" className="register-input" required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="email" className="register-label">Email</label>
                <input type="email" id="email" placeholder="Email" className="register-input" required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="password" className="register-label">Contraseña</label>
                <input type="password" id="password" placeholder="Contraseña" className="register-input" required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="phone" className="register-label">Teléfono</label>
                <input type="tel" id="phone" placeholder="Teléfono" className="register-input" required />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.2rem' }}>
              <label htmlFor="birthdate" className="register-label">Fecha de nacimiento</label>
              <input type="date" id="birthdate" className="register-input" required />
            </div>
            <button type="submit" className="register-button" style={{ marginTop: '1.2rem', marginBottom: '0.7rem' }}>Registrarse</button>
          </form>
          <button
            type="button"
            className="register-button"
            style={{ background: '#fff', color: '#204d47', border: '2px solid #204d47', marginTop: '0.7rem', marginBottom: '0.2rem' }}
            onClick={() => window.location.href = '/login'}
          >
            Ir al login
          </button>
        </div>
        <div className="register-image-section" style={{ flex: '1 1 0%', flexShrink: 0, minWidth: '400px', maxWidth: '600px', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', background: 'transparent', padding: '0', marginLeft: '0', height: '100%' }}>
          <img src="/images/register.png" alt="Registro" className="register-image" style={{ borderRadius: '0 32px 32px 0', objectFit: 'cover', width: '100%', height: '100%', minHeight: '800px', maxHeight: '800px', boxShadow: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
