// components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#204d47'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f7fafd',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#204d47', marginBottom: '1rem' }}>
          Acceso Restringido
        </h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Debes iniciar sesión para acceder a esta página
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          style={{
            background: '#204d47',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Ir a Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
