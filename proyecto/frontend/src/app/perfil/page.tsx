"use client";
import Navbar from "@/app/components/Navbar";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  TextField,
  Typography
} from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";
import { obtenerEspecialidades } from "../../servicios/especialidadService";
import { obtenerHorarios } from "../../servicios/horariosService";

const Perfil = () => {
  const router = useRouter();
  const [usuario, setUsuario] = React.useState<any | null>(null);
  const [cargando, setCargando] = React.useState(true);
  const [editando, setEditando] = React.useState(false);
  const [nombre, setNombre] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [fechaNacimiento, setFechaNacimiento] = React.useState("");
  const [especialidad, setEspecialidad] = React.useState(""); // id_especialidad
  const [nuevaEspecialidad, setNuevaEspecialidad] = React.useState("");
  const [horariosSeleccionados, setHorariosSeleccionados] = React.useState<string[]>([]); // ids de horarios
  const [especialidades, setEspecialidades] = React.useState<any[]>([]);
  const [horarios, setHorarios] = React.useState<any[]>([]);

  // Formatea un horario a string legible tipo "Lunes a viernes: 09:00 am - 06:00 pm"
  const formatHorario = (h: any) => {
    if (!h) return "Horario no disponible";
    // Si es objeto con día y horas
    if (typeof h === 'object') {
      const formatTime = (iso: string) => {
        if (!iso) return "";
        // Si es string ISO tipo '1970-01-01T09:00:00.000Z', extraer la hora y minutos manualmente
        if (iso.includes('T')) {
          // Extraer la parte de la hora
          const timePart = iso.split('T')[1];
          if (timePart) {
            const [hh, mm] = timePart.split(":");
            let hour = parseInt(hh, 10);
            const min = mm.padEnd(2, '0').substring(0,2);
            const ampm = hour >= 12 ? 'pm' : 'am';
            hour = hour % 12;
            if (hour === 0) hour = 12;
            return `${hour.toString().padStart(2, '0')}:${min} ${ampm}`;
          }
        }
        // Si es string tipo '09:00' o '09:00:00'
        try {
          const d = new Date(iso);
          if (isNaN(d.getTime())) {
            const [h, m] = iso.split(":");
            if (h && m) {
              let hour = parseInt(h, 10);
              const min = m.padEnd(2, '0').substring(0,2);
              const ampm = hour >= 12 ? 'pm' : 'am';
              hour = hour % 12;
              if (hour === 0) hour = 12;
              return `${hour.toString().padStart(2, '0')}:${min} ${ampm}`;
            }
            return iso;
          }
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace('.', '').toLowerCase();
        } catch {
          return iso;
        }
      };
      // Días especiales
      if (h.dia) {
        // Si está cerrado (ahora también si es 00:00 - 00:00)
        if (
          h.cerrado ||
          (!h.hora_inicio && !h.hora_fin) ||
          (h.hora_inicio === '00:00' && h.hora_fin === '00:00')
        ) {
          return `${h.dia}: Cerrado`;
        }
        if (h.hora_inicio && h.hora_fin) {
          return `${h.dia}: ${formatTime(h.hora_inicio)} - ${formatTime(h.hora_fin)}`;
        }
        return h.dia;
      }
      // Si es solo horas
      if (h.hora_inicio && h.hora_fin) {
        // Si es 00:00 - 00:00, mostrar "Cerrado"
        if (h.hora_inicio === '00:00' && h.hora_fin === '00:00') {
          return "Cerrado";
        }
        return `${formatTime(h.hora_inicio)} - ${formatTime(h.hora_fin)}`;
      }
      if (h.horario) return h.horario;
    }
    // Si es string tipo ISO con " - "
    if (typeof h === 'string' && h.includes('T') && h.includes(' - ')) {
      const [inicio, fin] = h.split(' - ');
      const format = (iso: string) => {
        try {
          const d = new Date(iso);
          if (isNaN(d.getTime())) {
            const [h, m] = iso.split(":");
            if (h && m) {
              let hour = parseInt(h, 10);
              const min = m.padEnd(2, '0').substring(0,2);
              const ampm = hour >= 12 ? 'pm' : 'am';
              hour = hour % 12;
              if (hour === 0) hour = 12;
              return `${hour.toString().padStart(2, '0')}:${min} ${ampm}`;
            }
            return iso;
          }
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace('.', '').toLowerCase();
        } catch {
          return iso;
        }
      };
      return `${format(inicio)} - ${format(fin)}`;
    }
    // Si es string simple
    if (typeof h === 'string' && h.length > 0) {
      // Si parece hora tipo "08:00:00" o "08:00"
      if (/^\d{2}:\d{2}/.test(h)) {
        const [hh, mm] = h.split(":");
        let hour = parseInt(hh, 10);
        const min = mm.padEnd(2, '0').substring(0,2);
        const ampm = hour >= 12 ? 'pm' : 'am';
        hour = hour % 12;
        if (hour === 0) hour = 12;
        return `${hour.toString().padStart(2, '0')}:${min} ${ampm}`;
      }
      return h;
    }
    return "Horario no disponible";
  };
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  // Función para cargar datos del perfil desde la base de datos
  const cargarPerfilDesdeBackend = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ No hay token disponible en localStorage");
        setUsuario(null);
        return;
      }

      console.log("🔄 Cargando perfil desde la base de datos...");
      console.log("🔑 Token encontrado:", token.substring(0, 20) + "...");
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log("🌐 API URL:", API_URL);
      
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Respuesta del servidor:", response.status, response.statusText);

      if (response.ok) {
        const datosUsuario = await response.json();
        console.log("✅ Datos del perfil desde la base de datos:", datosUsuario);
        console.log("🔍 Campos del usuario recibido:", Object.keys(datosUsuario));
        console.log("📊 Valores del usuario:");
        Object.entries(datosUsuario).forEach(([key, value]) => {
          console.log(`  ${key}:`, value);
        });
        
        // Actualizar localStorage con los datos más recientes
        localStorage.setItem("usuario", JSON.stringify(datosUsuario));
        setUsuario(datosUsuario);

        // Establecer los estados con los datos del backend
        if (datosUsuario.nombre_empleado) {
          console.log("👨‍💼 Configurando datos de empleado desde BD...");
          console.log("👨‍💼 nombre_empleado:", datosUsuario.nombre_empleado);
          console.log("👨‍💼 telefono:", datosUsuario.telefono);
          console.log("👨‍💼 email:", datosUsuario.email);
          console.log("👨‍💼 auth_email:", datosUsuario.auth_email);
          console.log("👨‍💼 especialidad:", datosUsuario.nombre_especialidad);
          console.log("👨‍💼 rol:", datosUsuario.rol);
          console.log("👨‍💼 fecha_registro:", datosUsuario.fecha_registro);
          console.log("👨‍💼 fecha_nacimiento:", datosUsuario.fecha_nacimiento);
          setNombre(datosUsuario.nombre_empleado || "");
          setTelefono(datosUsuario.telefono || "");
          setEmail(datosUsuario.email || datosUsuario.auth_email || "");
          setFechaNacimiento(datosUsuario.fecha_nacimiento ? datosUsuario.fecha_nacimiento.split("T")[0] : "");
          setEspecialidad(datosUsuario.id_especialidad ? String(datosUsuario.id_especialidad) : "");
          if (datosUsuario.id_horarios && Array.isArray(datosUsuario.id_horarios)) {
            setHorariosSeleccionados(datosUsuario.id_horarios.map((id: any) => String(id)));
          } else {
            setHorariosSeleccionados([]);
          }
        } else {
          console.log("👤 Configurando datos de cliente desde BD...");
          console.log("👤 nombre_cliente:", datosUsuario.nombre_cliente);
          console.log("👤 telefono:", datosUsuario.telefono);
          console.log("👤 correo_electronico:", datosUsuario.correo_electronico);
          console.log("👤 fecha_nacimiento:", datosUsuario.fecha_nacimiento);
          setNombre(datosUsuario.nombre_cliente || "");
          setTelefono(datosUsuario.telefono || "");
          setEmail(datosUsuario.correo_electronico || datosUsuario.email || "");
          setFechaNacimiento(datosUsuario.fecha_nacimiento ? datosUsuario.fecha_nacimiento.split("T")[0] : "");
        }
      } else if (response.status === 401) {
        console.log("🚫 Token inválido, limpiando datos locales...");
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
        // No redirigir automáticamente, solo limpiar el estado
      } else {
        console.error("❌ Error al cargar perfil desde BD:", response.status, response.statusText);
        const errorData = await response.text();
        console.error("📋 Detalles del error:", errorData);
        // Si hay error del servidor, mantener datos locales si existen
        const datosLocales = localStorage.getItem("usuario");
        if (datosLocales) {
          console.log("💾 Usando datos locales como respaldo...");
          setUsuario(JSON.parse(datosLocales));
        } else {
          setUsuario(null);
        }
      }
    } catch (error) {
      console.error("❌ Error de conexión al cargar perfil:", error);
      // Si hay error de conexión, intentar usar datos locales
      const datosLocales = localStorage.getItem("usuario");
      if (datosLocales) {
        console.log("💾 Usando datos locales debido a error de conexión...");
        setUsuario(JSON.parse(datosLocales));
      } else {
        setUsuario(null);
      }
    }
  };

  React.useEffect(() => {
    const cargarDatos = async () => {
      console.log("🚀 Iniciando carga de datos del perfil...");
      const token = localStorage.getItem("token");
      console.log("🔍 Token en localStorage:", !!token);
      
      if (token) {
        console.log("✅ Token encontrado, cargando desde backend...");
        // Cargar datos actualizados directamente desde la base de datos
        await cargarPerfilDesdeBackend();
      } else {
        console.log("❌ No hay token disponible");
        setUsuario(null);
      }

      // Cargar catálogos independientemente
      try {
        const especialidadesData = await obtenerEspecialidades();
        setEspecialidades(especialidadesData);
        console.log("📋 Especialidades cargadas:", especialidadesData.length);
      } catch (error) {
        console.error("❌ Error cargando especialidades:", error);
        setEspecialidades([]);
      }

      try {
        const horariosData = await obtenerHorarios();
        console.log("🕐 Horarios recibidos desde la API:", horariosData.length);
        setHorarios(horariosData);
      } catch (error) {
        console.error("❌ Error cargando horarios:", error);
        setHorarios([]);
      }
      
      // Solo cambiar el estado de carga después de completar todo
      console.log("✅ Finalizando carga de datos...");
      setCargando(false);
    };

    cargarDatos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let body;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      let endpoint = `${API_URL}/api/auth/update-profile`;
      let id_especialidad_final = especialidad;
      // Si es empleado y seleccionó nueva especialidad, crearla primero
      if (esEmpleado) {
        if (especialidad === "__nueva__") {
          if (!nuevaEspecialidad.trim()) {
            setError("Debes escribir el nombre de la nueva especialidad");
            setLoading(false);
            return;
          }
          // Crear especialidad en backend
          const resEsp = await fetch(`${API_URL}/api/especialidad`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nombre_especialidad: nuevaEspecialidad.trim() })
          });
          const dataEsp = await resEsp.json();
          if (!resEsp.ok || !dataEsp.id_especialidad) {
            setError(dataEsp.mensaje || "No se pudo crear la especialidad");
            setLoading(false);
            return;
          }
          // Actualizar catálogo y seleccionar la nueva especialidad
          await obtenerEspecialidades().then(setEspecialidades);
          id_especialidad_final = String(dataEsp.id_especialidad);
          setEspecialidad(id_especialidad_final);
        }
        // Enviar array de ids de horarios
        const ids_horarios = horariosSeleccionados.map(Number);
        body = JSON.stringify({ 
          nombre, 
          telefono, 
          email, 
          fecha_nacimiento: fechaNacimiento, 
          id_especialidad: Number(id_especialidad_final), 
          id_horarios: ids_horarios 
        });
        endpoint = `${API_URL}/api/auth/update-profile-empleado`;
      } else {
        body = JSON.stringify({ nombre, telefono, email, fecha_nacimiento: fechaNacimiento });
      }
      const res = await fetch(
        endpoint,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      );
      const data = await res.json();
      if (res.ok) {
        // Recargar los datos desde la base de datos para mostrar la información actualizada
        await cargarPerfilDesdeBackend();
        setEditando(false);
        setOpenSnackbar(true);
        setNuevaEspecialidad("");
      } else {
        setError(data.mensaje || "Error al guardar cambios");
      }
    } catch (err) {
      setError("Error de conexión");
    }
    setLoading(false);
  };

  if (cargando) {
    return (
      <Box className="perfil-container">
        <Card className="perfil-card">
          <CardContent>
            <Typography className="perfil-title" style={{ textAlign: "center" }}>Cargando perfil...</Typography>
            <Typography className="perfil-label" style={{ textAlign: "center" }}>
              Por favor espere mientras cargamos su información.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!usuario) {
    const tokenExists = !!localStorage.getItem("token");
    console.log("⚠️ Estado del usuario:", { 
      usuario: !!usuario, 
      cargando, 
      tokenExists,
      localStorage: Object.keys(localStorage).length 
    });
    
    return (
      <Box className="perfil-container">
        <Card className="perfil-card">
          <CardContent>
            <Typography className="perfil-title">
              {tokenExists ? "Error cargando perfil" : "No has iniciado sesión"}
            </Typography>
            <Typography className="perfil-label" style={{ textAlign: "center" }}>
              {tokenExists 
                ? "Hubo un problema al cargar tu perfil. Abre la consola del navegador (F12) para ver más detalles."
                : "Por favor inicia sesión para ver tu perfil."
              }
            </Typography>
            {tokenExists && (
              <Button
                variant="contained"
                sx={{ mt: 2, background: "#204d47", '&:hover': { background: "#357a6c" } }}
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  const esEmpleado = !!usuario?.nombre_empleado;
  console.log("🔍 Determinando tipo de usuario:");
  console.log("  usuario?.nombre_empleado:", usuario?.nombre_empleado);
  console.log("  usuario?.nombre_cliente:", usuario?.nombre_cliente);
  console.log("  esEmpleado:", esEmpleado);

  return (
    <>
      <Navbar usuario={usuario} />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f7fafd", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card sx={{ minWidth: 700, maxWidth: 1200, width: "100%", mx: 2, boxShadow: "0 12px 48px rgba(31,38,135,0.18)", borderRadius: 32, p: 0, background: "#fff", border: "none", overflow: "hidden" }}>
          <Box sx={{
            background: "linear-gradient(90deg, #204d47 60%, #357a6c 100%)",
            py: 7,
            px: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative"
          }}>
            <Avatar sx={{ bgcolor: '#fff', color: '#204d47', width: 180, height: 180, fontSize: 80, mb: 3, boxShadow: "0 6px 24px rgba(31,38,135,0.18)", border: "7px solid #e0f1ee" }}>
              {usuario.imagen_perfil ? (
                <img src={usuario.imagen_perfil} alt="Perfil" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              ) : (
                (usuario.nombre_empleado?.charAt(0) || usuario.nombre_cliente?.charAt(0) || "U").toUpperCase()
              )}
            </Avatar>
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "2.7rem", letterSpacing: "0.04em", fontFamily: "Montserrat, sans-serif", mb: 2, mt: 1, textAlign: "center" }}>
              {esEmpleado 
                ? `¡Bienvenido, ${usuario?.nombre_empleado || 'Usuario'}!` 
                : `¡Bienvenido, ${usuario?.nombre_cliente || usuario?.correo_electronico?.split('@')[0] || 'Usuario'}!`
              }
            </Typography>
            <Typography sx={{ color: "#e0f1ee", fontWeight: 500, fontSize: "1.25rem", fontFamily: "Montserrat, sans-serif", mb: 0, textAlign: "center" }}>
              {esEmpleado ? "Perfil de empleado" : "Tu perfil personal"}
            </Typography>
          </Box>
          <CardContent sx={{ width: "100%", pt: 0, px: 0, background: "#fff", display: "flex", flexDirection: "column", gap: 3, alignItems: "center", minHeight: 350, justifyContent: "center" }}>
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
                {esEmpleado ? (
                  <>
                    <Box sx={{ flex: "1 1 45%", minWidth: 220 }}>
                      <Typography sx={{ color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif", mb: 1 }}>Especialidad</Typography>
                    <select
                      value={especialidad}
                      onChange={e => {
                        setEspecialidad(e.target.value);
                        if (e.target.value !== "__nueva__") setNuevaEspecialidad("");
                      }}
                      style={{ width: '100%', padding: '12px', borderRadius: 6, border: '1px solid #204d47', fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#204d47', fontSize: '1rem' }}
                      required
                    >
                      <option value="">Selecciona una especialidad</option>
                      {especialidades.map((esp: any) => (
                        <option key={esp.id_especialidad} value={esp.id_especialidad}>
                          {esp.nombre_especialidad}
                        </option>
                      ))}
                      <option value="__nueva__">Agregar nueva especialidad</option>
                    </select>
                      {especialidad === "__nueva__" && (
                        <TextField
                          placeholder="Escribe la nueva especialidad"
                          value={nuevaEspecialidad}
                          onChange={e => setNuevaEspecialidad(e.target.value)}
                          fullWidth
                          variant="outlined"
                          sx={{ mt: 2 }}
                          InputLabelProps={{ style: { color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif" } }}
                          inputProps={{ style: { fontFamily: "Montserrat, sans-serif", fontWeight: 500, color: "#204d47" } }}
                          required
                        />
                      )}
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
                    <Box sx={{ flex: "1 1 45%", minWidth: 220 }}>
                      <Typography sx={{ color: "#204d47", fontWeight: 700, fontFamily: "Montserrat, sans-serif", mb: 1 }}>Horarios</Typography>
                      <select
                        multiple
                        value={horariosSeleccionados}
                        onChange={e => {
                          const options = Array.from(e.target.selectedOptions, option => option.value);
                          setHorariosSeleccionados(options);
                        }}
                        style={{ width: '100%', padding: '12px', borderRadius: 6, border: '1px solid #204d47', fontFamily: 'Montserrat, sans-serif', fontWeight: 500, color: '#204d47', fontSize: '1rem', minHeight: 120 }}
                        required
                      >
                        {/* Mostrar solo bloques por día, agrupando horarios */}
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => {
                          const horariosDia = horarios.filter((h: any) => h.dia === dia && h.hora_inicio && h.hora_fin && h.hora_inicio !== '00:00' && h.hora_fin !== '00:00');
                          if (horariosDia.length === 0) return null;
                          // Tomar el bloque más amplio por día
                          const minInicio = horariosDia.reduce((min, h) => h.hora_inicio < min ? h.hora_inicio : min, horariosDia[0].hora_inicio);
                          const maxFin = horariosDia.reduce((max, h) => h.hora_fin > max ? h.hora_fin : max, horariosDia[0].hora_fin);
                          const bloque = { id_horario: horariosDia[0].id_horario, dia, hora_inicio: minInicio, hora_fin: maxFin };
                          return (
                            <option key={bloque.dia} value={bloque.id_horario}>
                              {`${bloque.dia}: ${formatHorario(bloque)}`}
                            </option>
                          );
                        })}
                      </select>
                      <Typography sx={{ fontSize: '0.95rem', color: '#357a6c', mt: 1 }}>
                        Mantén presionada la tecla Ctrl (Windows) o Cmd (Mac) para seleccionar varios horarios.
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 3, background: "#fff", borderRadius: 18, boxShadow: "0 2px 12px rgba(31,38,135,0.07)", p: 5, fontFamily: "Montserrat, sans-serif", width: "95%", maxWidth: 900 }}>
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 6, mb: 2, justifyContent: "space-between" }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.35rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Nombre</Typography>
                      <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.22rem", fontFamily: "Montserrat, sans-serif" }}>
                        {usuario?.nombre_empleado || usuario?.nombre_cliente || "No especificado"}
                      </Typography>
                    </Box>
                    {esEmpleado ? (
                      <>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.35rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Email</Typography>
                          <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.22rem", fontFamily: "Montserrat, sans-serif" }}>
                            {usuario?.email || usuario?.auth_email || "No especificado"}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.35rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Teléfono</Typography>
                          <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.22rem", fontFamily: "Montserrat, sans-serif" }}>
                            {usuario?.telefono || "No especificado"}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.35rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Email</Typography>
                          <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.22rem", fontFamily: "Montserrat, sans-serif" }}>
                            {usuario?.correo_electronico || usuario?.email || "No especificado"}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.35rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Teléfono</Typography>
                          <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.22rem", fontFamily: "Montserrat, sans-serif" }}>
                            {usuario?.telefono || "No especificado"}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                  {esEmpleado && (
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 6, mb: 2, justifyContent: "space-between" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.35rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Especialidad</Typography>
                        <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.22rem", fontFamily: "Montserrat, sans-serif" }}>
                          {usuario?.especialidad || usuario?.nombre_especialidad || "No especificado"}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.35rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Fecha de registro</Typography>
                        <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.22rem", fontFamily: "Montserrat, sans-serif" }}>
                          {usuario?.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : 
                           usuario?.fecha_nacimiento ? new Date(usuario.fecha_nacimiento).toLocaleDateString() : "No especificado"}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.35rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Rol</Typography>
                        <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.22rem", fontFamily: "Montserrat, sans-serif" }}>
                          {usuario?.rol || "No especificado"}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {esEmpleado && (
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 6, mb: 2, justifyContent: "flex-start" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.35rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Horarios</Typography>
                        {Array.isArray(usuario?.horarios) && usuario.horarios.length > 0 ? (
                          usuario.horarios.map((bloque: any, idx: number) => (
                            <Typography key={bloque.dia + idx} sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.13rem", fontFamily: "Montserrat, sans-serif" }}>
                              {formatHorario(bloque)}
                            </Typography>
                          ))
                        ) : (
                          <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.13rem", fontFamily: "Montserrat, sans-serif" }}>
                            No hay horarios asignados
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                  {!esEmpleado && (
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 6, mb: 2, justifyContent: "space-between" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#204d47", fontWeight: 700, fontSize: "1.35rem", fontFamily: "Montserrat, sans-serif", mb: 1 }}>Fecha de nacimiento</Typography>
                        <Typography sx={{ color: "#357a6c", fontWeight: 500, fontSize: "1.22rem", fontFamily: "Montserrat, sans-serif" }}>
                          {usuario?.fecha_nacimiento ? new Date(usuario.fecha_nacimiento).toLocaleDateString() : "No especificado"}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 5, justifyContent: "center", width: "100%", mt: 1 }}>
                  <Button
                    variant="contained"
                    sx={{ background: "#204d47", color: "#fff", borderRadius: "14px", fontWeight: 700, fontFamily: "Montserrat, sans-serif", fontSize: "1.25rem", boxShadow: "0 2px 8px 0 rgba(31,38,135,0.10)", letterSpacing: "0.03em", px: 6, py: 2.5, '&:hover': { background: "#357a6c" } }}
                    onClick={() => setEditando(true)}
                  >
                    Editar perfil
                  </Button>
                  {!esEmpleado && (
                    <Button
                      variant="outlined"
                      sx={{ background: "#fff", color: "#357a6c", border: "2px solid #357a6c", borderRadius: "14px", fontWeight: 700, fontFamily: "Montserrat, sans-serif", fontSize: "1.25rem", boxShadow: "0 2px 8px 0 rgba(31,38,135,0.10)", letterSpacing: "0.03em", px: 6, py: 2.5, '&:hover': { background: "#e0f1ee" } }}
                      onClick={() => router.push("/perfil/historial-citas")}
                    >
                      Historial de citas
                    </Button>
                  )}
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
