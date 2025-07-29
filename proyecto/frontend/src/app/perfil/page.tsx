"use client";
import React from "react";
import Avatar from '@mui/material/Avatar';
import Navbar from '../components/Navbar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { deepPurple } from '@mui/material/colors';

const Perfil = () => {
  // Estado para usuario y si está cargando
  type Usuario = {
    nombre_cliente?: string;
    nombre_empleado?: string;
    email?: string;
    telefono?: string;
    correo_electronico?: string;
    fecha_nacimiento?: string;
    fecha_registro?: string;
    imagen_perfil?: string;
  };
  const [usuario, setUsuario] = React.useState<Usuario | null>(null);
  const [cargando, setCargando] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("usuario");
      if (userStr) {
        try {
          setUsuario(JSON.parse(userStr));
        } catch {
          setUsuario(null);
        }
      }
      setCargando(false);
    }
  }, []);

  if (cargando) {
    return null;
  }
  if (!usuario) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f7fafd' }}>
        <Card sx={{ minWidth: 340, maxWidth: 420, mx: 2, boxShadow: 4, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h5" align="center" sx={{ color: '#204d47', fontWeight: 900, mb: 2 }}>
              No has iniciado sesión
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: '#357a6c', fontWeight: 600 }}>
              Por favor inicia sesión para ver tu perfil.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card sx={{ minWidth: 370, maxWidth: 440, mx: 2, boxShadow: 6, borderRadius: 6, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f9fbfc' }}>
          <Avatar
            src={usuario.imagen_perfil || undefined}
            sx={{ bgcolor: deepPurple[500], width: 120, height: 120, fontSize: 48, mb: 2, boxShadow: '0 4px 16px rgba(31,38,135,0.13)', border: '4px solid #fff' }}
          >
            {!usuario.imagen_perfil && (
              ((usuario.nombre_cliente?.charAt(0) || usuario.nombre_empleado?.charAt(0) || usuario.email?.charAt(0) || 'U') as string).toUpperCase()
            )}
          </Avatar>
          <Typography variant="h4" align="center" sx={{ color: '#204d47', fontWeight: 800, mb: 2, letterSpacing: '0.04em', fontFamily: 'Montserrat, sans-serif', fontSize: '2.2rem' }}>
            Mi Perfil
          </Typography>
          <CardContent sx={{ width: '100%', pt: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#204d47', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', fontSize: '1.08rem', mb: 0.5 }}>
                  Nombre
                </Typography>
                <Typography variant="body1" sx={{ color: '#357a6c', fontWeight: 600, fontFamily: 'Montserrat, sans-serif', fontSize: '1.18rem', mb: 1 }}>
                  {usuario.nombre_cliente || usuario.nombre_empleado || usuario.email}
                </Typography>
              </Box>
              {usuario.telefono && (
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#204d47', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', fontSize: '1.08rem', mb: 0.5 }}>
                    Teléfono
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#357a6c', fontWeight: 600, fontFamily: 'Montserrat, sans-serif', fontSize: '1.13rem', mb: 1 }}>
                    {usuario.telefono}
                  </Typography>
                </Box>
              )}
              {usuario.correo_electronico && (
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#204d47', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', fontSize: '1.08rem', mb: 0.5 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#357a6c', fontWeight: 600, fontFamily: 'Montserrat, sans-serif', fontSize: '1.13rem', mb: 1 }}>
                    {usuario.correo_electronico}
                  </Typography>
                </Box>
              )}
              {/* Fecha de nacimiento: usar fecha_registro si no hay fecha_nacimiento */}
              {usuario.fecha_nacimiento || usuario.fecha_registro ? (
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#204d47', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', fontSize: '1.08rem', mb: 0.5 }}>
                    Fecha de nacimiento
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#357a6c', fontWeight: 600, fontFamily: 'Montserrat, sans-serif', fontSize: '1.13rem', mb: 1 }}>
                    {(usuario.fecha_nacimiento || usuario.fecha_registro)?.split('T')[0]}
                  </Typography>
                </Box>
              ) : null}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 4, justifyContent: 'center' }}>
              <button
                style={{
                  background: '#204d47',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '0.7rem 1.7rem',
                  fontWeight: 600,
                  fontSize: '1.08rem',
                  fontFamily: 'Montserrat, sans-serif',
                  boxShadow: '0 2px 8px 0 rgba(31,38,135,0.08)',
                  cursor: 'pointer',
                  letterSpacing: '0.03em',
                  transition: 'background 0.2s, transform 0.2s',
                }}
                onClick={() => window.location.href = '/citas/historial'}
              >
                Historial de citas
              </button>
              <button
                style={{
                  background: '#fff',
                  color: '#204d47',
                  border: '2px solid #204d47',
                  borderRadius: '100px',
                  padding: '0.7rem 1.7rem',
                  fontWeight: 600,
                  fontSize: '1.08rem',
                  fontFamily: 'Montserrat, sans-serif',
                  boxShadow: '0 2px 8px 0 rgba(31,38,135,0.08)',
                  cursor: 'pointer',
                  letterSpacing: '0.03em',
                  transition: 'background 0.2s, transform 0.2s',
                }}
                onClick={() => window.location.href = '/EditarPerfil'}
              >
                Editar perfil
              </button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default Perfil;
