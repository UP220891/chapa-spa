import React from 'react';

function LoginForm({ showHomeButton = false }) {
  // Estados para email y password
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Manejar submit
  const validate = (email: string, password: string) => {
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return "El correo no es válido";
    if (!password) return "La contraseña es obligatoria";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validate(email, password);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        window.location.href = '/';
      } else {
        setError(data.mensaje || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.12)', borderRadius: '24px', background: '#fff', display: 'flex', overflow: 'hidden', minWidth: '800px', maxWidth: '1100px', margin: 'auto', padding: '2.5rem 2rem' }}>
        <div className="login-form-section" style={{ borderRadius: '24px 0 0 24px', minWidth: '340px', maxWidth: '480px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.1rem', gap: '0.3rem' }}>
            <div style={{ background: '#fff', borderRadius: '50%', padding: '22px', boxShadow: '0 6px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.7rem' }}>
              <img
                src="/images/logo_chapaspa.png"
                alt="Logo ChapaSPA"
                style={{ height: '100px', width: '100px', objectFit: 'contain', borderRadius: '50%' }}
              />
            </div>
          </div>
          <h1 className="login-heading" style={{ fontSize: '2.1rem', fontWeight: 900, color: '#204d47', marginBottom: '0.5rem', textAlign: 'center', lineHeight: '1.1', letterSpacing: '0.04em' }}>Iniciar sesión</h1>
          <form className="login-form" style={{ gap: '0.7rem' }} onSubmit={handleSubmit}>
            <label htmlFor="email" style={{ fontSize: '1.08rem', fontWeight: 700, color: '#357a6c', marginBottom: '0.1rem', letterSpacing: '0.02em' }}>Email</label>
            <input
              type="email"
              id="email"
              placeholder="Ingresar Email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                padding: '0.7rem',
                fontSize: '1rem',
                border: '1px solid #bbb',
                borderRadius: '6px',
                marginBottom: '0.3rem',
                background: '#f7fafd',
                fontWeight: 600,
                color: '#204d47',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '0.03em',
              }}
            />
            <label htmlFor="password" style={{ fontSize: '1.08rem', fontWeight: 700, color: '#357a6c', marginBottom: '0.1rem', letterSpacing: '0.02em' }}>Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Ingresar Contraseña"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                padding: '0.7rem',
                fontSize: '1rem',
                border: '1px solid #bbb',
                borderRadius: '6px',
                marginBottom: '0.3rem',
                background: '#f7fafd',
                fontWeight: 600,
                color: '#204d47',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '0.03em',
              }}
            />
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
            {error && <div style={{ color: 'red', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1.2rem', marginTop: '1.5rem', justifyContent: 'center' }}>
              <button
                type="submit"
                className="login-btn login-btn-visual"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  letterSpacing: '0.04em',
                  background: '#204d47',
                  color: '#fff',
                  border: 'none',
                  padding: '0.8rem 2.2rem',
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
                  padding: '0.8rem 2.2rem',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
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
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.2rem' }}>
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
        <div className="login-image-section" style={{ borderRadius: '0 24px 24px 0', minWidth: '340px', maxWidth: '480px', overflow: 'hidden', display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: '#fff', padding: 0 }}>
          <img src="/images/login.png" alt="Spa login" className="login-image" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '4px solid #fff', borderRadius: '0 24px 24px 0', objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
