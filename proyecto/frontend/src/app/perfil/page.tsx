
"use client";
import React from "react";
import { Box, Card, CardContent, Typography, Button, Avatar, TextField } from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import Navbar from "../components/Navbar";

const Perfil = () => {
  const [usuario, setUsuario] = React.useState<any | null>(null);
  const [cargando, setCargando] = React.useState(true);
  const [editando, setEditando] = React.useState(false);
  const [nombre, setNombre] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [fechaNacimiento, setFechaNacimiento] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const usuarioLocal = localStorage.getItem("usuario");
    if (usuarioLocal) {
      const user = JSON.parse(usuarioLocal);
      setUsuario(user);
      setNombre(user.nombre_cliente || user.nombre_empleado || "");
      setTelefono(user.telefono || "");
      setEmail(user.correo_electronico || user.email || "");
      setFechaNacimiento(user.fecha_nacimiento || user.fecha_registro?.split("T")[0] || "");
    }
    setCargando(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          telefono,
          email,
          fecha_nacimiento: fechaNacimiento,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Actualiza el usuario local y los estados con los datos enviados
        const usuarioActualizado = {
          ...usuario,
          nombre_cliente: nombre,
          nombre_empleado: usuario?.nombre_empleado ? nombre : undefined,
          telefono,
          correo_electronico: email,
          email,
          fecha_nacimiento: fechaNacimiento,
        };
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
        setUsuario(usuarioActualizado);
        setNombre(nombre);
        setTelefono(telefono);
        setEmail(email);
        setFechaNacimiento(fechaNacimiento);
        setEditando(false);
        alert("Cambios guardados correctamente");
      } else {
        setError(data.mensaje || "Error al guardar cambios");
      }
    } catch (err) {
      setError("Error de conexión");
    }
    setLoading(false);
  }
  if (!usuario) {
    return (
      <Box sx={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f7fafd" }}>
        <Card sx={{ minWidth: 340, maxWidth: 420, mx: 2, boxShadow: 4, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h5" align="center" sx={{ color: "#204d47", fontWeight: 900, mb: 2 }}>
              No has iniciado sesión
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: "#357a6c", fontWeight: 600 }}>
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
      <Box sx={{ minHeight: "100vh", bgcolor: "#f7fafd", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card sx={{ minWidth: 370, maxWidth: 440, mx: 2, boxShadow: 6, borderRadius: 6, p: 3, display: "flex", flexDirection: "column", alignItems: "center", background: "#f9fbfc" }}>
          <Avatar
            src={usuario.imagen_perfil || undefined}
            sx={{ bgcolor: deepPurple[500], width: 120, height: 120, fontSize: 48, mb: 2, boxShadow: "0 4px 16px rgba(31,38,135,0.13)", border: "4px solid #fff" }}
          >
            {!usuario.imagen_perfil && (
              ((usuario.nombre_cliente?.charAt(0) || usuario.nombre_empleado?.charAt(0) || usuario.email?.charAt(0) || "U") as string).toUpperCase()
            )}
          </Avatar>
          <Typography variant="h4" align="center" sx={{ color: "#204d47", fontWeight: 800, mb: 2, letterSpacing: "0.04em", fontFamily: "Montserrat, sans-serif", fontSize: "2.2rem" }}>
            Mi Perfil
          </Typography>
          <CardContent sx={{ width: "100%", pt: 0 }}>
            {editando ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.3rem", marginTop: "1.2rem" }}>
                <TextField
                  label="Nombre"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ style: { color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif" } }}
                  inputProps={{ style: { fontFamily: "Montserrat, sans-serif", fontWeight: 600 } }}
                />
                <TextField
                  label="Teléfono"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ style: { color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif" } }}
                  inputProps={{ style: { fontFamily: "Montserrat, sans-serif", fontWeight: 600 } }}
                />
                <TextField
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ style: { color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif" } }}
                  inputProps={{ style: { fontFamily: "Montserrat, sans-serif", fontWeight: 600 } }}
                />
                <TextField
                  label="Fecha de nacimiento"
                  type="date"
                  value={fechaNacimiento}
                  onChange={e => setFechaNacimiento(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true, style: { color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif" } }}
                  inputProps={{ style: { fontFamily: "Montserrat, sans-serif", fontWeight: 600 } }}
                />
                {error && <Typography sx={{ color: "red", fontWeight: 600, textAlign: "center", mb: 1 }}>{error}</Typography>}
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2, justifyContent: "center", mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ background: "#204d47", color: "#fff", borderRadius: "100px", fontWeight: 600, fontFamily: "Montserrat, sans-serif", fontSize: "1.08rem", boxShadow: "0 2px 8px 0 rgba(31,38,135,0.08)", letterSpacing: "0.03em", p: "0.7rem 1.7rem", '&:hover': { background: "#357a6c" } }}
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    sx={{ background: "#fff", color: "#204d47", border: "2px solid #204d47", borderRadius: "100px", fontWeight: 600, fontFamily: "Montserrat, sans-serif", fontSize: "1.08rem", boxShadow: "0 2px 8px 0 rgba(31,38,135,0.08)", letterSpacing: "0.03em", p: "0.7rem 1.7rem", '&:hover': { background: "#f7fafd" } }}
                    onClick={() => setEditando(false)}
                  >
                    Cancelar
                  </Button>
                </Box>
              </form>
            ) : (
              <>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                  <Typography variant="h6" sx={{ color: "#204d47", fontWeight: 700, mb: 1 }}>Nombre</Typography>
                  <Typography variant="body1" sx={{ color: "#357a6c", fontWeight: 600, mb: 2 }}>{usuario.nombre_cliente || usuario.nombre_empleado || usuario.email}</Typography>
                  <Typography variant="h6" sx={{ color: "#204d47", fontWeight: 700, mb: 1 }}>Teléfono</Typography>
                  <Typography variant="body1" sx={{ color: "#357a6c", fontWeight: 600, mb: 2 }}>{usuario.telefono}</Typography>
                  <Typography variant="h6" sx={{ color: "#204d47", fontWeight: 700, mb: 1 }}>Email</Typography>
                  <Typography variant="body1" sx={{ color: "#357a6c", fontWeight: 600, mb: 2 }}>{usuario.correo_electronico || usuario.email}</Typography>
                  <Typography variant="h6" sx={{ color: "#204d47", fontWeight: 700, mb: 1 }}>Fecha de nacimiento</Typography>
                  <Typography variant="body1" sx={{ color: "#357a6c", fontWeight: 600, mb: 2 }}>{usuario.fecha_nacimiento || usuario.fecha_registro?.split("T")[0]}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2, justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    sx={{ background: "#204d47", color: "#fff", borderRadius: "100px", fontWeight: 600, fontFamily: "Montserrat, sans-serif", fontSize: "1.08rem", boxShadow: "0 2px 8px 0 rgba(31,38,135,0.08)", letterSpacing: "0.03em", p: "0.7rem 1.7rem", '&:hover': { background: "#357a6c" } }}
                    onClick={() => setEditando(true)}
                  >
                    Editar perfil
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default Perfil;
