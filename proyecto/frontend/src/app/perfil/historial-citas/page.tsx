"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Box, Card, CardContent, Typography, Divider } from "@mui/material";
import Navbar from "@/app/components/Navbar";
import { crearCita } from "@/servicios/citasService";

const HistorialCitas = () => {
  const router = useRouter();
  const [citas, setCitas] = React.useState<any[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [usuario, setUsuario] = React.useState<any | null>(null);

  React.useEffect(() => {
    const usuarioLocal = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");
    if (usuarioLocal && token) {
      const user = JSON.parse(usuarioLocal);
      setUsuario(user);
      fetchCitas(user.id_cliente, token);
    } else {
      setCargando(false);
      setError("No has iniciado sesión");
    }
  }, []);

  const fetchCitas = async (id_cliente: number, token: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/citas/cliente/${id_cliente}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setCitas(data);
      } else {
        setError(data.mensaje || "Error al cargar citas");
      }
    } catch (err) {
      setError("Error de conexión");
    }
    setCargando(false);
  };

  return (
    <>
      <Navbar usuario={usuario} />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f7fafd", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card sx={{ minWidth: 600, maxWidth: 900, width: "100%", mx: 2, boxShadow: "0 8px 32px rgba(31,38,135,0.13)", borderRadius: 24, p: 7, background: "#fff", border: "none" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography sx={{ color: "#204d47", fontWeight: 900, fontSize: "2.2rem", letterSpacing: "0.04em", fontFamily: "Montserrat, sans-serif", textAlign: "center" }}>
              Historial de citas
            </Typography>
            <button
              style={{
                background: "#357a6c",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontFamily: "Montserrat, sans-serif",
                fontSize: "1rem",
                padding: "0.6rem 1.5rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px 0 rgba(31,38,135,0.08)",
                marginLeft: "1rem"
              }}
              onClick={() => router.push("/perfil")}
            >
              Regresar
            </button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <CardContent>
            {cargando ? (
              <Typography sx={{ color: "#204d47", fontWeight: 600, fontSize: "1.2rem", textAlign: "center" }}>Cargando...</Typography>
            ) : error ? (
              <Typography sx={{ color: "red", fontWeight: 600, fontSize: "1.1rem", textAlign: "center" }}>{error}</Typography>
            ) : citas.length === 0 ? (
              <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.1rem", textAlign: "center" }}>No tienes citas registradas.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {citas.map((cita, idx) => (
                  <Card key={cita.id_cita || idx} sx={{ boxShadow: "0 2px 8px rgba(31,38,135,0.08)", borderRadius: 12, p: 3, background: "#e0f1ee" }}>
                    <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.15rem", mb: 1 }}>
                      Servicio: {cita.servicio_nombre || cita.id_servicio}
                    </Typography>
                    <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.08rem", mb: 1 }}>
                      Fecha: {cita.fecha_cita?.split("T")[0]} {cita.fecha_cita?.split("T")[1]?.slice(0,5)}
                    </Typography>
                    <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.08rem", mb: 1 }}>
                      Estado: {cita.estado_nombre || cita.id_estado_cita}
                    </Typography>
                    {cita.notas && (
                      <Typography sx={{ color: "#204d47", fontWeight: 400, fontSize: "1rem", mt: 1 }}>
                        Notas: {cita.notas}
                      </Typography>
                    )}
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default HistorialCitas;
