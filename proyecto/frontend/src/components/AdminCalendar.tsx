"use client";

import { useEffect, useState } from 'react';
import Navbar from '../app/components/Navbar';
import { getClientes, type Cliente } from '../servicios/clientesService';
import { getCitas, crearCita, editarCita, cancelarCita, Servicio } from '../servicios/citasService';
import { getServicios } from '../servicios/serviciosService';
// import eliminado: getHorarios no está exportado
import '../styles/admin-calendar.css';

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
}

const AdminCalendar = () => {
  // Suponiendo que tienes un arreglo de horarios en el backend
  // El arreglo de horarios debe tener: id_horario, hora_inicio, hora_fin, dia
  const [horarios, setHorarios] = useState<{ id_horario: number; hora_inicio: string; hora_fin: string; dia: string }[]>([]);
  // Si no tienes el servicio, inicializa horarios vacío
  // Cargar horarios reales al montar el componente
  // Cargar horarios reales al montar el componente
  useEffect(() => {
    async function cargarHorarios() {
      try {
        // Importar la función real del servicio
        const { obtenerHorarios } = await import('../servicios/horariosService');
        const horariosData = await obtenerHorarios();
        setHorarios(horariosData);
      } catch (error) {
        setHorarios([]);
      }
    }
    cargarHorarios();
  }, []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [citas, setCitas] = useState<Cita[]>([]);
  // Cargar citas reales al montar el componente
  // Función para mapear los datos de la cita del backend al frontend
  const mapearCita = (cita: any) => ({
  id: cita.id_cita,
  cliente: cita.nombre_cliente || cita.cliente || cita.cliente_nombre || cita.nombre || '-',
  servicio: cita.nombre_servicio || cita.servicio || cita.servicio_nombre || cita.nombre_servicio || '-',
  fecha: cita.fecha_cita
    ? formatFecha(cita.fecha_cita.split('T')[0])
    : (cita.fecha ? formatFecha(cita.fecha) : ''),
  hora: cita.fecha_cita
    ? cita.fecha_cita.split('T')[1]?.slice(0,5)
    : (cita.hora ? cita.hora.slice(0,5) : ''),
  estado: cita.estado || 'pendiente',
  telefono: cita.telefono || cita.cliente_telefono || cita.telefono_cliente || cita.celular || '-',
  notas: cita.notas || '',
  costo: cita.costo_servicio || cita.costo_total || cita.costo || cita.precio || 0
});

// Función para formatear la fecha como DD/MM/YYYY
function formatFecha(fecha: string) {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

  const [errorCitas, setErrorCitas] = useState<string | null>(null);
  useEffect(() => {
    async function cargarCitas() {
      try {
        const citasData = await getCitas();
        // Si la respuesta es un error del backend, mostrar mensaje y no intentar mapear
        if (!Array.isArray(citasData)) {
          setCitas([]);
          setErrorCitas('No se pudieron cargar las citas (error de backend)');
          return;
        }
        // Filtrar citas con fechas válidas
        const citasValidas = citasData.filter(c => {
          const fecha = c.fecha_cita || c.fecha;
          if (!fecha) return false;
          const d = new Date(fecha);
          return !isNaN(d.getTime());
        });
        const citasMapeadas = citasValidas.map(mapearCita);
        setCitas(citasMapeadas);
        setErrorCitas(null);
        // Si todas las citas fueron filtradas, mostrar advertencia
        if (citasData.length > 0 && citasMapeadas.length === 0) {
          setErrorCitas('Todas las citas tienen formato de fecha inválido.');
        }
      } catch (error: any) {
        console.error('Error al cargar citas:', error);
        setCitas([]);
        setErrorCitas(error.message || 'Error al cargar citas');
      }
    }
    cargarCitas();
  }, []);
  const [editAppointment, setEditAppointment] = useState<Cita | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showClientList, setShowClientList] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [newEmployee, setNewEmployee] = useState({ nombre: '', email: '', password: '', rol: 'empleado' });
  const [newClient, setNewClient] = useState({ nombre: '', email: '', password: '', telefono: '', fechaNacimiento: '' });

  const [newAppointment, setNewAppointment] = useState({
    cliente: '',
    telefono: '',
    email: '',
    servicio: '',
    fecha: '',
    hora: '',
    notas: ''
  });
  const [servicios, setServicios] = useState<{ id: number; nombre: string }[]>([]);
  // Cargar servicios reales al montar el componente
  useEffect(() => {
    async function cargarServicios() {
      try {
        const serviciosData = await getServicios();
        setServicios(serviciosData.map((s: any) => ({ id: s.id_servicio || s.id, nombre: s.nombre_servicio || s.nombre })));
      } catch (error) {
        setServicios([]);
      }
    }
    cargarServicios();
  }, []);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Debug effect to track modal states
  useEffect(() => {
    console.log('Modal states:', {
      showModal,
      showAppointmentForm,
      showClientList,
      showEditForm,
      showEmployeeForm,
      showClientForm
    });
  }, [showModal, showAppointmentForm, showClientList, showEditForm, showEmployeeForm, showClientForm]);

  // Debug específico para showAppointmentForm
  useEffect(() => {
    console.log('🎯 showAppointmentForm cambió a:', showAppointmentForm);
    if (showAppointmentForm) {
      console.log('✅ Modal de cita debería estar visible ahora');
      console.log('Cliente seleccionado:', selectedCliente);
    } else {
      console.log('❌ Modal de cita se cerró');
    }
  }, [showAppointmentForm, selectedCliente]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Días del mes siguiente para completar la semana
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const getCitasForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return citas.filter(cita => {
      // Aseguramos que la fecha de la cita esté en formato YYYY-MM-DD
      const citaFecha = cita.fecha ? cita.fecha.split('T')[0] : '';
      return citaFecha === dateString;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleNewAppointment = () => {
    console.log('Abriendo formulario de nueva cita');
    setShowAppointmentForm(true);
    setShowModal(false);
  };

  const handleNewAppointmentWithClients = async () => {
    console.log('Abriendo formulario de nueva cita con clientes');
    setLoadingClientes(true);
    try {
      const clientesData = await getClientes();
      // Los clientes ya están filtrados en la API para excluir empleados/administradores
      setClientes(clientesData);
      console.log('Clientes cargados:', clientesData);
    } catch (error: any) {
      console.error('Error al cargar clientes:', error);
      setClientes([]); // Si hay error, usar lista vacía
    } finally {
      setLoadingClientes(false);
      setShowAppointmentForm(true);
      setShowModal(false);
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    console.log('🚀 handleSelectCliente iniciado');
    console.log('Cliente seleccionado:', cliente);
    console.log('Estado actual showClientList:', showClientList);
    console.log('Estado actual showAppointmentForm:', showAppointmentForm);
    
    setSelectedCliente(cliente);
    setNewAppointment({
      ...newAppointment,
      cliente: `${cliente.nombre_cliente} ${cliente.apellido_cliente}`.trim(),
      telefono: cliente.telefono,
      email: cliente.correo_electronico
    });
    
    console.log('Cerrando modal de clientes...');
    setShowClientList(false);
    
    setTimeout(() => {
      console.log('Abriendo modal de cita después del timeout...');
      console.log('Estado showClientList después de timeout:', showClientList);
      setShowAppointmentForm(true);
      console.log('Estado showAppointmentForm después de setear true:', true);
    }, 100); // Pequeño delay para asegurar que se cierre el modal anterior
  };

  const handleClienteDropdownChange = (clienteId: string) => {
    console.log('Cliente seleccionado del dropdown:', clienteId);
    if (clienteId === '') {
      // Si selecciona "Nuevo cliente", limpiar campos
      setSelectedCliente(null);
      setNewAppointment({
        ...newAppointment,
        cliente: '',
        telefono: '',
        email: ''
      });
    } else {
      // Buscar el cliente seleccionado
      const cliente = clientes.find(c => c.id_cliente.toString() === clienteId);
      if (cliente) {
        setSelectedCliente(cliente);
        setNewAppointment({
          ...newAppointment,
          cliente: `${cliente.nombre_cliente} ${cliente.apellido_cliente}`.trim(),
          telefono: cliente.telefono,
          email: cliente.correo_electronico
        });
      }
    }
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Obtener id_cliente
      const id_cliente = selectedCliente ? selectedCliente.id_cliente : null;
      if (!id_cliente) throw new Error("Selecciona un cliente válido");

      // Mapear servicio a id_servicio usando el arreglo de servicios dinámico
      const servicioSeleccionado = servicios.find(s => s.nombre === newAppointment.servicio);
      const id_servicio = servicioSeleccionado ? servicioSeleccionado.id : 0;
      if (!id_servicio) throw new Error("Selecciona un servicio válido");

      // Asignar id_empleado por defecto (puedes cambiar la lógica si tienes selección de empleado)
      const id_empleado = 1;

      // Adaptar fecha y hora
      const fecha = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
      const hora = newAppointment.hora;

      // Opcionales
      const notas = newAppointment.notas || "";
      const costo_total = 0;
      const id_estado_cita = 1;
      // Buscar el id_horario según el día y la hora seleccionada
      let id_horario: number | null = null;
      if (horarios.length > 0 && hora && selectedDate) {
        // Obtener el nombre del día en español
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaSemana = diasSemana[selectedDate.getDay()];
        // Buscar el horario que coincida con el día y rango de horas
        const horarioEncontrado = horarios.find(h => {
          if (h.dia !== diaSemana) return false;
          // Comparar hora seleccionada con el rango
          // h.hora_inicio y h.hora_fin son tipo 'HH:mm:ss.0000000'
          const horaInicio = h.hora_inicio.slice(0,5); // HH:mm
          const horaFin = h.hora_fin.slice(0,5); // HH:mm
          return hora >= horaInicio && hora <= horaFin;
        });
        if (horarioEncontrado) {
          id_horario = horarioEncontrado.id_horario;
        }
      }
      // Crear el objeto que espera el backend
      const citaPayload = {
        id_cliente,
        id_servicio,
        id_empleado,
        fecha, // solo la fecha en formato YYYY-MM-DD
        hora,  // solo la hora en formato HH:mm
        notas,
        costo_total,
        id_estado_cita,
        id_horario
      };

      await crearCita(citaPayload);
      // Recargar citas reales
      const citasData = await getCitas();
      const citasMapeadas = citasData.map(mapearCita);
      setCitas(citasMapeadas);
      setNewAppointment({
        cliente: '',
        telefono: '',
        email: '',
        servicio: '',
        fecha: '',
        hora: '',
        notas: ''
      });
      setSelectedCliente(null);
      setShowAppointmentForm(false);
    } catch (error: any) {
      alert(error.message || 'Error al guardar la cita');
    }
  };

  // Definir days correctamente y tipar parámetros
  const days = getDaysInMonth(currentDate);

  // Función para actualizar el estado de la cita
  const updateAppointmentStatus = async (id: number, estado: 'confirmada' | 'pendiente' | 'cancelada') => {
    try {
      let id_estado_cita = 1; // pendiente
      if (estado === 'confirmada') id_estado_cita = 2;
      if (estado === 'cancelada') id_estado_cita = 3;
      await editarCita(id, { id_estado_cita });
      // Recargar citas reales
      const citasData = await getCitas();
      const citasMapeadas = citasData.map(mapearCita);
      setCitas(citasMapeadas);
    } catch (error: any) {
      alert(error.message || 'Error al actualizar el estado de la cita');
    }
  };

  // Función para cerrar el modal de nueva cita
  const handleCloseAppointmentForm = () => {
    setShowAppointmentForm(false);
    setSelectedCliente(null);
    setNewAppointment({
      cliente: '',
      telefono: '',
      email: '',
      servicio: '',
      fecha: '',
      hora: '',
      notas: ''
    });
  };

  return (
    <>
      <Navbar />
      <div className="admin-calendar-container">
        <div className="admin-header">
          {errorCitas ? (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '24px', borderRadius: '10px', margin: '32px auto', fontWeight: 'bold', textAlign: 'center', fontSize: '1.3rem', maxWidth: '600px' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>⚠️</span>
              Error al cargar citas: {errorCitas}<br />
              Por favor intenta más tarde o contacta al soporte.
            </div>
          ) : (
            <>
              <h1>Panel de Administración - Calendario de Citas</h1>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <button 
                  className="btn-new-appointment" 
                  onClick={handleNewAppointmentWithClients}
                  disabled={loadingClientes}
                  style={{ background: '#4f46e5', color: 'white', borderRadius: '6px', padding: '8px 16px', border: 'none' }}
                >
                  {loadingClientes ? 'Cargando...' : '+ Nueva Cita'}
                </button>
                <button className="btn-new-employee" style={{ background: '#357a6c', color: 'white', borderRadius: '6px', padding: '8px 16px', border: 'none' }} onClick={() => setShowEmployeeForm(true)}>
                  + Nuevo Empleado
                </button>
                <button className="btn-new-client" style={{ background: '#204d47', color: 'white', borderRadius: '6px', padding: '8px 16px', border: 'none' }} onClick={() => setShowClientForm(true)}>
                  + Nuevo Cliente
                </button>
              </div>
              <div className="calendar-wrapper">
                <div className="calendar-header">
                  <button className="nav-btn" onClick={() => navigateMonth('prev')}>
                    &#8249;
                  </button>
                  <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                  <button className="nav-btn" onClick={() => navigateMonth('next')}>
                    &#8250;
                  </button>
                </div>
                <div className="calendar-grid">
                  <div className="calendar-days-header">
                    {dayNames.map(day => (
                      <div key={day} className="day-header">{day}</div>
                    ))}
                  </div>
                  <div className="calendar-days">
                    {days.map((day: { date: Date; isCurrentMonth: boolean }, index: number) => {
                      const citasForDay = getCitasForDate(day.date);
                      const isToday = day.date.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={index}
                          className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                          onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
                        >
                          <span className="day-number">{day.date.getDate()}</span>
                          {citasForDay.length > 0 && (
                            <div className="appointments-indicator">
                              <span className="appointments-count">{citasForDay.length}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      {/* Modal para ver citas del día */}
      {showModal && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Citas para {selectedDate.toLocaleDateString('es-ES')}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {errorCitas ? (
                <p style={{ color: '#b91c1c', fontWeight: 'bold' }}>{errorCitas}</p>
              ) : getCitasForDate(selectedDate).length === 0 ? (
                <p>No hay citas programadas para este día.</p>
              ) : (
                <div className="appointments-list">
                  {getCitasForDate(selectedDate).map(cita => (
                    <div key={cita.id} className={`appointment-item ${cita.estado}`}>
                      <div className="appointment-header">
                        <h4>{cita.cliente}</h4>
                        <span className="appointment-time">{cita.hora}</span>
                        <span className="appointment-cost" style={{ marginLeft: '12px', color: '#357a6c', fontWeight: 'bold' }}>
                          ${cita.costo}
                        </span>
                      </div>
                      <div className="appointment-details">
                        <p><strong>Servicio:</strong> {cita.servicio}</p>
                        <p><strong>Teléfono:</strong> {cita.telefono}</p>
                        {cita.notas && <p><strong>Notas:</strong> {cita.notas}</p>}
                      </div>
                      <div className="appointment-status">
                        <span className={`status-badge ${cita.estado}`}>
                          {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                        </span>
                        <div className="status-buttons">
                          <button 
                            className="btn-confirm"
                            onClick={() => updateAppointmentStatus(cita.id, 'confirmada')}
                          >
                            Confirmar
                          </button>
                          <button 
                            className="btn-cancel"
                            onClick={() => updateAppointmentStatus(cita.id, 'cancelada')}
                          >
                            Cancelar
                          </button>
                        <button 
                          className="btn-edit"
                          style={{ background: '#fbbf24', color: '#204d47', borderRadius: '4px', marginLeft: '8px', padding: '4px 10px', border: 'none' }}
                          onClick={() => { setEditAppointment(cita); setShowEditForm(true); setShowModal(false); }}
                        >
                          Editar
                        </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Mostrar horas agendadas para el día */}
                  <div style={{ margin: '24px 0 12px 0', padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                    <h4 style={{ marginBottom: '8px', color: '#204d47' }}>Horas agendadas para este día:</h4>
                    {(() => {
                      const citasDia = getCitasForDate(selectedDate);
                      if (citasDia.length === 0) return <p style={{ color: '#666' }}>No hay horas agendadas.</p>;
                      return (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {citasDia.map(cita => (
                            <li key={cita.id} style={{ marginBottom: '6px', color: '#357a6c', fontWeight: 500 }}>
                              {cita.hora}
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </div>
      {/* Modal para seleccionar cliente */}
      {showClientList && (
        <div className="modal-overlay" onClick={() => setShowClientList(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Seleccionar Cliente</h3>
              <button className="close-btn" onClick={() => setShowClientList(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p>Selecciona un cliente existente para agendar una cita:</p>
                <button 
                  className="btn-new-appointment"
                  onClick={() => {
                    console.log('Cerrando lista de clientes y abriendo formulario de cita');
                    setShowClientList(false);
                    setTimeout(() => {
                      setShowAppointmentForm(true);
                    }, 100);
                  }}
                  style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  Crear cita sin cliente registrado
                </button>
              </div>
              
              {clientes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>No hay clientes registrados en la base de datos.</p>
                  <button 
                    className="btn-submit"
                    onClick={() => {
                      setShowClientList(false);
                      setShowClientForm(true);
                    }}
                  >
                    Registrar nuevo cliente
                  </button>
                </div>
              ) : (
                <div className="clients-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {clientes.map(cliente => (
                    <div 
                      key={cliente.id_cliente}
                      className="client-item"
                      style={{
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backgroundColor: '#fff'
                      }}
                      onClick={() => {
                        console.log('Haciendo click en cliente:', cliente);
                        handleSelectCliente(cliente);
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.borderColor = '#204d47';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.borderColor = '#e9ecef';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#204d47', fontSize: '1.1rem' }}>
                            {cliente.nombre_cliente} {cliente.apellido_cliente}
                          </h4>
                          <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
                            <strong>Email:</strong> {cliente.correo_electronico}
                          </p>
                          <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
                            <strong>Teléfono:</strong> {cliente.telefono}
                          </p>
                          <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>
                            <strong>Registrado:</strong> {new Date(cliente.fecha_registro).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div style={{ 
                          backgroundColor: '#204d47', 
                          color: 'white', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          Seleccionar
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para nuevo empleado */}
      {showEmployeeForm && (
        <div className="modal-overlay" onClick={() => setShowEmployeeForm(false)}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Empleado</h3>
              <button className="close-btn" onClick={() => setShowEmployeeForm(false)}>×</button>
            </div>
            <form className="appointment-form" onSubmit={e => { e.preventDefault(); setShowEmployeeForm(false); }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" value={newEmployee.nombre} onChange={e => setNewEmployee({ ...newEmployee, nombre: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contraseña</label>
                  <input type="password" value={newEmployee.password} onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select value={newEmployee.rol} onChange={e => setNewEmployee({ ...newEmployee, rol: e.target.value })} required>
                    <option value="empleado">Empleado</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="form-buttons">
                <button type="button" className="btn-cancel-form" onClick={() => setShowEmployeeForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Registrar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para nuevo cliente */}
      {showClientForm && (
        <div className="modal-overlay" onClick={() => setShowClientForm(false)}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Cliente</h3>
              <button className="close-btn" onClick={() => setShowClientForm(false)}>×</button>
            </div>
            <form className="appointment-form" onSubmit={e => { e.preventDefault(); setShowClientForm(false); }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" value={newClient.nombre} onChange={e => setNewClient({ ...newClient, nombre: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contraseña</label>
                  <input type="password" value={newClient.password} onChange={e => setNewClient({ ...newClient, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="tel" value={newClient.telefono} onChange={e => setNewClient({ ...newClient, telefono: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input type="date" value={newClient.fechaNacimiento} onChange={e => setNewClient({ ...newClient, fechaNacimiento: e.target.value })} required />
                </div>
              </div>
              <div className="form-buttons">
                <button type="button" className="btn-cancel-form" onClick={() => setShowClientForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Registrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
                </div>
              )}
              <button className="btn-new-appointment-modal" onClick={handleNewAppointmentWithClients}>
                Agendar nueva cita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nueva cita */}
      {showAppointmentForm && (
        <div className="modal-overlay" onClick={handleCloseAppointmentForm}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Nueva Cita 
                {selectedCliente && (
                  <span style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.9 }}>
                    {' '}- {selectedCliente.nombre_cliente} {selectedCliente.apellido_cliente}
                  </span>
                )}
              </h3>
              <button className="close-btn" onClick={handleCloseAppointmentForm}>×</button>
            </div>
            <div className="modal-body">
              <form className="appointment-form" onSubmit={handleSubmitAppointment}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cliente</label>
                    {clientes.length > 0 ? (
                      <>
                        <select
                          value={selectedCliente ? selectedCliente.id_cliente.toString() : ''}
                          onChange={(e) => handleClienteDropdownChange(e.target.value)}
                          style={{ marginBottom: '0.5rem' }}
                        >
                          <option value="">Seleccionar cliente</option>
                          {clientes.map(cliente => (
                            <option key={cliente.id_cliente} value={cliente.id_cliente.toString()}>
                              {cliente.nombre_cliente} {cliente.apellido_cliente}
                            </option>
                          ))}
                        </select>
                        {/* No mostrar input de apellidos si se selecciona un cliente existente */}
                      </>
                    ) : (
                      <input
                        type="text"
                        value={newAppointment.cliente}
                        onChange={(e) => setNewAppointment({...newAppointment, cliente: e.target.value})}
                        placeholder="Nombre del cliente"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={newAppointment.telefono}
                      onChange={(e) => setNewAppointment({...newAppointment, telefono: e.target.value})}
                      placeholder="Ej: +52 123 456 7890"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newAppointment.email}
                      onChange={(e) => setNewAppointment({...newAppointment, email: e.target.value})}
                      placeholder="cliente@ejemplo.com"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Servicio</label>
                    <select
                      value={newAppointment.servicio}
                      onChange={(e) => setNewAppointment({...newAppointment, servicio: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar servicio</option>
                      {servicios.map(servicio => (
                        <option key={servicio.id} value={servicio.nombre}>{servicio.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Hora</label>
                    <select
                      value={newAppointment.hora}
                      onChange={e => setNewAppointment({ ...newAppointment, hora: e.target.value })}
                      required
                      disabled={!selectedDate}
                    >
                      <option value="">Selecciona una hora</option>
                      {(() => {
                        if (!selectedDate) return null;
                        const dia = selectedDate.getDay(); // 0=Domingo, 6=Sábado
                        let horas: string[] = [];
                        if (dia === 0) {
                          // Domingo cerrado
                          return <option value="" disabled>Domingo cerrado</option>;
                        } else if (dia === 6) {
                          // Sábado: 10:00 - 14:00
                          for (let h = 10; h <= 14; h++) {
                            horas.push(h.toString().padStart(2, '0') + ':00');
                          }
                        } else {
                          // Lunes a Viernes: 9:00 - 18:00
                          for (let h = 9; h <= 18; h++) {
                            horas.push(h.toString().padStart(2, '0') + ':00');
                          }
                        }
                        return horas.map(hora => (
                          <option key={hora} value={hora}>{hora}</option>
                        ));
                      })()}
                    </select>
                    <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Lunes a Viernes: 9:00 - 18:00 | Sábado: 10:00 - 14:00 | Domingo: Cerrado
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Notas (Opcional)</label>
                    <textarea
                      value={newAppointment.notas}
                      onChange={(e) => setNewAppointment({...newAppointment, notas: e.target.value})}
                      rows={3}
                      placeholder="Comentarios adicionales, alergias, preferencias..."
                    />
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="button" className="btn-cancel-form" onClick={handleCloseAppointmentForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-submit">
                    Agendar Cita
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar cita */}
      {showEditForm && editAppointment && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Cita</h3>
              <button className="close-btn" onClick={() => setShowEditForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="appointment-form" onSubmit={async e => {
                e.preventDefault();
                // Validar campos requeridos
                if (!editAppointment.fecha || !editAppointment.hora || !editAppointment.servicio) {
                  alert('Completa todos los campos requeridos');
                  return;
                }
                try {
                  // Mapear servicio a id_servicio usando el arreglo de servicios dinámico
                  const servicioSeleccionado = servicios.find(s => s.nombre === editAppointment.servicio);
                  const id_servicio = servicioSeleccionado ? servicioSeleccionado.id : 0;
                  if (!id_servicio) throw new Error("Selecciona un servicio válido");
                  // id_estado_cita actual
                  let id_estado_cita = 1;
                  if (editAppointment.estado === 'confirmada') id_estado_cita = 2;
                  if (editAppointment.estado === 'cancelada') id_estado_cita = 3;
                  await editarCita(editAppointment.id, {
                    fecha: editAppointment.fecha,
                    hora: editAppointment.hora,
                    notas: editAppointment.notas,
                    id_servicio,
                    id_estado_cita,
                    // Opcional: puedes agregar id_cliente, id_empleado si lo tienes
                  });
                  // Recargar citas reales
      const citasData = await getCitas();
      const citasMapeadas = citasData.map(mapearCita);
      setCitas(citasMapeadas);
                  setShowEditForm(false);
                } catch (error: any) {
                  alert(error.message || 'Error al editar la cita');
                }
              }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cliente</label>
                    <input
                      type="text"
                      value={editAppointment.cliente}
                      onChange={e => setEditAppointment({ ...editAppointment, cliente: e.target.value })}
                      placeholder="Nombre completo del cliente"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={editAppointment.telefono}
                      onChange={e => setEditAppointment({ ...editAppointment, telefono: e.target.value })}
                      placeholder="Ej: +52 123 456 7890"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Servicio</label>
                    <select
                      value={editAppointment.servicio}
                      onChange={e => setEditAppointment({ ...editAppointment, servicio: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar servicio</option>
                      {servicios.map(servicio => (
                        <option key={servicio.id} value={servicio.nombre}>{servicio.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha</label>
                    <input
                      type="date"
                      value={editAppointment.fecha}
                      onChange={e => setEditAppointment({ ...editAppointment, fecha: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Hora</label>
                    <select
                      value={editAppointment.hora}
                      onChange={e => setEditAppointment({ ...editAppointment, hora: e.target.value })}
                      required
                      disabled={!editAppointment.fecha}
                    >
                      <option value="">Selecciona una hora</option>
                      {(() => {
                        if (!editAppointment.fecha) return null;
                        const [year, month, day] = editAppointment.fecha.split('-').map(Number);
                        const fecha = new Date(year, month - 1, day);
                        const dia = fecha.getDay(); // 0=Domingo, 6=Sábado
                        let horas: string[] = [];
                        if (dia === 0) {
                          // Domingo cerrado
                          return <option value="" disabled>Domingo cerrado</option>;
                        } else if (dia === 6) {
                          // Sábado: 10:00 - 14:00
                          for (let h = 10; h <= 14; h++) {
                            horas.push(h.toString().padStart(2, '0') + ':00');
                          }
                        } else {
                          // Lunes a Viernes: 9:00 - 18:00
                          for (let h = 9; h <= 18; h++) {
                            horas.push(h.toString().padStart(2, '0') + ':00');
                          }
                        }
                        return horas.map(hora => (
                          <option key={hora} value={hora}>{hora}</option>
                        ));
                      })()}
                    </select>
                    <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Lunes a Viernes: 9:00 - 18:00 | Sábado: 10:00 - 14:00 | Domingo: Cerrado
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Notas (Opcional)</label>
                    <textarea
                      value={editAppointment.notas || ''}
                      onChange={e => setEditAppointment({ ...editAppointment, notas: e.target.value })}
                      rows={3}
                      placeholder="Comentarios adicionales, alergias, preferencias..."
                    />
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="button" className="btn-cancel-form" onClick={() => setShowEditForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-submit">
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default AdminCalendar;
