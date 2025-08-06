"use client";
import "../styles/notification.css";

import React from "react";
import jsPDF from "jspdf";

import { CitaForm, crearCita } from "@/servicios/citasService";

interface CitasFormProps {
  usuario?: any;
}

const CitasForm: React.FC<CitasFormProps> = ({ usuario: usuarioProp }) => {
  const [servicios, setServicios] = React.useState<any[]>([]);
  const [nombreServicio, setNombreServicio] = React.useState<string>("");
  const [servicioInicial, setServicioInicial] = React.useState<string>("");
  // Solo una vez:
  // Solo una vez:
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  let servicioParam = searchParams?.get("servicio") || "";
  if (servicioParam === "undefined" || !["masaje", "facial", "manicure"].includes(servicioParam)) {
    servicioParam = "";
  }

  React.useEffect(() => {
    // Cargar servicios y buscar el nombre si hay servicioParam
    async function cargarServicios() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/servicios`);
        const data = await res.json();
        setServicios(data);
        if (servicioParam) {
          // Buscar por nombre (case-insensitive)
          const servicioEncontrado = data.find((s: any) =>
            (s.nombre_servicio || s.nombre || "").toLowerCase() === decodeURIComponent(servicioParam).toLowerCase()
          );
          if (servicioEncontrado) {
            setServicioInicial(servicioEncontrado.nombre_servicio || servicioEncontrado.nombre);
            setNombreServicio(servicioEncontrado.nombre_servicio || servicioEncontrado.nombre);
          } else {
            setServicioInicial("");
            setNombreServicio("");
          }
        }
      } catch {}
    }
    cargarServicios();
  }, [servicioParam]);
  // (Eliminado: segunda declaración de searchParams y servicioParam)
  const [usuario, setUsuario] = React.useState<any>(null);
  const [bloqueado, setBloqueado] = React.useState(true);
  // Convierte el id de servicio recibido en la URL a un valor válido del tipo Servicio
  // Normaliza el parámetro a minúsculas y lo valida
  // Ya no se usa la declaración previa, solo el estado servicioInicial
  const [form, setForm] = React.useState<CitaForm>({
    nombre: "",
    email: "",
    numero: "",
    fecha: "",
    id_horario: "",
    hora: "",
    servicio: "",
    notas: ""
  });

  // Autocompleta nombre, email, número y servicio si hay usuario y parámetro de servicio
  // Autocompletar el campo servicio si hay servicioInicial
  React.useEffect(() => {
    if (servicioInicial) {
      setForm(prev => ({
        ...prev,
        servicio: servicioInicial as any // acepta cualquier string
      }));
    }
  }, [servicioInicial]);

  React.useEffect(() => {
    let user = usuarioProp; // Usar el usuario del prop primero
    
    if (!user && typeof window !== "undefined") {
      const usuarioLocal = localStorage.getItem("usuario");
      if (usuarioLocal) {
        try {
          user = JSON.parse(usuarioLocal);
        } catch {
          user = null;
        }
      }
    }
    
    if (user) {
      setUsuario(user);
      setBloqueado(false);
      
      // Autocompletar datos del usuario en el formulario
      console.log('Todos los campos del usuario:', Object.keys(user));
      console.log('Valores del usuario:', user);
      setForm(prev => ({
        ...prev,
        nombre: user.nombre || user.nombre_cliente || "",
        email: user.email || user.correo_electronico || "",
        numero: user.telefono || user.numero || user.phone || ""
      }));
    } else {
      setUsuario(null);
      setBloqueado(true);
    }
  }, [usuarioProp]);

  // Obtener horarios reales desde el backend
  const [horarios, setHorarios] = React.useState<any[]>([]);
  const [citasExistentes, setCitasExistentes] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    async function cargarHorarios() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/horarios`);
        const data = await res.json();
        setHorarios(data);
        console.log('Horarios recibidos del backend:', data);
      } catch {}
    }
    cargarHorarios();
  }, []);

  // Cargar citas existentes para validar disponibilidad
  React.useEffect(() => {
    async function cargarCitas() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/citas`);
        const data = await res.json();
        // Asegurar que data sea un array
        setCitasExistentes(Array.isArray(data) ? data : []);
        console.log('Citas existentes:', data);
      } catch (error) {
        console.error('Error al cargar citas:', error);
        setCitasExistentes([]); // Establecer array vacío en caso de error
      }
    }
    cargarCitas();
  }, []);

  // Verificar si una fecha y hora específica está disponible
  const verificarDisponibilidad = (fecha: string, hora: string): boolean => {
    if (!fecha || !hora) return false;
    
    // Asegurar que citasExistentes sea un array
    if (!Array.isArray(citasExistentes)) return true;
    
    // Buscar si ya existe una cita para esa fecha y hora
    const citaExistente = citasExistentes.find(cita => {
      const fechaCita = new Date(cita.fecha).toISOString().split('T')[0];
      const horaCita = cita.hora;
      return fechaCita === fecha && horaCita === hora;
    });
    
    return !citaExistente; // Retorna true si NO existe una cita (está disponible)
  };

  // Verificar si una fecha es válida (no en el pasado)
  const esFechaValida = (fecha: string): boolean => {
    if (!fecha) return false;
    
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear las horas para comparar solo fechas
    
    return fechaSeleccionada >= hoy;
  };

  // Obtener horas ocupadas para una fecha específica
  const getHorasOcupadas = (fecha: string): string[] => {
    if (!fecha) return [];
    
    // Asegurar que citasExistentes sea un array
    if (!Array.isArray(citasExistentes)) return [];
    
    return citasExistentes
      .filter(cita => {
        const fechaCita = new Date(cita.fecha).toISOString().split('T')[0];
        return fechaCita === fecha;
      })
      .map(cita => cita.hora);
  };

  // Filtrar horarios por día seleccionado
  const getHora = (str: string) => {
    // Si el string ya es tipo '1970-01-01T14:00:00.000Z', extrae solo la hora
    if (typeof str === 'string' && str.includes('T')) {
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        // Usar UTC para evitar problemas de zona horaria
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      return str.slice(11, 16); // Fallback: 'HH:MM'
    }
    // Si es tipo '09:00', regresa tal cual
    if (typeof str === 'string' && str.length === 5) {
      return str;
    }
    // Fallback: usar Date
    const date = new Date(str);
    if (isNaN(date.getTime())) return '';
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Generar las horas disponibles basado en los horarios reales (incluir hora inicio y fin)
  const generarHorasDeHorarios = (horariosDelDia: any[]) => {
    const horas: string[] = [];
    horariosDelDia.forEach(horario => {
      const inicio = getHora(horario.hora_inicio);
      const fin = getHora(horario.hora_fin);
      
      if (inicio) {
        // Agregar la hora de inicio
        if (!horas.includes(inicio)) {
          horas.push(inicio);
        }
      }
      
      if (fin && fin !== inicio) {
        // Agregar la hora de fin si es diferente al inicio
        if (!horas.includes(fin)) {
          horas.push(fin);
        }
      }
    });
    
    return horas.sort();
  };

  // Filtrar horarios por día seleccionado y generar opciones de hora
  const getHorasDisponibles = () => {
    if (!form.fecha || !horarios.length) return [];
    
    // Verificar si la fecha es válida (no en el pasado)
    if (!esFechaValida(form.fecha)) return [];
    
    const [year, month, day] = form.fecha.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const diaActual = diasSemana[fecha.getDay()];
    
    // Obtener todos los horarios para el día seleccionado
    const horariosDelDia = horarios.filter(h => h.dia === diaActual);
    
    if (horariosDelDia.length === 0) {
      console.log(`No hay horarios para ${diaActual}`);
      return [];
    }
    
    console.log(`Horarios encontrados para ${diaActual}:`, horariosDelDia);
    
    // Generar horas basadas en los horarios reales del backend
    const horasGeneradas = generarHorasDeHorarios(horariosDelDia);
    
    // Obtener horas ya ocupadas para la fecha seleccionada
    const horasOcupadas = getHorasOcupadas(form.fecha);
    console.log(`Horas ocupadas para ${form.fecha}:`, horasOcupadas);
    
    // Filtrar horas disponibles (excluir las ocupadas)
    const horasDisponibles = horasGeneradas.filter(hora => !horasOcupadas.includes(hora));
    console.log(`Horas disponibles:`, horasDisponibles);
    
    return horasDisponibles;
  };
  const [notification, setNotification] = React.useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showNotification, setShowNotification] = React.useState(false);
  React.useEffect(() => {
    if (notification) {
      setShowNotification(true);
      if (notification.type === 'success') {
        const timer = setTimeout(() => {
          setShowNotification(false);
          setNotification(null);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [notification]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [mensaje, setMensaje] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [fieldErrors, setFieldErrors] = React.useState({
    nombre: false,
    email: false,
    numero: false,
    fecha: false,
    hora: false,
    servicio: false
  });

  // Función para generar PDF de la cita
  const generarPDFCita = (datosReserva: any) => {
    const doc = new jsPDF();
    
    // HEADER CON DEGRADADO SIMULADO
    // Fondo principal del header
    doc.setFillColor(32, 77, 71); // #204d47
    doc.rect(0, 0, 210, 50, 'F');
    
    // Borde decorativo superior
    doc.setFillColor(53, 122, 108); // #357a6c
    doc.rect(0, 0, 210, 8, 'F');
    
    // Elementos decorativos laterales
    doc.setFillColor(224, 241, 238); // #e0f1ee
    doc.circle(15, 25, 12, 'F');
    doc.circle(195, 25, 12, 'F');
    
    // TÍTULO PRINCIPAL
    doc.setTextColor(255, 255, 255); // Blanco
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("CONFIRMACIÓN DE CITA", 105, 20, { align: "center" });
    
    // Subtítulo elegante
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Centro de Bienestar y Spa", 105, 30, { align: "center" });
    
    // Línea decorativa dorada
    doc.setDrawColor(255, 215, 0); // Dorado
    doc.setLineWidth(1);
    doc.line(40, 38, 170, 38);
    
    // SECCIÓN CLIENTE CON FONDO
    // Fondo suave para la sección
    doc.setFillColor(248, 252, 251); // Muy suave
    doc.rect(15, 60, 180, 35, 'F');
    
    // Borde izquierdo de color
    doc.setFillColor(53, 122, 108); // #357a6c
    doc.rect(15, 60, 4, 35, 'F');
    
    // Título de sección
    doc.setTextColor(32, 77, 71); // #204d47
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL CLIENTE", 25, 72);
    
    // Datos del cliente con formato más limpio
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Negro
    
    // Usar viñetas simples en lugar de círculos
    doc.setFillColor(53, 122, 108); // #357a6c
    doc.rect(25, 81, 2, 2, 'F');
    doc.rect(25, 86, 2, 2, 'F');
    doc.rect(25, 91, 2, 2, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.text("NOMBRE:", 30, 84);
    doc.setFont("helvetica", "normal");
    doc.text(datosReserva.nombre, 65, 84);
    
    doc.setFont("helvetica", "bold");
    doc.text("EMAIL:", 30, 89);
    doc.setFont("helvetica", "normal");
    doc.text(datosReserva.email, 60, 89);
    
    doc.setFont("helvetica", "bold");
    doc.text("TELEFONO:", 30, 94);
    doc.setFont("helvetica", "normal");
    doc.text(datosReserva.numero, 75, 94);
    
    // SECCIÓN DETALLES DE LA CITA
    doc.setFillColor(248, 252, 251);
    doc.rect(15, 105, 180, 45, 'F');
    
    doc.setFillColor(53, 122, 108);
    doc.rect(15, 105, 4, 45, 'F');
    
    doc.setTextColor(32, 77, 71);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DE LA CITA", 25, 117);
    
    // Datos de la cita con mejor formato
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    
    // Viñetas simples
    doc.setFillColor(53, 122, 108); // #357a6c
    doc.rect(25, 127, 2, 2, 'F');
    doc.rect(25, 135, 2, 2, 'F');
    doc.rect(25, 143, 2, 2, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.text("SERVICIO:", 30, 130);
    doc.setFont("helvetica", "normal");
    doc.text(datosReserva.servicio, 80, 130);
    
    doc.setFont("helvetica", "bold");
    doc.text("FECHA:", 30, 138);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(datosReserva.fecha).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), 65, 138);
    
    doc.setFont("helvetica", "bold");
    doc.text("HORA:", 30, 146);
    doc.setFont("helvetica", "normal");
    doc.text(datosReserva.hora, 60, 146);
    
    if (datosReserva.notas) {
      doc.setFillColor(53, 122, 108); // #357a6c
      doc.rect(25, 151, 2, 2, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("NOTAS:", 30, 154);
      doc.setFont("helvetica", "normal");
      doc.text(datosReserva.notas, 65, 154);
    }
    
    // INFORMACIÓN DEL SPA CON ESTILO
    doc.setFillColor(32, 77, 71); // #204d47
    doc.rect(15, 165, 180, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DEL SPA", 105, 177, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(224, 241, 238); // #e0f1ee
    
    // Información del spa con formato más limpio
    doc.setFont("helvetica", "bold");
    doc.text("DIRECCION:", 25, 187);
    doc.setFont("helvetica", "normal");
    doc.text(" Edificio Torre Plaza Bosques\nAguascalientes, Ags. 20342", 25, 194);
    
    doc.setFont("helvetica", "bold");
    doc.text("TELEFONO:", 25, 201);
    doc.setFont("helvetica", "normal");
    doc.text("+52 (449) 123-4567", 25, 208);
    
    doc.setFont("helvetica", "bold");
    doc.text("EMAIL:", 110, 201);
    doc.setFont("helvetica", "normal");
    doc.text("contacto@chapaspa.com", 110, 208);
    
    // FOOTER ELEGANTE
    // Línea decorativa
    doc.setDrawColor(53, 122, 108); // #357a6c
    doc.setLineWidth(2);
    doc.line(15, 225, 195, 225);
    
    // Política de cancelación con mejor diseño
    doc.setTextColor(32, 77, 71); // #204d47
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("POLÍTICA DE CANCELACIÓN", 105, 235, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80); // Gris oscuro
    doc.text("Por favor, cancele su cita con al menos 24 horas de anticipación.", 105, 243, { align: "center" });
    doc.text("Agradecemos su preferencia y esperamos brindarle una experiencia excepcional.", 105, 250, { align: "center" });
    
    // Elemento decorativo final
    doc.setFillColor(224, 241, 238); // #e0f1ee
    doc.rect(90, 257, 30, 3, 'F');
    
    // Fecha de generación elegante
    doc.setTextColor(120, 120, 120); // Gris medio
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`Documento generado el ${new Date().toLocaleString('es-ES')}`, 105, 270, { align: "center" });
    
    // Código de confirmación simulado
    const codigoConfirmacion = `CHA-${Date.now().toString().slice(-6)}`;
    doc.setTextColor(53, 122, 108); // #357a6c
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Código de confirmación: ${codigoConfirmacion}`, 105, 280, { align: "center" });
    
    // Guardar el PDF con nombre más descriptivo
    const fechaFormateada = datosReserva.fecha.replace(/-/g, '');
    const nombreLimpio = datosReserva.nombre.replace(/\s+/g, '_').toLowerCase();
    const fileName = `ChapaSpa_Cita_${nombreLimpio}_${fechaFormateada}.pdf`;
    doc.save(fileName);
  };

  // Función para validar campos en tiempo real
  const validateField = (fieldName: string, value: any) => {
    let isValid = true;
    
    switch (fieldName) {
      case 'nombre':
        isValid = value && value.trim().length > 0;
        break;
      case 'email':
        isValid = value && value.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        break;
      case 'numero':
        isValid = value && value.trim().length > 0 && /^[\d\s\-\+\(\)]+$/.test(value.trim());
        break;
      case 'fecha':
        if (value) {
          isValid = esFechaValida(value);
        } else {
          isValid = false;
        }
        break;
      case 'hora':
        if (value && form.fecha) {
          isValid = value !== '' && value !== '00:00' && verificarDisponibilidad(form.fecha, value);
        } else {
          isValid = value && value !== '' && value !== '00:00';
        }
        break;
      case 'servicio':
        isValid = value && value.trim().length > 0;
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: !isValid
    }));
    
    return isValid;
  };

  // Función para validar todos los campos
  const validateAllFields = () => {
    const errors = {
      nombre: !form.nombre?.trim(),
      email: !form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
      numero: !form.numero?.trim() || !/^[\d\s\-\+\(\)]+$/.test(form.numero.trim()),
      fecha: !form.fecha || !esFechaValida(form.fecha),
      hora: !form.hora || form.hora === '' || form.hora === '00:00' || !verificarDisponibilidad(form.fecha, form.hora),
      servicio: !form.servicio?.trim()
    };
    
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const fieldName = e.target.id;
    const value = e.target.value;
    
    // Si el campo es hora, buscar el id_horario que corresponde a la hora seleccionada y el día
    if (fieldName === "hora") {
      let idHorario = "";
      if (form.fecha && value) {
        const [year, month, day] = form.fecha.split('-').map(Number);
        const fecha = new Date(year, month - 1, day);
        const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        const diaActual = diasSemana[fecha.getDay()];
        
        // Buscar el horario que tenga esta hora (ya sea como inicio o fin) para este día
        const horarioDelDia = horarios.find(h => {
          if (h.dia !== diaActual) return false;
          
          const horaInicio = getHora(h.hora_inicio);
          const horaFin = getHora(h.hora_fin);
          return horaInicio === value || horaFin === value;
        });
        
        if (horarioDelDia) {
          idHorario = String(horarioDelDia.id_horario);
        }
        
        // Verificar disponibilidad antes de establecer la hora
        if (!verificarDisponibilidad(form.fecha, value)) {
          setNotification({ 
            type: 'error', 
            message: `La hora ${value} ya está ocupada para la fecha seleccionada. Por favor elige otra hora.` 
          });
          return;
        }
      }
      setForm({
        ...form,
        hora: value,
        id_horario: idHorario
      });
      validateField('hora', value);
    } else if (fieldName === "fecha") {
      // Si cambia la fecha, resetear la hora y el id_horario, y validar la nueva fecha
      if (!esFechaValida(value)) {
        setNotification({ 
          type: 'error', 
          message: 'No puedes seleccionar una fecha en el pasado.' 
        });
      }
      setForm({ ...form, fecha: value, hora: "", id_horario: "" });
      validateField('fecha', value);
      // También revalidar la hora si ya tenía una seleccionada
      if (form.hora) {
        validateField('hora', '');
      }
    } else {
      setForm({ ...form, [fieldName]: value });
      validateField(fieldName, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    if (!validateAllFields()) {
      setNotification({ type: 'error', message: 'Por favor completa todos los campos correctamente' });
      return;
    }
    
    // Validación adicional de disponibilidad en tiempo real
    if (!verificarDisponibilidad(form.fecha, form.hora)) {
      setNotification({ 
        type: 'error', 
        message: `La hora ${form.hora} del ${form.fecha} ya no está disponible. Por favor selecciona otro horario.` 
      });
      return;
    }
    
    // Validar que la fecha no sea en el pasado
    if (!esFechaValida(form.fecha)) {
      setNotification({ 
        type: 'error', 
        message: 'No puedes hacer una cita en el pasado. Por favor selecciona una fecha válida.' 
      });
      return;
    }
    
    setLoading(true);
    setMensaje("");
    setError("");
    try {
      // Buscar el id_servicio correspondiente al nombre seleccionado
      const servicioSeleccionado = servicios.find((s: any) => (s.nombre_servicio || s.nombre) === form.servicio);
      const id_servicio = Number(servicioSeleccionado?.id_servicio || servicioSeleccionado?.id);
      if (!id_servicio) throw new Error("No se encontró el servicio seleccionado");

      // Obtener id_cliente del usuario
      const id_cliente = usuario?.id || usuario?.id_cliente || usuario?.idCliente || usuario?.clienteId;
      if (!id_cliente) {
        console.error('Campos disponibles en usuario:', Object.keys(usuario || {}));
        throw new Error(`No se encontró el ID del cliente. Campos disponibles: ${Object.keys(usuario || {}).join(', ')}`);
      }

      // Asignar id_empleado por defecto (puedes cambiar la lógica si tienes selección de empleado)
      const id_empleado = 1; // Por defecto, o puedes obtenerlo de la base de datos o del usuario

      // Adaptar fecha y hora
      const fecha = form.fecha;
      const id_horario = form.id_horario ? Number(form.id_horario) : null;
      // Validar que la hora seleccionada sea válida y no vacía ni '00:00'
      let hora = form.hora;
      if (!hora || hora === '00:00') {
        throw new Error('Debes seleccionar una hora válida para la cita');
      }

      // Opcionales
      const notas = form.notas || "";
      // Buscar el costo del servicio seleccionado
      let costo_total = 0;
      if (servicioSeleccionado && (servicioSeleccionado.precio || servicioSeleccionado.costo)) {
        costo_total = Number(servicioSeleccionado.precio || servicioSeleccionado.costo);
      }
      const id_estado_cita = 1; // Estado inicial, puedes cambiarlo

      // Crear el objeto que espera el backend
      const citaPayload = {
        id_cliente,
        id_servicio,
        id_empleado,
        fecha,
        hora,
        id_horario,
        notas,
        costo_total,
        id_estado_cita
      };

      await crearCita(citaPayload);
      
      // Recargar citas existentes para actualizar disponibilidad
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/api/citas`);
        const data = await res.json();
        // Asegurar que data sea un array
        setCitasExistentes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al recargar citas:', error);
        setCitasExistentes([]); // Establecer array vacío en caso de error
      }
      
      // Generar PDF con los datos de la reserva
      const datosReserva = {
        nombre: form.nombre,
        email: form.email,
        numero: form.numero,
        fecha: form.fecha,
        hora: form.hora,
        servicio: form.servicio,
        notas: form.notas
      };
      generarPDFCita(datosReserva);
      
      setNotification({ type: 'success', message: '¡Cita reservada exitosamente! Se ha descargado el PDF de confirmación.' });
      setForm({ nombre: "", email: "", numero: "", fecha: "", id_horario: "", hora: "", servicio: "", notas: "" });
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || "Error al reservar la cita" });
    }
    setLoading(false);
  };

  return (
    <div className="register-container" style={{ position: 'relative' }}>
      {/* Botón regresar a servicios arriba y centrado */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:'0.8rem', marginTop:'0.3rem' }}>
        <button
          type="button"
          style={{
            background:'#204d47',
            color:'#fff',
            border:'none',
            borderRadius:'6px',
            padding:'0.4rem 1rem 0.4rem 1.3rem',
            fontWeight:600,
            fontSize:'0.9rem',
            boxShadow:'0 2px 8px rgba(32,77,71,0.10)',
            position:'relative',
            transition:'background 0.2s',
            cursor:'pointer',
            marginLeft:0,
            marginTop:0,
            marginBottom:0,
          }}
          onMouseOver={e => (e.currentTarget.style.background='#357a6c')}
          onMouseOut={e => (e.currentTarget.style.background='#204d47')}
          onClick={() => { window.location.href = '/servicio'; }}
        >
          <span style={{ position:'absolute', left:'0.8rem', top:'50%', transform:'translateY(-50%)', fontSize:'1.1em' }}>←</span>
          <span style={{ marginLeft:'0.6rem' }}>Regresar a servicios</span>
        </button>
      </div>
      <div className="register-card">
        {(notification && typeof notification.type === 'string' && typeof notification.message === 'string') && (
          <div
            className={`notification-popup ${notification.type} ${showNotification ? 'show' : 'hide'}`}
            style={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
          >
            <span className="notification-icon">
              {notification.type === 'error' ? '⚠️' : '✅'}
            </span>
            {notification.message}
            <button
              className="notification-close"
              onClick={() => {
                setShowNotification(false);
                setTimeout(() => setNotification(null), 400);
              }}
              aria-label="Cerrar notificación"
            >
              &times;
            </button>
          </div>
        )}
        <div className="register-image-section">
          <img src="/images/cita.png" alt="Cita" className="register-image" />
        </div>
        <div className="register-form-section">
          <div className="register-header">
            <h1 className="register-heading">Reservación de cita</h1>
          </div>
          {nombreServicio && (
            <div style={{textAlign:'center',marginBottom:'0.8rem',fontWeight:600,color:'#204d47',fontSize:'0.9rem'}}>
              Servicio seleccionado: {nombreServicio}
            </div>
          )}
          {bloqueado && (
            <div style={{ color: 'red', fontWeight: 600, textAlign: 'center', marginBottom: '0.8rem', fontSize:'0.9rem' }}>
              Debes iniciar sesión para reservar una cita.
            </div>
          )}
          <form className="register-form" onSubmit={handleSubmit}>
            {/* Primera fila: Nombres, Apellidos, Email */}
            <div className="register-row">
              <div className="register-col">
                <label htmlFor="nombre" className="register-label">Nombres</label>
                <input 
                  type="text" 
                  id="nombre" 
                  placeholder="Ingresar Nombres" 
                  className="register-input" 
                  required 
                  style={{ 
                    color: '#204d47',
                    borderColor: fieldErrors.nombre ? '#e53e3e' : undefined,
                    backgroundColor: fieldErrors.nombre ? '#fed7d7' : undefined
                  }} 
                  value={form.nombre} 
                  onChange={handleChange}
                  onBlur={e => validateField('nombre', e.target.value)}
                />
                {fieldErrors.nombre && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                    El nombre es obligatorio
                  </span>
                )}
              </div>
              {/* Eliminar campo apellidos */}
              <div className="register-col">
                <label htmlFor="email" className="register-label">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Ingresar Email" 
                  className="register-input" 
                  required 
                  style={{ 
                    color: '#204d47',
                    borderColor: fieldErrors.email ? '#e53e3e' : undefined,
                    backgroundColor: fieldErrors.email ? '#fed7d7' : undefined
                  }} 
                  value={form.email} 
                  onChange={handleChange}
                  onBlur={e => validateField('email', e.target.value)}
                />
                {fieldErrors.email && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                    Ingresa un email válido
                  </span>
                )}
              </div>
            </div>
            {/* Segunda fila: Número, Fecha, Hora (sin campo Horario) */}
            <div className="register-row">
              <div className="register-col">
                <label htmlFor="numero" className="register-label">Número</label>
                <input 
                  type="tel" 
                  id="numero" 
                  placeholder="Ingresar Número" 
                  className="register-input" 
                  required 
                  style={{ 
                    color: '#204d47',
                    borderColor: fieldErrors.numero ? '#e53e3e' : undefined,
                    backgroundColor: fieldErrors.numero ? '#fed7d7' : undefined
                  }} 
                  value={form.numero} 
                  onChange={handleChange}
                  onBlur={e => validateField('numero', e.target.value)}
                />
                {fieldErrors.numero && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                    Ingresa un número válido
                  </span>
                )}
              </div>
              <div className="register-col">
                <label htmlFor="fecha" className="register-label">Fecha</label>
                <input 
                  type="date" 
                  id="fecha" 
                  className="register-input" 
                  required 
                  style={{ 
                    color: '#204d47',
                    borderColor: fieldErrors.fecha ? '#e53e3e' : undefined,
                    backgroundColor: fieldErrors.fecha ? '#fed7d7' : undefined
                  }} 
                  value={form.fecha} 
                  onChange={handleChange}
                  onBlur={e => validateField('fecha', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {fieldErrors.fecha && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                    Selecciona una fecha válida
                  </span>
                )}
              </div>
              <div className="register-col">
                <label htmlFor="id_horario" className="register-label">Horario</label>
                {!form.fecha ? (
                  <div style={{ color: '#666', fontStyle: 'italic', marginTop: 8 }}>
                    Primero selecciona una fecha
                  </div>
                ) : !esFechaValida(form.fecha) ? (
                  <div style={{ color: 'red', fontWeight: 500, marginTop: 8 }}>
                    La fecha seleccionada no es válida
                  </div>
                ) : getHorasDisponibles().length === 0 ? (
                  <div style={{ color: 'red', fontWeight: 500, marginTop: 8 }}>
                    {horarios.filter(h => {
                      const [year, month, day] = form.fecha.split('-').map(Number);
                      const fecha = new Date(year, month - 1, day);
                      const diasSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
                      const diaActual = diasSemana[fecha.getDay()];
                      return h.dia === diaActual;
                    }).length === 0 
                      ? 'No trabajamos este día de la semana'
                      : 'Todos los horarios están ocupados para este día'
                    }
                  </div>
                ) : (
                  <>
                    <select 
                      id="hora" 
                      className="register-input" 
                      required 
                      style={{ 
                        color: '#204d47',
                        borderColor: fieldErrors.hora ? '#e53e3e' : undefined,
                        backgroundColor: fieldErrors.hora ? '#fed7d7' : undefined
                      }} 
                      value={form.hora || ""} 
                      onChange={handleChange}
                      onBlur={e => validateField('hora', e.target.value)}
                      disabled={!form.fecha || getHorasDisponibles().length === 0}
                    >
                      <option value="">Selecciona hora</option>
                      {getHorasDisponibles().map((hora) => (
                        <option key={hora} value={hora}>{hora}</option>
                      ))}
                    </select>
                    {fieldErrors.hora && (
                      <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                        {form.hora && !verificarDisponibilidad(form.fecha, form.hora) 
                          ? 'Esta hora ya está ocupada'
                          : 'Selecciona una hora'
                        }
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* Tercera fila: Servicio */}
            <div className="register-row">
              <div className="register-col" style={{ flex: 2 }}>
                <label htmlFor="servicio" className="register-label">Servicio</label>
                <select
                  id="servicio"
                  className="register-input"
                  required
                  style={{ 
                    color: '#204d47', 
                    background: !!servicioInicial ? '#e0f1ee' : undefined,
                    borderColor: fieldErrors.servicio ? '#e53e3e' : undefined,
                    backgroundColor: fieldErrors.servicio ? '#fed7d7' : (!!servicioInicial ? '#e0f1ee' : undefined)
                  }}
                  value={form.servicio}
                  onChange={handleChange}
                  onBlur={e => validateField('servicio', e.target.value)}
                  disabled={!!servicioInicial}
                >
                  <option value="">Servicio</option>
                  {servicios.map((s: any) => (
                    <option key={s.id_servicio || s.id} value={s.nombre_servicio || s.nombre}>
                      {s.nombre_servicio || s.nombre}
                    </option>
                  ))}
                </select>
                {servicioInicial && (
                  <div style={{ color: '#357a6c', fontWeight: 500, marginTop: 6 }}>
                    Servicio seleccionado automáticamente: <b>{servicioInicial}</b>
                  </div>
                )}
                {fieldErrors.servicio && !servicioInicial && (
                  <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                    Selecciona un servicio
                  </span>
                )}
              </div>
              <div className="register-col"></div>
              <div className="register-col"></div>
            </div>
            {/* Cuarta fila: Notas */}
            <div className="register-row">
              <div className="register-col" style={{ flex: 3 }}>
                <label htmlFor="notas" className="register-label" style={{fontSize:'0.9rem'}}>Notas</label>
                <textarea id="notas" placeholder="Notas adicionales" className="register-input" style={{ resize: 'vertical', minHeight: '60px', maxHeight: '120px', color: '#204d47', fontSize:'0.9rem', padding:'0.5rem' }} value={form.notas} onChange={handleChange} />
              </div>
            </div>
            {/* Botón */}
            <div className="register-row" style={{ justifyContent: 'center', marginTop: '1rem' }}>
              <button
                type="submit"
                className="register-button"
                disabled={loading || Object.values(fieldErrors).some(error => error)}
                style={{
                  opacity: loading || Object.values(fieldErrors).some(error => error) ? 0.6 : 1,
                  cursor: loading || Object.values(fieldErrors).some(error => error) ? 'not-allowed' : 'pointer',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem'
                }}
              >
                {loading ? "Reservando..." : "Reservar cita"}
              </button>
            </div>
            {mensaje && <div style={{ color: '#204d47', fontWeight: 600, textAlign: 'center', marginTop: '0.8rem', fontSize:'0.9rem' }}>{mensaje}</div>}
            {error && <div style={{ color: 'red', fontWeight: 600, textAlign: 'center', marginTop: '0.8rem', fontSize:'0.9rem' }}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );    
};

export default CitasForm;
