"use client";

import { useEffect, useState } from 'react';
import Navbar from '../app/components/Navbar';
import { getClientes, type Cliente } from '../servicios/clientesService';
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
}

const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [citas, setCitas] = useState<Cita[]>([
    {
      id: 1,
      cliente: "María González",
      servicio: "Masaje Relajante",
      fecha: "2025-07-30",
      hora: "10:00",
      estado: "confirmada",
      telefono: "123-456-7890",
      notas: "Cliente preferente"
    },
    {
      id: 2,
      cliente: "Ana López",
      servicio: "Facial",
      fecha: "2025-07-30",
      hora: "14:00",
      estado: "pendiente",
      telefono: "098-765-4321"
    },
    {
      id: 3,
      cliente: "Carlos Ruiz",
      servicio: "Manicure",
      fecha: "2025-07-31",
      hora: "11:00",
      estado: "confirmada",
      telefono: "555-123-4567"
    }
  ]);
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
    return citas.filter(cita => cita.fecha === dateString);
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

  const handleSubmitAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newCita: Cita = {
      id: citas.length + 1,
      cliente: newAppointment.cliente,
      servicio: newAppointment.servicio,
      fecha: newAppointment.fecha,
      hora: newAppointment.hora,
      estado: 'pendiente',
      telefono: newAppointment.telefono,
      notas: newAppointment.notas
    };
    
    setCitas([...citas, newCita]);
    setNewAppointment({
      cliente: '',
      telefono: '',
      email: '',
      servicio: '',
      fecha: '',
      hora: '',
      notas: ''
    });
    setSelectedCliente(null); // Reset selected client
    setShowAppointmentForm(false);
  };

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

  const updateAppointmentStatus = (id: number, newStatus: 'confirmada' | 'pendiente' | 'cancelada') => {
    setCitas(prev => prev.map(cita => 
      cita.id === id ? { ...cita, estado: newStatus } : cita
    ));
  };

  const days = getDaysInMonth(currentDate);

  // Debug adicional antes del render
  console.log('🎯 Renderizando componente AdminCalendar');
  console.log('showAppointmentForm:', showAppointmentForm);
  console.log('showClientList:', showClientList);
  console.log('selectedCliente:', selectedCliente);

  return (
    <>
      <Navbar />
      <div className="admin-calendar-container">
        <div className="admin-header">
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
            {days.map((day, index) => {
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

      {/* Modal para ver citas del día */}
      {showModal && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Citas para {selectedDate.toLocaleDateString('es-ES')}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {getCitasForDate(selectedDate).length === 0 ? (
                <p>No hay citas programadas para este día.</p>
              ) : (
                <div className="appointments-list">
                  {getCitasForDate(selectedDate).map(cita => (
                    <div key={cita.id} className={`appointment-item ${cita.estado}`}>
                      <div className="appointment-header">
                        <h4>{cita.cliente}</h4>
                        <span className="appointment-time">{cita.hora}</span>
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
                        {/* <input
                          type="text"
                          value={newAppointment.cliente}
                          onChange={(e) => {
                            setNewAppointment({...newAppointment, cliente: e.target.value});
                            setSelectedCliente(null);
                          }}
                          placeholder="Nombre de nuevo cliente"
                          required
                        /> */}
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
                      <option value="Masaje Relajante">Masaje Relajante</option>
                      <option value="Masaje Deportivo">Masaje Deportivo</option>
                      <option value="Facial">Facial</option>
                      <option value="Manicure">Manicure</option>
                      <option value="Pedicure">Pedicure</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha</label>
                    <input
                      type="date"
                      value={newAppointment.fecha}
                      onChange={(e) => setNewAppointment({...newAppointment, fecha: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Hora</label>
                    <input
                      type="time"
                      value={newAppointment.hora}
                      onChange={(e) => setNewAppointment({...newAppointment, hora: e.target.value})}
                      min="08:00"
                      max="20:00"
                      required
                    />
                    <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Horario de atención: 8:00 AM - 8:00 PM
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
              <form className="appointment-form" onSubmit={e => {
                e.preventDefault();
                setCitas(prev => prev.map(cita => cita.id === editAppointment.id ? { ...editAppointment } : cita));
                setShowEditForm(false);
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
                      <option value="Masaje Relajante">Masaje Relajante</option>
                      <option value="Masaje Deportivo">Masaje Deportivo</option>
                      <option value="Facial">Facial</option>
                      <option value="Manicure">Manicure</option>
                      <option value="Pedicure">Pedicure</option>
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
                    <input
                      type="time"
                      value={editAppointment.hora}
                      onChange={e => setEditAppointment({ ...editAppointment, hora: e.target.value })}
                      min="08:00"
                      max="20:00"
                      required
                    />
                    <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Horario de atención: 9:00 AM - 6:00 PM
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
