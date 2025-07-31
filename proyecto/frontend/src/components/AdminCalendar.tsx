"use client";

import { useState } from 'react';
import Navbar from '../app/components/Navbar';
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
    setShowAppointmentForm(true);
    setShowModal(false);
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
    setShowAppointmentForm(false);
  };

  const updateAppointmentStatus = (id: number, newStatus: 'confirmada' | 'pendiente' | 'cancelada') => {
    setCitas(prev => prev.map(cita => 
      cita.id === id ? { ...cita, estado: newStatus } : cita
    ));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <>
      <Navbar />
      <div className="admin-calendar-container">
        <div className="admin-header">
          <h1>Panel de Administración - Calendario de Citas</h1>
          <button 
            className="btn-new-appointment"
            onClick={() => setShowAppointmentForm(true)}
          >
            + Nueva Cita
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn-new-appointment-modal" onClick={handleNewAppointment}>
                Agendar nueva cita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nueva cita */}
      {showAppointmentForm && (
        <div className="modal-overlay" onClick={() => setShowAppointmentForm(false)}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Cita</h3>
              <button className="close-btn" onClick={() => setShowAppointmentForm(false)}>×</button>
            </div>
            <form className="appointment-form" onSubmit={handleSubmitAppointment}>
              <div className="form-row">
                <div className="form-group">
                  <label>Cliente</label>
                  <input
                    type="text"
                    value={newAppointment.cliente}
                    onChange={(e) => setNewAppointment({...newAppointment, cliente: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={newAppointment.telefono}
                    onChange={(e) => setNewAppointment({...newAppointment, telefono: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newAppointment.email}
                    onChange={(e) => setNewAppointment({...newAppointment, email: e.target.value})}
                  />
                </div>
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={newAppointment.fecha}
                    onChange={(e) => setNewAppointment({...newAppointment, fecha: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input
                    type="time"
                    value={newAppointment.hora}
                    onChange={(e) => setNewAppointment({...newAppointment, hora: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notas</label>
                <textarea
                  value={newAppointment.notas}
                  onChange={(e) => setNewAppointment({...newAppointment, notas: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-cancel-form" onClick={() => setShowAppointmentForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Agendar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default AdminCalendar;
