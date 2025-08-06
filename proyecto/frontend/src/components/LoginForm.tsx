import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { login, LoginData } from '../servicios/authService';
import { getRedirectPath } from '../utils/auth-config';

function LoginForm({ showHomeButton = false }) {
  // Estados para email y password
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showNotification, setShowNotification] = React.useState(false);
  const { login: authLogin } = useAuth();

  // Efecto para manejar las notificaciones
  React.useEffect(() => {
    if (notification) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => setNotification(null), 400);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Limpiar errores cuando el usuario empiece a escribir
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError(null);
      setNotification(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) {
      setError(null);
      setNotification(null);
    }
  };

  // Manejar submit
  const validate = (email: string, password: string) => {
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return "El correo electrónico no es válido";
    if (!password) return "La contraseña es obligatoria";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validate(email, password);
    if (errorMsg) {
      setError(errorMsg);
      setNotification({ type: 'error', message: errorMsg });
      return;
    }
    setError(null);
    setNotification(null);
    setLoading(true);
    
    try {
      const loginData: LoginData = { email, password };
      const response = await login(loginData);
      
      // El backend devuelve 'usuario' y 'tipo_usuario', no 'user' y 'tipo'
      console.log('Respuesta del login:', response);
      
      // Guardar toda la información del usuario que viene del backend
      const user = {
        // Campos básicos para compatibilidad
        id: response.usuario?.id_cliente || response.usuario?.id_empleado || 0,
        nombre: response.usuario?.nombre_cliente || response.usuario?.nombre_empleado || '',
        email: email,
        tipo: response.usuario?.tipo_usuario || 'cliente',
        
        // Campos adicionales del cliente
        nombre_cliente: response.usuario?.nombre_cliente,
        telefono: response.usuario?.telefono,
        fecha_nacimiento: response.usuario?.fecha_nacimiento,
        correo_electronico: response.usuario?.email || email,
        
        // Campos adicionales del empleado
        nombre_empleado: response.usuario?.nombre_empleado,
        id_especialidad: response.usuario?.id_especialidad,
        id_horarios: response.usuario?.id_horarios,
        especialidad: response.usuario?.especialidad,
        horarios: response.usuario?.horarios,
        
        // Agregar todo lo que venga del backend
        ...response.usuario
      };
      
      console.log('Usuario creado para autenticación:', user);
      
      // Actualizar el estado de autenticación
      authLogin(user);
      
      // Redireccionar según el tipo de usuario
      const redirectPath = getRedirectPath(user.tipo);
      console.log(`Tipo de usuario: ${user.tipo}, Redirigiendo a: ${redirectPath}`);
      
      // Pequeño delay para asegurar que el estado se actualice
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
      
    } catch (err: any) {
      console.error('Error completo del login:', err);
      console.error('Respuesta del servidor:', err.response?.data);
      
      let errorMessage = 'Error al iniciar sesión';
      
      // Manejar errores específicos del servidor
      if (err.response?.status === 401) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Usuario no encontrado. Verifica tu email o regístrate.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Datos inválidos. Verifica la información ingresada.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Error del servidor. Intenta nuevamente en unos momentos.';
      } else if (err.message) {
        errorMessage = err.message;
      } else if (!navigator.onLine) {
        errorMessage = 'Sin conexión a internet. Verifica tu conexión.';
      }
      
      setError(errorMessage);
      setNotification({ type: 'error', message: errorMessage });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafd', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative' }}>
      {/* Notificación emergente */}
      {notification && (
        <div
          className={`notification-popup ${notification.type} ${showNotification ? 'show' : 'hide'}`}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            zIndex: 1000,
            background: notification.type === 'error' ? '#fee' : '#efe',
            color: notification.type === 'error' ? '#c53030' : '#38a169',
            padding: '12px 24px',
            borderRadius: '8px',
            border: `2px solid ${notification.type === 'error' ? '#fed7d7' : '#c6f6d5'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: '0.95rem',
            maxWidth: '500px',
            textAlign: 'center',
            opacity: showNotification ? 1 : 0,
            transition: 'all 0.4s ease-in-out',
            transform: showNotification ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-20px)'
          }}
        >
          <span style={{ marginRight: '8px' }}>
            {notification.type === 'error' ? '⚠️' : '✅'}
          </span>
          {notification.message}
          <button
            onClick={() => {
              setShowNotification(false);
              setTimeout(() => setNotification(null), 400);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              marginLeft: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              padding: '0 4px'
            }}
          >
            ×
          </button>
        </div>
      )}
      <div style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.12)', borderRadius: '20px', background: '#fff', display: 'flex', overflow: 'hidden', minWidth: '600px', maxWidth: '850px', margin: 'auto', padding: '1.5rem 1rem' }}>
        <div className="login-form-section" style={{ borderRadius: '20px 0 0 20px', minWidth: '280px', maxWidth: '380px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '1.5rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.8rem', gap: '0.2rem' }}>
            <img
              src="/images/logo_chapaspa.png"
              alt="Logo ChapaSPA"
              style={{ height: '75px', width: '75px', objectFit: 'contain', borderRadius: '50%' }}
            />
          </div>
          <h1 className="login-heading" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#204d47', marginBottom: '0.3rem', textAlign: 'center', lineHeight: '1.1', letterSpacing: '0.04em' }}>Iniciar sesión</h1>
          <form className="login-form" style={{ gap: '0.7rem' }} onSubmit={handleSubmit}>
            <label htmlFor="email" style={{ fontSize: '1.08rem', fontWeight: 700, color: '#357a6c', marginBottom: '0.1rem', letterSpacing: '0.02em' }}>Email</label>
            <input
              type="email"
              id="email"
              placeholder="Ingresar Email"
              autoComplete="username"
              value={email}
              onChange={handleEmailChange}
              style={{
                padding: '0.6rem',
                fontSize: '0.95rem',
                border: error && error.includes('correo') ? '2px solid #e53e3e' : '1px solid #bbb',
                borderRadius: '6px',
                marginBottom: '0.2rem',
                background: '#f7fafd',
                fontWeight: 600,
                color: '#204d47',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '0.03em',
              }}
            />
            <label htmlFor="password" style={{ fontSize: '1.08rem', fontWeight: 700, color: '#357a6c', marginBottom: '0.1rem', letterSpacing: '0.02em' }}>Contraseña</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Ingresar Contraseña"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  fontSize: '0.95rem',
                  border: error && error.includes('contraseña') ? '2px solid #e53e3e' : '1px solid #bbb',
                  borderRadius: '6px',
                  marginBottom: '0.2rem',
                  background: '#f7fafd',
                  fontWeight: 600,
                  color: '#204d47',
                  fontFamily: 'Montserrat, sans-serif',
                  letterSpacing: '0.03em',
                  paddingRight: '2.2rem',
                  boxSizing: 'border-box',
                }}
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
                  zIndex: 2,
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#357a6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-10.94-7.5a10.45 10.45 0 0 1 2.54-3.73"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c.96 0 1.84-.36 2.5-.97"/><path d="M14.47 14.47A3.5 3.5 0 0 0 12 8.5c-.96 0-1.84.36-2.5.97"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#357a6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12C2.73 7.11 7 4 12 4s9.27-3.11 11 8c-1.73 4.89-6 8-11 8s-9.27-3.11-11-8z"/><circle cx="12" cy="12" r="3.5"/></svg>
                )}
              </button>
            </div>
            <style>{`
              input::placeholder {
                color: #7a8a8a;
                font-weight: 700;
                font-size: 1.18rem;
                letter-spacing: 0.01em;
                opacity: 0.55;
                font-family: inherit;
              }
            `}</style>
            {error && (
              <div style={{ 
                color: '#c53030', 
                fontWeight: 600, 
                marginBottom: '0.5rem', 
                textAlign: 'center',
                background: '#fed7d7',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #feb2b2',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
              <button
                type="submit"
                className="login-btn login-btn-visual"
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  letterSpacing: '0.04em',
                  background: '#204d47',
                  color: '#fff',
                  border: 'none',
                  padding: '0.6rem 1.8rem',
                  boxShadow: '0 2px 8px 0 rgba(31,38,135,0.08)',
                  transition: 'background 0.2s, transform 0.2s',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
              <button
                type="button"
                className="login-btn login-btn-visual"
                style={{
                  background: '#204d47',
                  color: '#fff',
                  border: '2px solid #357a6c',
                  borderRadius: '8px',
                  padding: '0.6rem 1.8rem',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px 0 rgba(31,38,135,0.08)',
                  letterSpacing: '0.04em',
                }}
                onClick={() => window.location.href = '/register'}
              >
                Registrarse
              </button>
            </div>
            {showHomeButton && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.8rem' }}>
                <button
                  type="button"
                  className="login-btn login-btn-visual"
                  style={{
                    background: '#357a6c',
                    color: '#fff',
                    border: '2px solid #204d47',
                    borderRadius: '8px',
                    padding: '0.8rem 2.2rem',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px 0 rgba(31,38,135,0.08)',
                    letterSpacing: '0.04em',
                  }}
                  onClick={() => window.location.href = '/'}
                >
                  Página de inicio
                </button>
              </div>
            )}
          </form>
        </div>
        <div className="login-image-section" style={{ borderRadius: '0 20px 20px 0', minWidth: '280px', maxWidth: '380px', overflow: 'hidden', display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: '#fff', padding: 0 }}>
          <img src="/images/login.png" alt="Spa login" className="login-image" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '4px solid #fff', borderRadius: '0 20px 20px 0', objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
