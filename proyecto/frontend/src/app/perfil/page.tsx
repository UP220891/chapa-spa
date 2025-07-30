"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  TextField,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import Navbar from "../components/Navbar";

const Perfil = () => {
  const router = useRouter();
  const [usuario, setUsuario] = React.useState<any | null>(null);
  const [cargando, setCargando] = React.useState(true);
  const [editando, setEditando] = React.useState(false);
  const [nombre, setNombre] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [fechaNacimiento, setFechaNacimiento] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  React.useEffect(() => {
    const usuarioLocal = localStorage.getItem("usuario");
    if (usuarioLocal) {
      const user = JSON.parse(usuarioLocal);
      setUsuario(user);
      setNombre(user.nombre_cliente || user.nombre_empleado || "");
      setTelefono(user.telefono || "");
      setEmail(user.correo_electronico || user.email || "");
      setFechaNacimiento(
        user.fecha_nacimiento || user.fecha_registro?.split("T")[0] || ""
      );
    }
    setCargando(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-profile`,
        {
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
        }
      );
      const data = await res.json();
      if (res.ok) {
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
        setEditando(false);
        setOpenSnackbar(true);
      } else {
        setError(data.mensaje || "Error al guardar cambios");
      }
    } catch (err) {
      setError("Error de conexión");
    }
    setLoading(false);
  };

  if (!usuario) {
    return (
      <Box className="perfil-container">
        <Card className="perfil-card">
          <CardContent>
            <Typography className="perfil-title">No has iniciado sesión</Typography>
            <Typography className="perfil-label" style={{ textAlign: "center" }}>
              Por favor inicia sesión para ver tu perfil.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <>
      <Navbar usuario={usuario} />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f7fafd", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card sx={{ minWidth: 600, maxWidth: 1000, width: "100%", mx: 2, boxShadow: "0 8px 32px rgba(31,38,135,0.13)", borderRadius: 24, p: 7, display: "flex", flexDirection: "column", alignItems: "center", background: "#f7fafd", border: "none" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
            <Avatar sx={{ bgcolor: '#204d47', width: 130, height: 130, fontSize: 54, mb: 2, boxShadow: "0 4px 16px rgba(31,38,135,0.13)", border: "5px solid #e0f1ee" }}>
              {usuario.imagen_perfil ? (
                <img src={usuario.imagen_perfil} alt="Perfil" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              ) : (
                (usuario.nombre_cliente?.charAt(0) || usuario.nombre_empleado?.charAt(0) || "U").toUpperCase()
              )}
            </Avatar>
            <Typography sx={{ color: "#204d47", fontWeight: 900, fontSize: "2.6rem", letterSpacing: "0.04em", fontFamily: "Montserrat, sans-serif", mb: 3, mt: 1, textAlign: "center" }}>
              Mi Perfil
            </Typography>
          </Box>
          <CardContent sx={{ width: "100%", pt: 0, px: 0 }}>
            {editando ? (
              <form onSubmit={handleSubmit} style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "1.5rem",
                marginTop: "1.2rem",
                maxWidth: 600,
                marginLeft: "auto",
                marginRight: "auto",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(31,38,135,0.07)",
                padding: "2rem 2.5rem",
                fontFamily: "Montserrat, sans-serif"
              }}>
                <Box sx={{ flex: "1 1 45%", minWidth: 220 }}>
                  <Typography sx={{ color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif", mb: 1 }}>Nombre</Typography>
                  <TextField
                    placeholder="Ingresar Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ style: { color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif" } }}
                    inputProps={{ style: { fontFamily: "Montserrat, sans-serif", fontWeight: 500, color: "#204d47" } }}
                  />
                </Box>
                <Box sx={{ flex: "1 1 45%", minWidth: 220 }}>
                  <Typography sx={{ color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif", mb: 1 }}>Email</Typography>
                  <TextField
                    placeholder="Ingresar Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ style: { color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif" } }}
                    inputProps={{ style: { fontFamily: "Montserrat, sans-serif", fontWeight: 500, color: "#204d47" } }}
                  />
                </Box>
                <Box sx={{ flex: "1 1 45%", minWidth: 220 }}>
                  <Typography sx={{ color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif", mb: 1 }}>Teléfono</Typography>
                  <TextField
                    placeholder="Ingresar Teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ style: { color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif" } }}
                    inputProps={{ style: { fontFamily: "Montserrat, sans-serif", fontWeight: 500, color: "#204d47" } }}
                  />
                </Box>
                <Box sx={{ flex: "1 1 45%", minWidth: 220 }}>
                  <Typography sx={{ color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif", mb: 1 }}>Fecha de nacimiento</Typography>
                  <TextField
                    placeholder="dd/mm/aaaa"
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true, style: { color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif" } }}
                    inputProps={{ style: { fontFamily: "Montserrat, sans-serif", fontWeight: 500, color: "#204d47" } }}
                  />
                </Box>
                {error && (
                  <Typography sx={{ color: "red", fontWeight: 600, textAlign: "center", mb: 1 }}>{error}</Typography>
                )}
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2, justifyContent: "flex-start", width: "100%", mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ background: "#204d47", color: "#fff", borderRadius: "10px", fontWeight: 700, fontFamily: "Montserrat, sans-serif", fontSize: "1.1rem", boxShadow: "0 2px 8px 0 rgba(31,38,135,0.08)", letterSpacing: "0.03em", px: 4, py: 1.5, '&:hover': { background: "#357a6c" } }}
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    sx={{ background: "#fff", color: "#204d47", border: "2px solid #204d47", borderRadius: "10px", fontWeight: 700, fontFamily: "Montserrat, sans-serif", fontSize: "1.1rem", boxShadow: "0 2px 8px 0 rgba(31,38,135,0.08)", letterSpacing: "0.03em", px: 4, py: 1.5, '&:hover': { background: "#f7fafd" } }}
                    onClick={() => setEditando(false)}
                  >
                    Cancelar
                  </Button>
                </Box>
              </form>
            ) : (
              <>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3, background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px rgba(31,38,135,0.07)", p: 4, fontFamily: "Montserrat, sans-serif" }}>
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 3, mb: 2 }}>
                    <Box sx={{ flex: "1 1 45%", minWidth: 220 }}>
                      <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.1rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Nombre</Typography>
                      <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.08rem", fontFamily: "Montserrat, sans-serif" }}>{usuario.nombre_cliente || usuario.nombre_empleado || usuario.email}</Typography>
                    </Box>
                    <Box sx={{ flex: "1 1 45%", minWidth: 220 }}>
                      <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.1rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Email</Typography>
                      <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.08rem", fontFamily: "Montserrat, sans-serif" }}>{usuario.correo_electronico || usuario.email}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 3, mb: 2 }}>
                    <Box sx={{ flex: "1 1 45%", minWidth: 220 }}>
                      <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.1rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Teléfono</Typography>
                      <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.08rem", fontFamily: "Montserrat, sans-serif" }}>{usuario.telefono}</Typography>
                    </Box>
                    <Box sx={{ flex: "1 1 45%", minWidth: 220 }}>
                      <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.1rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Fecha de nacimiento</Typography>
                      <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.08rem", fontFamily: "Montserrat, sans-serif" }}>{usuario.fecha_nacimiento || usuario.fecha_registro?.split("T")[0]}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2, justifyContent: "flex-start", width: "100%", mt: 2 }}>
                  <Button
                    variant="contained"
                    sx={{ background: "#204d47", color: "#fff", borderRadius: "10px", fontWeight: 700, fontFamily: "Montserrat, sans-serif", fontSize: "1.1rem", boxShadow: "0 2px 8px 0 rgba(31,38,135,0.08)", letterSpacing: "0.03em", px: 4, py: 1.5, '&:hover': { background: "#357a6c" } }}
                    onClick={() => setEditando(true)}
                  >
                    Editar perfil
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ background: "#fff", color: "#357a6c", border: "2px solid #357a6c", borderRadius: "10px", fontWeight: 700, fontFamily: "Montserrat, sans-serif", fontSize: "1.1rem", boxShadow: "0 2px 8px 0 rgba(31,38,135,0.08)", letterSpacing: "0.03em", px: 4, py: 1.5, '&:hover': { background: "#e0f1ee" } }}
                    onClick={() => router.push("/perfil/historial-citas")}
                  >
                    Historial de citas
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: "100%", fontFamily: "'Playfair Display', serif" }}>
          Cambios guardados correctamente
        </Alert>
      </Snackbar>
    </>
  );
};

export default Perfil;
