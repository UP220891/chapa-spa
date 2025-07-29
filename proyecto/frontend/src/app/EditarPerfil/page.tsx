"use client";
import React from "react";
import Avatar from '@mui/material/Avatar';
import Navbar from '../components/Navbar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { deepPurple } from '@mui/material/colors';

const EditarPerfil = () => {
  type Usuario = {
    nombre_cliente?: string;
    nombre_empleado?: string;
    email?: string;
    telefono?: string;
    correo_electronico?: string;
    fecha_nacimiento?: string;
    imagen_perfil?: string;
    fecha_registro?: string;
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

  // Estados para edición
  const [nombre, setNombre] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [fechaNacimiento, setFechaNacimiento] = React.useState("");

  React.useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre_cliente || usuario.nombre_empleado || "");
      setTelefono(usuario.telefono || "");
      setEmail(usuario.correo_electronico || usuario.email || "");
      setFechaNacimiento(usuario.fecha_nacimiento || usuario.fecha_registro?.split('T')[0] || "");
    }
  }, [usuario]);

  // Escuchar cambios en localStorage para actualizar el perfil en tiempo real
  React.useEffect(() => {
    const handleStorage = () => {
      const userStr = localStorage.getItem("usuario");
      if (userStr) {
        setUsuario(JSON.parse(userStr));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre,
          telefono,
          email,
          fecha_nacimiento: fechaNacimiento
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Actualizar usuario en localStorage y en el estado local
        try {
          // Obtener perfil actualizado del backend
          const token = localStorage.getItem('token');
          const perfilRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/perfil`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const perfilData = await perfilRes.json();
          if (perfilRes.ok && perfilData.usuario) {
            localStorage.setItem('usuario', JSON.stringify(perfilData.usuario));
            setUsuario(perfilData.usuario); // Actualiza el estado local inmediatamente
          }
        } catch {}
        alert('Cambios guardados correctamente');
        // Si quieres evitar recargar, puedes quitar la siguiente línea:
        window.location.href = '/perfil';
      } else {
        setError(data.mensaje || 'Error al guardar cambios');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  if (cargando) return null;
  if (!usuario) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f7fafd' }}>
        <Card sx={{ minWidth: 340, maxWidth: 420, mx: 2, boxShadow: 4, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h5" align="center" sx={{ color: '#204d47', fontWeight: 900, mb: 2 }}>
              No has iniciado sesión
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: '#357a6c', fontWeight: 600 }}>
              Por favor inicia sesión para editar tu perfil.
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
            Editar perfil
          </Typography>
          <CardContent sx={{ width: '100%', pt: 0 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem', marginTop: '1.2rem' }}>
              <TextField
                label="Nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                fullWidth
                variant="outlined"
                InputLabelProps={{ style: { color: '#204d47', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' } }}
                inputProps={{ style: { fontFamily: 'Montserrat, sans-serif', fontWeight: 600 } }}
              />
              <TextField
                label="Teléfono"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                fullWidth
                variant="outlined"
                InputLabelProps={{ style: { color: '#204d47', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' } }}
                inputProps={{ style: { fontFamily: 'Montserrat, sans-serif', fontWeight: 600 } }}
              />
              <TextField
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                variant="outlined"
                InputLabelProps={{ style: { color: '#204d47', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' } }}
                inputProps={{ style: { fontFamily: 'Montserrat, sans-serif', fontWeight: 600 } }}
              />
              <TextField
                label="Fecha de nacimiento"
                type="date"
                value={fechaNacimiento}
                onChange={e => setFechaNacimiento(e.target.value)}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true, style: { color: '#204d47', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' } }}
                inputProps={{ style: { fontFamily: 'Montserrat, sans-serif', fontWeight: 600 } }}
              />
              {error && <Typography sx={{ color: 'red', fontWeight: 600, textAlign: 'center', mb: 1 }}>{error}</Typography>}
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background: '#204d47',
                    color: '#fff',
                    borderRadius: '100px',
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '1.08rem',
                    boxShadow: '0 2px 8px 0 rgba(31,38,135,0.08)',
                    letterSpacing: '0.03em',
                    p: '0.7rem 1.7rem',
                    '&:hover': { background: '#357a6c' }
                  }}
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  sx={{
                    background: '#fff',
                    color: '#204d47',
                    border: '2px solid #204d47',
                    borderRadius: '100px',
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '1.08rem',
                    boxShadow: '0 2px 8px 0 rgba(31,38,135,0.08)',
                    letterSpacing: '0.03em',
                    p: '0.7rem 1.7rem',
                    '&:hover': { background: '#f7fafd' }
                  }}
                  onClick={() => window.location.href = '/perfil'}
                >
                  Cancelar
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default EditarPerfil;
