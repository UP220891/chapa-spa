"use client";

import { useEffect, useState } from 'react';
import Navbar from '../app/components/Navbar';
import { getClientes, type Cliente } from '../servicios/clientesService';
import { getCitas, crearCita, editarCita, cancelarCita } from '../servicios/citasService';
import { getServicios, type Servicio } from '../servicios/serviciosService';
import '../styles/admin-calendar.css';
// Formatear hora tipo ISO a HH:mm
function formatHora(hora: string) {
  if (!hora) return '';
  try {
    const date = new Date(hora);
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  } catch {
    return hora;
  }
}


interface Cita {
  id: number;
  cliente: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
  telefono: string;
  notas?: string;
  costo: number;
  id_horario: number;
}

const AdminCalendar = () => {
  const [showClientForm, setShowClientForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const handleNewAppointment = () => setShowAppointmentForm(true);
  const handleNewClient = () => setShowClientForm(true);
  const handleNewEmployee = () => setShowEmployeeForm(true);
  // Utilidades para el calendario
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: new Date(year, month, i - startingDayOfWeek + 1), isCurrentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    const totalDays = days.length;
    for (let i = 1; totalDays + i <= 42; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') newDate.setMonth(prev.getMonth() - 1);
      else newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const getCitasForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return citas.filter(cita => {
      if (!cita.fecha) return false;
      let citaFechaSolo = cita.fecha.trim().toLowerCase();
      // Si la fecha es ISO, tomar solo los primeros 10 caracteres
      if (citaFechaSolo.length >= 10 && citaFechaSolo[4] === '-') {
        citaFechaSolo = citaFechaSolo.substring(0, 10);
      } else {
        citaFechaSolo = citaFechaSolo.split(' ')[0];
      }
      const diaComparar = dateString.trim().toLowerCase();
      return citaFechaSolo === diaComparar;
    });
  };
  const [horarios, setHorarios] = useState<{ id_horario: number; hora_inicio: string; hora_fin: string; dia: string }[]>([]);
  const [errorHorarios, setErrorHorarios] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editAppointment, setEditAppointment] = useState<Cita | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);

  const [newAppointment, setNewAppointment] = useState<any>({
    cliente: '',
    telefono: '',
    email: '',
    servicio: '',
    hora: '',
    notas: ''
  });

  // Nuevo estado para mostrar el modal de cita del día
  const [showDayCitasModal, setShowDayCitasModal] = useState(false);
  const [citasDelDia, setCitasDelDia] = useState<Cita[]>([]);

  // Obtener las horas disponibles para el día seleccionado desde la base de datos
  let horasDisponibles: { id_horario: number; hora_inicio: string; hora_fin: string; dia: string }[] = [];
  if (selectedDate) {
    const dayNamesDB = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaSemana = dayNamesDB[selectedDate.getDay()];
    // Filtrar horarios por día
    const horariosDelDia = horarios.filter(h => h.dia === diaSemana);
    // Si es domingo, no mostrar nada
    if (diaSemana === 'Domingo') {
      horasDisponibles = [];
      return;
    }
    // Obtener las horas ocupadas en ese día
    const fechaStr = selectedDate.toISOString().split('T')[0];
    const horasOcupadas = citas
      .filter(cita => cita.fecha === fechaStr)
      .map(cita => cita.hora);
    // Filtrar horarios que no estén ocupados
    horasDisponibles = horariosDelDia.filter(horario => {
      // Convertir hora_inicio a formato 'HH:mm:ss' para comparar
      const inicio = new Date(`${fechaStr}T${horario.hora_inicio}`);
      const hh = inicio.getHours().toString().padStart(2, '0');
      const mm = inicio.getMinutes().toString().padStart(2, '0');
      const ss = inicio.getSeconds().toString().padStart(2, '0');
      const horaComparar = `${hh}:${mm}:${ss}`;
      return !horasOcupadas.includes(horaComparar);
    });
  }

  const handleCloseAppointmentForm = () => setShowAppointmentForm(false);

  const handleClienteDropdownChange = (id: string) => {
    const cliente = clientes.find(c => c.id_cliente.toString() === id);
    if (cliente) {
      setSelectedCliente(cliente);
      setNewAppointment({
        ...newAppointment,
        cliente: `${cliente.nombre_cliente} ${cliente.apellido_cliente}`,
        telefono: cliente.telefono || '',
        email: cliente.correo_electronico || ''
      });
    }
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar campos mínimos
    if (!newAppointment.cliente || !newAppointment.servicio || !newAppointment.hora || !newAppointment.telefono) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    try {
      // Buscar el cliente y servicio seleccionados
      const clienteObj = clientes.find(c => `${c.nombre_cliente} ${c.apellido_cliente}` === newAppointment.cliente);
      const servicioObj = servicios.find(s => s.nombre === newAppointment.servicio);
      if (!clienteObj || !servicioObj) {
        alert('Selecciona cliente y servicio válidos.');
        return;
      }
      // Buscar el horario seleccionado por id_horario
      const horarioObj = horasDisponibles.find(h => h.id_horario.toString() === newAppointment.hora);
      if (!horarioObj) {
        alert('Selecciona una hora válida.');
        return;
      }
      // Construir el objeto para la API
      // Formatear hora_inicio a 'HH:mm:ss' (sin fecha ni milisegundos)
      const horaSQL = (() => {
        let h = '';
        if (horarioObj.hora_inicio.includes('T')) {
          h = horarioObj.hora_inicio.split('T')[1].substring(0,8);
        } else {
          h = horarioObj.hora_inicio.substring(0,8);
        }
        return h;
      })();
      const citaNueva = {
        fecha: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        hora: horaSQL,
        id_cliente: clienteObj.id_cliente,
        id_servicio: servicioObj.id,
        id_empleado: 1, // Si tienes lógica de empleados, ajusta aquí
        // Formatear fecha_cita como 'YYYY-MM-DD HH:mm:ss' usando la fecha y hora del horario seleccionado
        fecha_cita: (() => {
          const fecha = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
          const hora = horaSQL;
          const fechaCita = `${fecha} ${hora}`;
          console.log('Fecha enviada a backend:', fechaCita);
          return fechaCita;
        })(),
        notas: newAppointment.notas,
        costo_total: servicioObj.precio ?? 0,
        id_estado_cita: 1, // 1 = pendiente (ajusta según tu base de datos)
        id_horario: horarioObj.id_horario
      };
      console.log('Objeto enviado a backend:', citaNueva);
      await crearCita(citaNueva);
      // Recargar citas
      const citasActualizadas = await getCitas();
      setCitas(citasActualizadas.map(mapearCita));
      // Limpiar formulario y cerrar modal
      setNewAppointment({ cliente: '', telefono: '', email: '', servicio: '', hora: '', notas: '' });
      setShowAppointmentForm(false);
    } catch (error) {
      alert('Error al guardar la cita.');
    }
  };

  const mapearCita = (c: any): Cita => {
    // Buscar la propiedad correcta para la fecha y el costo
    const fecha = c.fecha || c.fecha_cita || c.fecha_cita_inicio || c.fecha_inicio || '';
    const costo = c.costo ?? c.costo_total ?? 0;
    // Estado: usar c.estado o c.estado_cita o c.nombre_estado_cita
    const estado = c.estado ?? c.estado_cita ?? c.nombre_estado_cita ?? '';
    // Formatear la hora a HH:mm
    let horaFormateada = '';
    if (c.hora) {
      // Si viene como '00:00', mostrar '00:00'
      if (/^\d{2}:\d{2}$/.test(c.hora)) {
        horaFormateada = c.hora;
      } else if (/^\d{2}:\d{2}:\d{2}$/.test(c.hora)) {
        horaFormateada = c.hora.substring(0,5);
      } else if (c.hora.includes('T')) {
        // Si viene como ISO, extraer HH:mm
        const partes = c.hora.split('T')[1];
        horaFormateada = partes ? partes.substring(0,5) : '';
      } else {
        // Intentar parsear como Date
        try {
          const date = new Date(c.hora);
          const horas = date.getHours().toString().padStart(2, '0');
          const minutos = date.getMinutes().toString().padStart(2, '0');
          horaFormateada = `${horas}:${minutos}`;
        } catch {
          horaFormateada = c.hora;
        }
      }
    }
    return {
      id: c.id_cita,
      cliente: c.nombre_cliente,
      servicio: c.nombre_servicio,
      fecha: fecha,
      hora: horaFormateada,
      estado: estado,
      telefono: c.telefono,
      notas: c.notas,
      costo: costo,
      id_horario: c.id_horario // Agregado para mostrar hora real en el modal
    };
  };

  useEffect(() => {
    async function cargarHorarios() {
      try {
        const { obtenerHorarios } = await import('../servicios/horariosService');
        const horariosData = await obtenerHorarios();
        setHorarios(horariosData);
      } catch (error: any) {
        setErrorHorarios(error?.message || 'Error al cargar horarios');
      }
    }
    cargarHorarios();
  }, []);

  // Cargar clientes y servicios al abrir el formulario de cita
  useEffect(() => {
    async function cargarClientesYServicios() {
      try {
        const clientesData = await getClientes();
        setClientes(clientesData);
      } catch {}
      try {
        const serviciosData = await getServicios();
        // Mapear servicios si vienen con nombres distintos
        const serviciosMapeados = serviciosData.map((servicio: any) => ({
          id: servicio.id_servicio ?? servicio.id,
          nombre: servicio.nombre_servicio ?? servicio.nombre,
          descripcion: servicio.descripcion,
          duracion: servicio.duracion,
          precio: servicio.precio,
          imagen: servicio.imagen
        }));
        setServicios(serviciosMapeados);
      } catch {}
    }
    if (showAppointmentForm) {
      cargarClientesYServicios();
    }
  }, [showAppointmentForm]);

  // Al hacer click en un día, mostrar el modal con las citas de ese día
  const handleDayClick = async (date: Date) => {
    if (!date) return;
    setSelectedDate(date);
    // Recargar citas antes de mostrar el modal
    const citasActualizadas = await getCitas();
    const citasMapeadas = citasActualizadas.map(mapearCita);
    setCitas(citasMapeadas);
    const citasDia = getCitasForDate(date);
    console.log('Citas en el estado:', citasMapeadas);
    console.log('Fecha seleccionada:', date.toISOString().split('T')[0]);
    setCitasDelDia(citasDia);
    setShowDayCitasModal(true);
  };

  return (
    <>
      <Navbar />
      <div className="admin-calendar-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0' }}>
          <div>
            <button className="btn-new-appointment" style={{ background: '#4f46e5', color: 'white', borderRadius: '8px', padding: '0.8rem 2rem', border: 'none', fontWeight: 700, fontSize: '1.1rem', marginRight: '12px' }} onClick={handleNewAppointment}>
              + Nueva Cita
            </button>
            <button className="btn-new-employee" style={{ background: '#357a6c', color: 'white', borderRadius: '8px', padding: '0.8rem 2rem', border: 'none', fontWeight: 700, fontSize: '1.1rem', marginRight: '12px' }} onClick={handleNewEmployee}>
              + Nuevo Empleado
            </button>
            <button className="btn-new-client" style={{ background: '#204d47', color: 'white', borderRadius: '8px', padding: '0.8rem 2rem', border: 'none', fontWeight: 700, fontSize: '1.1rem' }} onClick={handleNewClient}>
              + Nuevo Cliente
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="nav-btn" 
              onClick={() => navigateMonth('prev')}
              style={{
                background: '#fff',
                border: '2px solid #204d47',
                color: '#204d47',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                fontSize: '2rem',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
                marginRight: '8px'
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#204d47'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#204d47'; }}
            >
              &#8249;
            </button>
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#204d47', letterSpacing: '0.04em', fontFamily: 'Montserrat, sans-serif' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button 
              className="nav-btn" 
              onClick={() => navigateMonth('next')}
              style={{
                background: '#fff',
                border: '2px solid #204d47',
                color: '#204d47',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                fontSize: '2rem',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
                marginLeft: '8px'
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#204d47'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#204d47'; }}
            >
              &#8250;
            </button>
          </div>
        </div>
        <div className="calendar-grid">
          <div className="calendar-days-header" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
            {dayNames.map(day => (
              <div key={day} className="day-header">{day}</div>
            ))}
          </div>
          <div className="calendar-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((day, index) => {
              const citasForDay = getCitasForDate(day.date);
              const isToday = day.date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => day.isCurrentMonth && handleDayClick(day.date)}
                  style={{ background: day.isCurrentMonth ? '#e0f1ee' : '#f7fafd', border: isToday ? '2px solid #357a6c' : '1px solid #e0e0e0', borderRadius: '10px', minHeight: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', cursor: day.isCurrentMonth ? 'pointer' : 'default', position: 'relative' }}
                >
                  <span className="day-number" style={{ fontWeight: 700, color: '#204d47', fontSize: '1.1rem', marginTop: '6px' }}>{day.date.getDate()}</span>
                  {citasForDay.length > 0 && (
                    <div className="appointments-indicator" style={{ position: 'absolute', top: '6px', right: '8px', background: '#357a6c', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
                      <span className="appointments-count">{citasForDay.length}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Modal para nueva cita */}
      {showAppointmentForm && (
        <div className="modal-overlay" onClick={handleCloseAppointmentForm}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#ffffffff', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>
                Nueva cita para el día {selectedDate ? selectedDate.toLocaleDateString('es-MX') : ''}
              </h3>
              <button className="close-btn" onClick={handleCloseAppointmentForm} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
            </div>
            <form className="appointment-form" onSubmit={handleSubmitAppointment}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Cliente registrado</label>
                <select
                  value={selectedCliente ? selectedCliente.id_cliente.toString() : ''}
                  onChange={e => {
                    const id = e.target.value;
                    const cliente = clientes.find(c => c.id_cliente.toString() === id);
                    if (cliente) {
                      setSelectedCliente(cliente);
                      setNewAppointment({
                        ...newAppointment,
                        cliente: `${cliente.nombre_cliente} ${cliente.apellido_cliente}`,
                        telefono: cliente.telefono || '',
                        email: cliente.correo_electronico || ''
                      });
                    } else {
                      setSelectedCliente(null);
                      setNewAppointment({ ...newAppointment, cliente: '', telefono: '', email: '' });
                    }
                  }}
                  style={{ marginBottom: '8px' }}
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id_cliente} value={cliente.id_cliente.toString()}>
                      {cliente.nombre_cliente} {cliente.apellido_cliente}
                    </option>
                  ))}
                </select>
                <label>Nombre completo</label>
                <input type="text" value={newAppointment.cliente} onChange={e => setNewAppointment({ ...newAppointment, cliente: e.target.value })} required placeholder="Nombre completo" />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Servicio</label>
                <select
                  value={newAppointment.servicio}
                  onChange={e => setNewAppointment({ ...newAppointment, servicio: e.target.value })}
                  required
                  style={{ marginBottom: '8px' }}
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.length > 0 && servicios.map(servicio => (
                    <option key={String(servicio.id)} value={servicio.nombre}>
                      {servicio.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Hora</label>
                <select
                  value={newAppointment.hora}
                  onChange={e => setNewAppointment({ ...newAppointment, hora: e.target.value })}
                  required
                  style={{ marginBottom: '8px' }}
                >
                  <option value="">Selecciona una hora</option>
                  {horasDisponibles.map(horario => {
                    // Si el valor viene como '1970-01-01T09:00:00.0000000', extraer solo HH:mm
                    let inicio = '';
                    let fin = '';
                    if (horario.hora_inicio && horario.hora_inicio.includes('T')) {
                      inicio = horario.hora_inicio.split('T')[1].substring(0,5);
                    } else if (horario.hora_inicio) {
                      inicio = horario.hora_inicio.split(':').slice(0,2).join(':');
                    }
                    if (horario.hora_fin && horario.hora_fin.includes('T')) {
                      fin = horario.hora_fin.split('T')[1].substring(0,5);
                    } else if (horario.hora_fin) {
                      fin = horario.hora_fin.split(':').slice(0,2).join(':');
                    }
                    return (
                      <option key={horario.id_horario} value={horario.id_horario}>
                        {`${inicio} - ${fin}`}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Teléfono</label>
                <input type="tel" value={newAppointment.telefono} onChange={e => setNewAppointment({ ...newAppointment, telefono: e.target.value })} required placeholder="Teléfono" />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Notas</label>
                <textarea value={newAppointment.notas} onChange={e => setNewAppointment({ ...newAppointment, notas: e.target.value })} rows={2} placeholder="Notas adicionales" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-cancel-form" onClick={handleCloseAppointmentForm} style={{ background: '#eee', color: '#204d47', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 700 }}>Cancelar</button>
                <button type="submit" className="btn-submit" style={{ background: '#4f46e5', color: 'white', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 700 }}>Agendar cita</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal para nuevo cliente */}
      {showClientForm && (
        <div className="modal-overlay" onClick={() => setShowClientForm(false)}>
          {/* Aquí va el formulario de nuevo cliente */}
        </div>
      )}
      {/* Modal para nuevo empleado */}
      {showEmployeeForm && (
        <div className="modal-overlay" onClick={() => setShowEmployeeForm(false)}>
          {/* Aquí va el formulario de nuevo empleado */}
        </div>
      )}
      {/* Modal para editar cita */}
      {showEditForm && editAppointment && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          {/* Aquí va el formulario de edición de cita */}
        </div>
      )}
      {/* Modal para ver citas del día */}
      {showDayCitasModal && (
        <div className="modal-overlay" onClick={() => setShowDayCitasModal(false)}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#ffffffff', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>
                Citas para el día {selectedDate ? selectedDate.toLocaleDateString('es-MX') : ''}
              </h3>
              <button className="close-btn" onClick={() => setShowDayCitasModal(false)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
            </div>
            {citasDelDia.length === 0 ? (
              <p>No hay citas para este día.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {citasDelDia.map((cita, idx) => (
                  <li key={idx} style={{ marginBottom: '18px', background: '#e0f1ee', borderRadius: '8px', padding: '12px', position: 'relative', color: '#204d47', fontWeight: 600 }}>
                    <strong style={{ color: '#204d47' }}>Cliente:</strong> {cita.cliente}<br />
                    <strong style={{ color: '#204d47' }}>Servicio:</strong> {cita.servicio}<br />
                    <strong style={{ color: '#204d47' }}>Hora:</strong> {
                      cita.hora === '00:00' || cita.hora === '00:00:00'
                        ? (() => {
                            // Buscar el horario por id_horario
                            const horario = horarios.find(h => h.id_horario === cita.id_horario);
                            if (horario && horario.hora_inicio) {
                              // Mostrar HH:mm
                              if (typeof horario.hora_inicio === 'string') {
                                if (/^\d{2}:\d{2}:\d{2}/.test(horario.hora_inicio)) {
                                  return horario.hora_inicio.substring(0,5);
                                } else if (horario.hora_inicio.includes('T')) {
                                  return horario.hora_inicio.split('T')[1].substring(0,5);
                                } else {
                                  return horario.hora_inicio;
                                }
                              }
                            }
                            return 'No asignada';
                          })()
                        : cita.hora
                    }<br />
                    <strong style={{ color: '#204d47' }}>Teléfono:</strong> {cita.telefono}<br />
                    <strong style={{ color: '#204d47' }}>Notas:</strong> {cita.notas || 'Sin notas'}<br />
                    <strong style={{ color: '#204d47' }}>Estado:</strong> {cita.estado === 'pendiente' ? 'Pendiente' : cita.estado}<br />
                    <strong style={{ color: '#204d47' }}>Costo:</strong> ${cita.costo}<br />
                    {cita.estado === 'pendiente' && (
                      <button style={{ position: 'absolute', left: '12px', bottom: '12px', background: '#357a6c', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={async () => { await editarCita(cita.id, { id_estado_cita: 2 }); const citasActualizadas = await getCitas(); setCitas(citasActualizadas.map(mapearCita)); setShowDayCitasModal(false); }}>Completar</button>
                    )}
                    <button style={{ position: 'absolute', top: '12px', right: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={() => { setEditAppointment(cita); setShowEditForm(true); setShowDayCitasModal(false); }}>Editar</button>
                    <button style={{ position: 'absolute', bottom: '12px', right: '12px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }} onClick={async () => { await cancelarCita(cita.id); const citasActualizadas = await getCitas(); setCitas(citasActualizadas.map(mapearCita)); setShowDayCitasModal(false); }}>Cancelar</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCalendar;
