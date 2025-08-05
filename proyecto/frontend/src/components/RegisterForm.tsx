"use client";
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';
import { registerCliente } from '../servicios/authService';
import "../styles/notification.css";

const RegisterForm = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = React.useState(false);
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

  const validate = ({ nombre, email, password, telefono, fechaNacimiento }: any) => {
    if (!nombre) return "El nombre es obligatorio";
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return "El correo no es válido";
    if (!password || password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    if (!telefono) return "El teléfono es obligatorio";
    if (!/^\d{10,}$/.test(telefono)) return "El teléfono debe ser numérico y tener al menos 10 dígitos";
    if (!fechaNacimiento) return "La fecha de nacimiento es obligatoria";
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    if (isNaN(fecha.getTime())) return "La fecha de nacimiento no es válida";
    if (fecha > hoy) return "La fecha de nacimiento no puede ser futura";
    // Validar que el usuario tenga al menos 16 años
    const edadMinima = 16;
    const fechaMinima = new Date(hoy.getFullYear() - edadMinima, hoy.getMonth(), hoy.getDate());
    if (fecha > fechaMinima) return `Debes tener al menos ${edadMinima} años para registrarte`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const nombre = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const telefono = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const fechaNacimiento = (form.elements.namedItem('birthdate') as HTMLInputElement).value;
    const error = validate({ nombre, email, password, telefono, fechaNacimiento });
    if (error) {
      setNotification({ type: 'error', message: error });
      return;
    }
    try {
      await registerCliente({ nombre, email, password, telefono, fechaNacimiento });
      setNotification({ type: 'success', message: '¡Registro exitoso! Redirigiendo...' });
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.response?.data?.mensaje || 'Error al registrar' });
    }
  };

  return (
    <div className="register-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(90deg, #f7fafd 60%, #fff 40%)', position: 'relative', padding: '1rem' }}>
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
      <div className="register-card" style={{ maxWidth: '1000px', minWidth: '700px', height: '580px', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)', borderRadius: '24px', background: 'transparent', display: 'flex', overflow: 'hidden', margin: 'auto', padding: '0', gap: '0' }}>
        <div className="register-form-section" style={{ flex: '1 1 0%', flexShrink: 0, padding: '2rem 2rem 2rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.2rem', marginRight: '0', minWidth: '350px', maxWidth: '450px', background: 'transparent', height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.2rem', gap: '0.1rem' }}>
            <img
              src="/images/logo_chapaspa.png"
              alt="Logo ChapaSPA"
              style={{ height: '75px', width: '75px', objectFit: 'contain', borderRadius: '50%' }}
            />
          </div>
          <h1 className="register-heading" style={{ fontSize: '1.7rem', fontWeight: 900, color: '#204d47', marginBottom: '0.3rem', letterSpacing: '0.04em', textAlign: 'center' }}>Registro</h1>
          <form className="register-form" ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '1.2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="name" className="register-label">Nombre</label>
                <input type="text" id="name" placeholder="Ingresar Nombre" className="register-input" required style={{ fontSize: '0.95rem', fontWeight: 600, color: '#204d47', background: '#f7fafd', height: '42px', border: '1px solid #b5c7c6', borderRadius: '8px', width: '100%' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="email" className="register-label">Email</label>
                <input type="email" id="email" placeholder="Ingresar Email" className="register-input" required style={{ fontSize: '0.95rem', fontWeight: 600, color: '#204d47', background: '#f7fafd', height: '42px', border: '1px solid #b5c7c6', borderRadius: '8px', width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="password" className="register-label">Contraseña</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Ingresar Contraseña"
                    className="register-input"
                    required
                    style={{ fontSize: '0.95rem', fontWeight: 600, color: '#204d47', background: '#f7fafd', paddingRight: '2.2rem', height: '42px', border: '1px solid #b5c7c6', borderRadius: '8px', width: '100%' }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '0.7rem',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#357a6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-10.94-7.5a10.45 10.45 0 0 1 2.54-3.73"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.96 0 1.84-.36 2.5-.97"/><path d="M14.47 14.47A3.5 3.5 0 0 0 12 8.5c-.96 0-1.84.36-2.5.97"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#357a6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12C2.73 7.11 7 4 12 4s9.27 3.11 11 8c-1.73 4.89-6 8-11 8s-9.27-3.11-11-8z"/><circle cx="12" cy="12" r="3.5"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="phone" className="register-label">Teléfono</label>
                <input type="tel" id="phone" placeholder="Ingresar Teléfono" className="register-input" required style={{ fontSize: '0.95rem', fontWeight: 600, color: '#204d47', background: '#f7fafd', height: '42px', border: '1px solid #b5c7c6', borderRadius: '8px', width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <label htmlFor="birthdate" className="register-label">Fecha de nacimiento</label>
              <input type="date" id="birthdate" className="register-input" required style={{ fontSize: '0.95rem', fontWeight: 600, color: '#204d47', background: '#f7fafd', height: '42px', border: '1px solid #b5c7c6', borderRadius: '8px', width: '100%' }} placeholder="Seleccionar Fecha de nacimiento" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', marginTop: '1rem', marginBottom: '0.8rem', justifyContent: 'center' }}>
              <button
                type="submit"
                className="register-button"
                style={{
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  padding: '0.6rem 1.8rem',
                  border: 'none',
                  background: 'linear-gradient(90deg, #204d47 60%, #357a6c 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  letterSpacing: '0.04em',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.04)';
                  e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(31,38,135,0.18)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(31,38,135,0.13)';
                }}
              >
                Registrarse
              </button>
              <button
                type="button"
                className="register-button"
                style={{
                  background: '#fff',
                  color: '#204d47',
                  border: '2px solid #204d47',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  padding: '0.6rem 1.8rem',
                  boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                  cursor: 'pointer',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  letterSpacing: '0.04em',
                }}
                onClick={() => window.location.href = '/login'}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.04)';
                  e.currentTarget.style.boxShadow = '0 8px 24px 0 rgba(31,38,135,0.18)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(31,38,135,0.13)';
                }}
              >
                Ir al login
              </button>
            </div>
          </form>
        </div>
        <div className="register-image-section" style={{ flex: '1 1 0%', flexShrink: 0, minWidth: '300px', maxWidth: '450px', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', background: 'transparent', padding: '0', marginLeft: '0', height: '100%' }}>
          <img src="/images/register.png" alt="Registro" className="register-image" style={{ borderRadius: '0 24px 24px 0', objectFit: 'cover', width: '100%', height: '100%', minHeight: '580px', maxHeight: '580px', boxShadow: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
