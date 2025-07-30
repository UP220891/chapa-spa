"use client";
import React, { useRef } from 'react';
import { registerCliente } from '../servicios/authService';
import { useRouter } from 'next/navigation';

const RegisterForm = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const nombre = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const telefono = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const fechaNacimiento = (form.elements.namedItem('birthdate') as HTMLInputElement).value;
    try {
      await registerCliente({ nombre, email, password, telefono, fechaNacimiento });
      router.push('/login');
    } catch (err: any) {
      alert(err?.response?.data?.mensaje || 'Error al registrar');
    }
  };

  return (
    <div className="register-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(90deg, #f7fafd 60%, #fff 40%)' }}>
      <div className="register-card" style={{ maxWidth: '1500px', minWidth: '900px', height: '800px', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)', borderRadius: '32px', background: 'transparent', display: 'flex', overflow: 'hidden', margin: 'auto', padding: '0', gap: '0' }}>
        <div className="register-form-section" style={{ flex: '1 1 0%', flexShrink: 0, padding: '4rem 3rem 4rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2rem', marginRight: '0', minWidth: '520px', maxWidth: '600px', background: 'transparent', height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.7rem', gap: '0.3rem' }}>
            <div style={{ background: '#fff', borderRadius: '50%', padding: '22px', boxShadow: '0 6px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.7rem' }}>
              <img
                src="/images/logo_chapaspa.png"
                alt="Logo ChapaSPA"
                style={{ height: '100px', width: '100px', objectFit: 'contain', borderRadius: '50%' }}
              />
            </div>

          </div>
          <h1 className="register-heading" style={{ fontSize: '2.1rem', fontWeight: 900, color: '#204d47', marginBottom: '0.7rem', letterSpacing: '0.04em', textAlign: 'center' }}>Registro</h1>
          <form className="register-form" ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="name" className="register-label">Nombre</label>
                <input type="text" id="name" placeholder="Ingresar Nombre" className="register-input" required style={{ fontSize: '1.08rem', fontWeight: 600, color: '#204d47', background: '#f7fafd' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="email" className="register-label">Email</label>
                <input type="email" id="email" placeholder="Ingresar Email" className="register-input" required style={{ fontSize: '1.08rem', fontWeight: 600, color: '#204d47', background: '#f7fafd' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="password" className="register-label">Contraseña</label>
                <input type="password" id="password" placeholder="Ingresar Contraseña" className="register-input" required style={{ fontSize: '1.08rem', fontWeight: 600, color: '#204d47', background: '#f7fafd' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <label htmlFor="phone" className="register-label">Teléfono</label>
                <input type="tel" id="phone" placeholder="Ingresar Teléfono" className="register-input" required style={{ fontSize: '1.08rem', fontWeight: 600, color: '#204d47', background: '#f7fafd' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.2rem' }}>
              <label htmlFor="birthdate" className="register-label">Fecha de nacimiento</label>
              <input type="date" id="birthdate" className="register-input" required style={{ fontSize: '1.08rem', fontWeight: 600, color: '#204d47', background: '#f7fafd' }} placeholder="Seleccionar Fecha de nacimiento" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '2.2rem', marginTop: '2rem', marginBottom: '1.2rem', justifyContent: 'center' }}>
              <button
                type="submit"
                className="register-button"
                style={{
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px 0 rgba(31,38,135,0.13)',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  padding: '0.8rem 2.2rem',
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
                  fontSize: '1.1rem',
                  padding: '0.8rem 2.2rem',
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
        <div className="register-image-section" style={{ flex: '1 1 0%', flexShrink: 0, minWidth: '400px', maxWidth: '600px', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch', background: 'transparent', padding: '0', marginLeft: '0', height: '100%' }}>
          <img src="/images/register.png" alt="Registro" className="register-image" style={{ borderRadius: '0 32px 32px 0', objectFit: 'cover', width: '100%', height: '100%', minHeight: '800px', maxHeight: '800px', boxShadow: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
