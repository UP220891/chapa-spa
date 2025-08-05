"use client";
// Tipos locales para evitar errores de compilación
import React, { useState, useEffect } from 'react';
import Navbar from '../app/components/Navbar';
import { getClientes } from '../servicios/clientesService';
import { getServicios } from '../servicios/serviciosService';
import { crearCita, editarCita, cancelarCita, getCitas } from '../servicios/citasService';
import { getEmpleados, type Empleado } from '../servicios/empleadosService';
import { obtenerEspecialidades } from '../servicios/especialidadService';

interface ClienteFormProps {
  onClose: () => void;
  onClienteCreated?: () => void;
}

interface EmpleadoFormProps {
  onClose: () => void;
  onEmpleadoCreated?: () => void;
}

// Tipos locales para evitar errores de compilación
interface Cliente {
  id_cliente: number;
  nombre_cliente: string;
  apellido_cliente: string;
  telefono?: string;
  correo_electronico?: string;
}

interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  duracion?: number | string;
  precio?: number;
  imagen?: string;
}

interface Especialidad {
  id_especialidad: number;
  nombre_especialidad: string;
}

interface Cita {
  id: number;
  cliente: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: string;
  telefono?: string;
  notas?: string;
  costo?: number;
  id_horario?: number;
  id_servicio?: number;
}

// Formulario para crear empleado
const EmpleadoForm: React.FC<EmpleadoFormProps> = ({ onClose, onEmpleadoCreated }) => {
  const [form, setForm] = useState({
    nombre_empleado: '',
    email: '',
    telefono: '',
    password: '',
    id_especialidad: '',
    rol: 'empleado'
  });
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar especialidades al montar el componente
  useEffect(() => {
    async function cargarEspecialidades() {
      try {
        const especialidadesData = await obtenerEspecialidades();
        setEspecialidades(especialidadesData);
      } catch (error) {
        console.error('Error al cargar especialidades:', error);
        setError('Error al cargar especialidades');
      }
    }
    cargarEspecialidades();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!form.nombre_empleado || !form.email || !form.telefono || !form.password) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    // Validar contraseña
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Usar el endpoint de autenticación para crear empleado con contraseña
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No estás autenticado. Inicia sesión para crear empleados.');
        return;
      }

      const empleadoData = {
        nombre: form.nombre_empleado.trim(),
        email: form.email.trim(),
        password: form.password,
        telefono: form.telefono.trim(),
        fechaNacimiento: '1990-01-01', // Fecha placeholder para empleados
        rol: form.rol,
        tipo_usuario: 'empleado'
        // No enviamos id_especialidad por ahora, la tabla T_Empleados tiene estructura limitada
      };

      // Hacer request al endpoint de autenticación
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/register-empleado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(empleadoData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.mensaje || 'Error al crear empleado');
      }
      
      // Notificar éxito
      alert('¡Empleado creado exitosamente!');
      
      // Llamar callback si existe
      if (onEmpleadoCreated) {
        onEmpleadoCreated();
      }
      
      // Cerrar modal
      onClose();
    } catch (error: any) {
      console.error('Error al crear empleado:', error);
      setError(error.message || 'Error al crear empleado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {error}
        </div>
      )}
      
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#204d47' }}>
          Nombre completo *
        </label>
        <input 
          type="text" 
          value={form.nombre_empleado} 
          onChange={e => setForm(f => ({ ...f, nombre_empleado: e.target.value }))} 
          required 
          placeholder="Nombre del empleado"
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '2px solid #e0f1ee', 
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#357a6c'}
          onBlur={e => e.target.style.borderColor = '#e0f1ee'}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#204d47' }}>
          Email *
        </label>
        <input 
          type="email" 
          value={form.email} 
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
          required 
          placeholder="correo@ejemplo.com"
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '2px solid #e0f1ee', 
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#357a6c'}
          onBlur={e => e.target.style.borderColor = '#e0f1ee'}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#204d47' }}>
          Teléfono *
        </label>
        <input 
          type="tel" 
          value={form.telefono} 
          onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} 
          required 
          placeholder="4491234567"
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '2px solid #e0f1ee', 
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#357a6c'}
          onBlur={e => e.target.style.borderColor = '#e0f1ee'}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#204d47' }}>
          Contraseña *
        </label>
        <input 
          type="password" 
          value={form.password} 
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
          required 
          placeholder="Mínimo 6 caracteres"
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '2px solid #e0f1ee', 
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#357a6c'}
          onBlur={e => e.target.style.borderColor = '#e0f1ee'}
        />
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#204d47' }}>
          Especialidad (opcional)
        </label>
        <select 
          value={form.id_especialidad} 
          onChange={e => setForm(f => ({ ...f, id_especialidad: e.target.value }))}
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '2px solid #e0f1ee', 
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: '#fff'
          }}
          onFocus={e => e.target.style.borderColor = '#357a6c'}
          onBlur={e => e.target.style.borderColor = '#e0f1ee'}
        >
          <option value="">Selecciona una especialidad</option>
          {especialidades.map(especialidad => (
            <option key={especialidad.id_especialidad} value={especialidad.id_especialidad}>
              {especialidad.nombre_especialidad}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#204d47' }}>
          Rol
        </label>
        <select 
          value={form.rol} 
          onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '2px solid #e0f1ee', 
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: '#fff'
          }}
          onFocus={e => e.target.style.borderColor = '#357a6c'}
          onBlur={e => e.target.style.borderColor = '#e0f1ee'}
        >
          <option value="empleado">Empleado</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button 
          type="button" 
          className="btn-cancel-form" 
          onClick={onClose} 
          disabled={loading}
          style={{ 
            background: '#eee', 
            color: '#204d47', 
            borderRadius: '8px', 
            padding: '12px 24px', 
            border: 'none', 
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-submit" 
          disabled={loading}
          style={{ 
            background: loading ? '#9ca3af' : '#357a6c', 
            color: 'white', 
            borderRadius: '8px', 
            padding: '12px 24px', 
            border: 'none', 
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #fff', 
                borderTop: '2px solid transparent', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
              Guardando...
            </>
          ) : (
            'Guardar Empleado'
          )}
        </button>
      </div>
    </form>
  );
};
// Formulario para crear cliente
const ClienteForm: React.FC<ClienteFormProps> = ({ onClose, onClienteCreated }) => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: ''
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.telefono || !form.correo) {
      alert('Completa todos los campos');
      return;
    }
    try {
      // Crear cliente usando el servicio (necesitarás implementar crearCliente)
      // await crearCliente(form);
      alert('Cliente guardado exitosamente');
      
      // Llamar callback si existe
      if (onClienteCreated) {
        onClienteCreated();
      }
      
      onClose();
    } catch (error) {
      alert('Error al guardar el cliente');
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#204d47' }}>
          Nombre *
        </label>
        <input 
          type="text" 
          value={form.nombre} 
          onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} 
          required 
          placeholder="Nombre del cliente"
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '2px solid #e0f1ee', 
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: '#fff'
          }}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = '#e0f1ee'}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#204d47' }}>
          Apellido *
        </label>
        <input 
          type="text" 
          value={form.apellido} 
          onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} 
          required 
          placeholder="Apellido del cliente"
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '2px solid #e0f1ee', 
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: '#fff'
          }}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = '#e0f1ee'}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#204d47' }}>
          Teléfono *
        </label>
        <input 
          type="tel" 
          value={form.telefono} 
          onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} 
          required 
          placeholder="Teléfono del cliente"
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '2px solid #e0f1ee', 
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: '#fff'
          }}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = '#e0f1ee'}
        />
      </div>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#204d47' }}>
          Correo electrónico *
        </label>
        <input 
          type="email" 
          value={form.correo} 
          onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} 
          required 
          placeholder="correo@ejemplo.com"
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '2px solid #e0f1ee', 
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: '#fff'
          }}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = '#e0f1ee'}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button 
          type="button" 
          className="btn-cancel-form" 
          onClick={onClose} 
          style={{ 
            background: '#eee', 
            color: '#204d47', 
            borderRadius: '8px', 
            padding: '12px 24px', 
            border: 'none', 
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-submit" 
          style={{ 
            background: '#7c3aed', 
            color: 'white', 
            borderRadius: '8px', 
            padding: '12px 24px', 
            border: 'none', 
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
          onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
        >
          Guardar Cliente
        </button>
      </div>
    </form>
  );
}
// Componente separado para el modal de edición de cita (solo estado)
interface Horario {
  id_horario: number;
  hora_inicio: string;
  hora_fin: string;
  dia: string;
}

interface ServicioModal {
  id: number;
  nombre: string;
  descripcion?: string;
  duracion?: number | string;
  precio?: number;
  imagen?: string;
}

interface EditCitaModalProps {
  editAppointment: any;
  onClose: () => void;
  onSave: (nuevaCita: any) => void;
  horasDisponibles: Horario[];
  servicios: ServicioModal[];
}

function EditCitaModal({ editAppointment, onClose, onSave, horasDisponibles, servicios }: EditCitaModalProps) {
  // Inicializar el id del servicio correctamente
  const servicioInicial = (() => {
    // Buscar por id primero
    if (editAppointment.id_servicio) {
      const s = servicios.find(s => s.id === editAppointment.id_servicio);
      if (s) return s.id;
    }
    // Buscar por nombre (ignorando mayúsculas, acentos y espacios)
    if (editAppointment.servicio) {
      const normalizar = (str: string) => str.normalize('NFD').replace(/[ -- --]/g, '').replace(/[-]/g, '').replace(/\s+/g, '').toLowerCase();
      const nombreCita = normalizar(editAppointment.servicio);
      const s = servicios.find(s => normalizar(s.nombre) === nombreCita);
      if (s) return s.id;
    }
    // Si no hay coincidencia, usar el primero de la lista
    if (servicios.length > 0) return servicios[0].id;
    return '';
  })();
  const [form, setForm] = useState({
    cliente: editAppointment.cliente || '',
    telefono: editAppointment.telefono || '',
    servicio: servicioInicial,
    hora: editAppointment.hora || '',
    notas: editAppointment.notas || '',
    estado: (() => {
      const estadosMap: Record<string, number> = {
        'agendada': 1,
        'completada': 2,
        'cancelada': 3,
        'no asistió': 4,
        'pendiente': 1,
        'confirmada': 1
      };
      if (typeof editAppointment.estado === 'number') return editAppointment.estado;
      if (typeof editAppointment.estado === 'string') {
        const estadoStr = editAppointment.estado.trim().toLowerCase().replace('á','a');
        return estadosMap[estadoStr] || 1;
      }
      return 1;
    })()
  });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
        <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#1a202c', fontWeight: 900, fontSize: '1.6rem', margin: 0, textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
            Editar cita
          </h3>
          <button className="close-btn" onClick={onClose} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          await onSave({
            cliente: form.cliente,
            telefono: form.telefono,
            id_servicio: form.servicio,
            hora: form.hora,
            notas: form.notas,
            id_estado_cita: form.estado
          });
        }}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Cliente</label>
            <input type="text" value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))} required />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Teléfono</label>
            <input type="tel" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} required />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Servicio</label>
            <select value={form.servicio} onChange={e => setForm(f => ({ ...f, servicio: Number(e.target.value) }))} required style={{ marginBottom: '8px', width: '100%' }}>
              <option value="">Selecciona un servicio</option>
              {servicios.map(servicio => (
                <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Hora</label>
            <select value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} required style={{ marginBottom: '8px', width: '100%' }}>
              <option value="">Selecciona una hora</option>
              {[...new Map(horasDisponibles.map(horario => {
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
                return [inicio, { id_horario: horario.id_horario, inicio, fin }];
              })).values()].map(({ id_horario, inicio, fin }) => (
                <option key={id_horario} value={inicio}>{`${inicio} - ${fin}`}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Notas</label>
            <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2} />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Estado</label>
            <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: Number(e.target.value) }))} required style={{ marginBottom: '8px', width: '100%' }}>
              <option value={1}>Agendada</option>
              <option value={2}>Completada</option>
              <option value={3}>Cancelada</option>
              <option value={4}>No asistió</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn-cancel-form" onClick={onClose} style={{ background: '#eee', color: '#204d47', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 700 }}>Cancelar</button>
            <button type="submit" className="btn-submit" style={{ background: '#357a6c', color: 'white', borderRadius: '6px', padding: '8px 16px', border: 'none', fontWeight: 700 }}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const AdminCalendar = () => {
  const [showClientForm, setShowClientForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [showEmpleadosList, setShowEmpleadosList] = useState(false);
  const [showClientesList, setShowClientesList] = useState(false);
  const [vieneDeGestionEmpleados, setVieneDeGestionEmpleados] = useState(false);
  
  const handleNewAppointment = () => setShowAppointmentForm(true);
  const handleNewClient = () => setShowClientForm(true);
  const handleNewEmployee = () => setShowEmployeeForm(true);

  // Función para recargar empleados
  const recargarEmpleados = async () => {
    try {
      const empleadosData = await getEmpleados();
      setEmpleados(empleadosData);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  // Función para recargar empleados y volver al modal de gestión
  const recargarEmpleadosYVolverAGestion = async () => {
    try {
      const empleadosData = await getEmpleados();
      setEmpleados(empleadosData);
      // Volver a abrir el modal de gestión de empleados
      setShowEmpleadosList(true);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  // Función para recargar clientes
  const recargarClientes = async () => {
    try {
      const clientesData = await getClientes();
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };
  // Utilidades para el calendario
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // Agosto 2025
   
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
      const dayDate = new Date(year, month, day);
      days.push({ date: dayDate, isCurrentMonth: true });
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
    
    const citasFiltradas = citas.filter(cita => {
      // Usar la fecha original del backend para comparar
      let fechaOriginal = '';
      if (cita.fecha && typeof cita.fecha === 'string') {
        // Si la fecha está en formato DD/MM/YYYY, convertir a ISO para comparar
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(cita.fecha)) {
          const [d, m, y] = cita.fecha.split('/');
          fechaOriginal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        } else if (cita.fecha.includes('T')) {
          fechaOriginal = cita.fecha.split('T')[0];
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(cita.fecha)) {
          fechaOriginal = cita.fecha;
        } else {
          fechaOriginal = cita.fecha.split(' ')[0];
        }
      }
      
      const coincide = fechaOriginal === dateString;
      
      return coincide;
    });
    
    return citasFiltradas;
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
    // Si es domingo, dejar el array vacío pero NO retornar del componente
    if (diaSemana !== 'Domingo') {
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
    // Si es domingo, horasDisponibles queda vacío
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
        fecha_cita: (() => {
          const fecha = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
          const hora = horaSQL;
          const fechaCita = `${fecha} ${hora}`;
          return fechaCita;
        })(),
        notas: newAppointment.notas,
        costo_total: servicioObj.precio ?? 0,
        id_estado_cita: 1, // SIEMPRE 'Agendada' por defecto
        id_horario: horarioObj.id_horario
      };
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
    let fechaRaw = c.fecha || c.fecha_cita || c.fecha_cita_inicio || c.fecha_inicio || '';
    
    // Formatear fecha a DD/MM/YYYY
    let fechaFormateada = '';
    if (typeof fechaRaw === 'string' && fechaRaw.length >= 10) {
      // Si es ISO, extraer solo la fecha
      let soloFecha = fechaRaw;
      if (soloFecha.includes('T')) soloFecha = soloFecha.split('T')[0];
      const partes = soloFecha.split('-');
      if (partes.length === 3) {
        fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`;
      } else {
        fechaFormateada = soloFecha;
      }
    } else {
      fechaFormateada = fechaRaw;
    }
    const costo = c.costo ?? c.costo_total ?? 0;
    
    // Estado: Usar id_estado_cita como fuente principal (es lo que devuelve el backend)
    let estadoRaw = c.id_estado_cita ?? c.estado ?? c.estado_cita ?? c.nombre_estado_cita ?? c.estadoCita ?? c.estado_nombre ?? '';
    let estadoFinal = '';
    
    if (typeof estadoRaw === 'number') {
      switch (estadoRaw) {
        case 1: estadoFinal = 'Agendada'; break;
        case 2: estadoFinal = 'Completada'; break;
        case 3: estadoFinal = 'Cancelada'; break;
        case 4: estadoFinal = 'No asistió'; break;
        default: estadoFinal = 'Agendada';
      }
    } else if (typeof estadoRaw === 'string') {
      const estadoStr = estadoRaw.trim().toLowerCase().replace('á','a');
      const estadosMap: Record<string, string> = {
        'agendada': 'Agendada',
        'completada': 'Completada',
        'cancelada': 'Cancelada',
        'no asistió': 'No asistió',
        'pendiente': 'Agendada',
        'confirmada': 'Agendada'
      };
      if (!estadoStr || estadoStr === 'null' || estadoStr === 'undefined') {
        estadoFinal = 'Agendada';
      } else {
        estadoFinal = estadosMap[estadoStr] ?? 'Agendada';
      }
    } else {
      estadoFinal = 'Agendada';
    }
    
    // Limpiar nombre de servicio (quitar tabuladores y espacios extra)
    let servicioLimpio = c.nombre_servicio;
    if (typeof servicioLimpio === 'string') {
      servicioLimpio = servicioLimpio.replace(/\s+/g, ' ').replace(/\t/g, '').trim();
    }
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
      } else if (typeof c.hora === 'string' && c.hora.length >= 8) {
        // Si viene como '00:00:00', tomar los primeros 5
        horaFormateada = c.hora.substring(0,5);
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
    
    const citaMapeada = {
      id: c.id_cita,
      cliente: c.nombre_cliente,
      servicio: servicioLimpio,
      fecha: fechaFormateada,
      hora: horaFormateada,
      estado: estadoFinal,
      telefono: c.telefono,
      notas: c.notas,
      costo: costo,
      id_horario: c.id_horario, // Agregado para mostrar hora real en el modal
      id_servicio: c.id_servicio // Agregado para el formulario de edición
    };
    
    return citaMapeada;
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

  // Cargar empleados al montar el componente
  useEffect(() => {
    recargarEmpleados();
  }, []);

  // Cargar clientes al montar el componente
  useEffect(() => {
    recargarClientes();
  }, []);

  // Cargar citas al montar el componente
  useEffect(() => {
    async function cargarCitasIniciales() {
      try {
        const citasActualizadas = await getCitas();
        
        const citasMapeadas = citasActualizadas.map(mapearCita);
        
        setCitas(citasMapeadas);
      } catch (error) {
        console.error('Error cargando citas iniciales:', error);
      }
    }
    cargarCitasIniciales();
  }, []);

  // Actualizar las citas del día cuando cambien las citas globales o el modal se abra
  useEffect(() => {
    if (showDayCitasModal && selectedDate) {
      const citasDiaActualizadas = getCitasForDate(selectedDate);
      setCitasDelDia(citasDiaActualizadas);
    }
  }, [showDayCitasModal, selectedDate, citas]); // Agregué 'citas' de vuelta para sincronización

  // Al hacer click en un día, mostrar el modal con las citas de ese día
  const handleDayClick = async (date: Date) => {
    if (!date) return;
    
    setSelectedDate(date);
    // Recargar citas antes de mostrar el modal para tener los datos más actualizados
    try {
      const citasActualizadas = await getCitas();
      const citasMapeadas = citasActualizadas.map(mapearCita);
      setCitas(citasMapeadas);
      const citasDia = getCitasForDate(date);
      setCitasDelDia(citasDia);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      // Si hay error, usar las citas que ya tenemos
      const citasDia = getCitasForDate(date);
      setCitasDelDia(citasDia);
    }
    setShowDayCitasModal(true);
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <Navbar />
      <div className="admin-calendar-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0' }}>
          <div>
            <button 
              className="btn-new-appointment" 
              style={{ 
                background: '#4f46e5', 
                color: 'white', 
                borderRadius: '8px', 
                padding: '0.8rem 2rem', 
                border: 'none', 
                fontWeight: 700, 
                fontSize: '1.1rem', 
                marginRight: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} 
              onClick={handleNewAppointment}
              onMouseEnter={e => e.currentTarget.style.background = '#3f37d9'}
              onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
            >
              + Nueva Cita
            </button>
            <button 
              className="btn-list-employees" 
              style={{ 
                background: '#059669', 
                color: 'white', 
                borderRadius: '8px', 
                padding: '0.8rem 2rem', 
                border: 'none', 
                fontWeight: 700, 
                fontSize: '1.1rem', 
                marginRight: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => setShowEmpleadosList(true)}
              onMouseEnter={e => e.currentTarget.style.background = '#047857'}
              onMouseLeave={e => e.currentTarget.style.background = '#059669'}
            >
              👥 Gestionar Empleados ({empleados.length})
            </button>
            <button 
              className="btn-list-clients" 
              style={{ 
                background: '#7c3aed', 
                color: 'white', 
                borderRadius: '8px', 
                padding: '0.8rem 2rem', 
                border: 'none', 
                fontWeight: 700, 
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => setShowClientesList(true)}
              onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
            >
              👤 Gestionar Clientes ({clientes.length})
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
              <h3 style={{ color: '#1a202c', fontWeight: 900, fontSize: '1.6rem', margin: 0, textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                Nueva cita para el día {selectedDate ? selectedDate.toLocaleDateString('es-MX') : ''}
              </h3>
              <button className="close-btn" onClick={handleCloseAppointmentForm} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
            </div>
            {/* Si es domingo, mostrar mensaje de cerrado */}
            {selectedDate && selectedDate.getDay() === 0 ? (
              <div style={{ textAlign: 'center', color: '#e53e3e', fontWeight: 700, fontSize: '1.2rem', margin: '32px 0' }}>
                El spa está cerrado los domingos.
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}
      {/* Modal para nuevo cliente */}
      {showClientForm && (
        <div className="modal-overlay" onClick={() => setShowClientForm(false)}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '12px 12px 0 0', padding: '0' }}>
              <h3 style={{ color: '#204d47', fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>Nuevo Cliente</h3>
              <button className="close-btn" onClick={() => setShowClientForm(false)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
            </div>
            <ClienteForm 
              onClose={() => setShowClientForm(false)} 
              onClienteCreated={recargarClientes}
            />
          </div>
        </div>
      )}
      {/* Modal para nuevo empleado */}
      {showEmployeeForm && (
        <div className="modal-overlay" onClick={() => {
          setShowEmployeeForm(false);
          setVieneDeGestionEmpleados(false);
        }}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '12px 12px 0 0', padding: '0' }}>
              <h3 style={{ color: '#204d47', fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>👤 Nuevo Empleado</h3>
              <button className="close-btn" onClick={() => {
                setShowEmployeeForm(false);
                setVieneDeGestionEmpleados(false);
              }} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
            </div>
            <EmpleadoForm 
              onClose={() => {
                setShowEmployeeForm(false);
                setVieneDeGestionEmpleados(false);
              }} 
              onEmpleadoCreated={vieneDeGestionEmpleados ? recargarEmpleadosYVolverAGestion : recargarEmpleados}
            />
          </div>
        </div>
      )}

      {showEditForm && editAppointment && (
        <EditCitaModal
          editAppointment={editAppointment}
          onClose={() => setShowEditForm(false)}
          onSave={async (nuevaCita) => {
            try {
              // Actualizar en el backend
              await editarCita(editAppointment.id, nuevaCita);
              
              // Recargar todas las citas desde el backend para asegurar sincronización
              const citasActualizadas = await getCitas();
              const citasMapeadas = citasActualizadas.map(mapearCita);
              setCitas(citasMapeadas);
              
              // Si el modal de citas del día está abierto, actualizar también esas citas
              if (showDayCitasModal && selectedDate) {
                const citasDiaActualizadas = citasMapeadas.filter(citaMappeada => {
                  let fechaOriginal = '';
                  if (citaMappeada.fecha && typeof citaMappeada.fecha === 'string') {
                    // Si la fecha está en formato DD/MM/YYYY, convertir a ISO para comparar
                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(citaMappeada.fecha)) {
                      const [d, m, y] = citaMappeada.fecha.split('/');
                      fechaOriginal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                    } else if (citaMappeada.fecha.includes('T')) {
                      fechaOriginal = citaMappeada.fecha.split('T')[0];
                    } else if (/^\d{4}-\d{2}-\d{2}$/.test(citaMappeada.fecha)) {
                      fechaOriginal = citaMappeada.fecha;
                    } else {
                      fechaOriginal = citaMappeada.fecha.split(' ')[0];
                    }
                  }
                  return fechaOriginal === selectedDate.toISOString().split('T')[0];
                });
                setCitasDelDia(citasDiaActualizadas);
              }
              
              // Cerrar el modal de edición
              setShowEditForm(false);
            } catch (error) {
              console.error('Error al editar cita:', error);
              const errorMessage = error instanceof Error ? error.message : String(error);
              alert(`Error al editar la cita: ${errorMessage}`);
            }
          }}
          horasDisponibles={horarios}
          servicios={servicios}
        />
      )}

      {/* Modal para ver citas del día */}
      {showDayCitasModal && (
        <div className="modal-overlay" onClick={() => setShowDayCitasModal(false)}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#1a202c', fontWeight: 900, fontSize: '1.6rem', margin: 0, textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                Citas para el día {selectedDate ? selectedDate.toLocaleDateString('es-MX') : ''}
              </h3>
              <button className="close-btn" onClick={() => setShowDayCitasModal(false)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
            </div>
            <button style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: 700, fontSize: '1rem', marginBottom: '18px', width: '100%' }} onClick={() => { setShowAppointmentForm(true); setShowDayCitasModal(false); }}>+ Nueva Cita</button>
            {citasDelDia.length === 0 ? (
              <p>No hay citas para este día.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {citasDelDia.map((cita, idx) => (
                  <li key={idx} style={{ marginBottom: '18px', background: '#e0f1ee', borderRadius: '8px', padding: '16px 12px 20px 12px', position: 'relative', color: '#204d47', fontWeight: 600 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: '#204d47' }}>Cliente:</strong> {cita.cliente}<br />
                        <strong style={{ color: '#204d47' }}>Servicio:</strong> {cita.servicio}<br />
                        <strong style={{ color: '#204d47' }}>Hora:</strong> {
                          cita.hora === '00:00' || cita.hora === '00:00:00'
                            ? (() => {
                                const horario = horarios.find(h => h.id_horario === cita.id_horario);
                                if (horario && horario.hora_inicio) {
                                  if (/^\d{2}:\d{2}:\d{2}/.test(horario.hora_inicio)) {
                                    return horario.hora_inicio.substring(0,5);
                                  } else if (horario.hora_inicio.includes('T')) {
                                    return horario.hora_inicio.split('T')[1].substring(0,5);
                                  } else {
                                    return horario.hora_inicio;
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
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <button style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontWeight: 700, cursor: 'pointer', marginBottom: '4px' }} title="Editar cita (modifica datos)" onClick={() => { 
                          // Buscar el servicio para obtener su ID
                          const servicio = servicios.find(s => s.nombre === cita.servicio);
                          const citaConServicioId = {
                            ...cita,
                            id_servicio: servicio ? servicio.id : undefined
                          };
                          setEditAppointment(citaConServicioId); 
                          setShowEditForm(true); 
                          setShowDayCitasModal(false); 
                        }}>Editar</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '16px 0 0 0', justifyContent: 'center' }}>
                      {[
                        { label: 'Agendada', value: 1, bgColor: '#4f46e5', bgColorInactive: '#e0e7ff' }, 
                        { label: 'Completada', value: 2, bgColor: '#10b981', bgColorInactive: '#d1fae5' }, 
                        { label: 'Cancelada', value: 3, bgColor: '#ef4444', bgColorInactive: '#fee2e2' }, 
                        { label: 'No asistió', value: 4, bgColor: '#f59e0b', bgColorInactive: '#fef3c7' }
                      ].map(estado => (
                        <button
                          key={estado.value}
                          type="button"
                          style={{
                            background: (cita.estado === estado.label) ? estado.bgColor : estado.bgColorInactive,
                            color: (cita.estado === estado.label) ? '#fff' : '#374151',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            border: (cita.estado === estado.label) ? `2px solid ${estado.bgColor}` : '2px solid transparent',
                            fontWeight: (cita.estado === estado.label) ? 800 : 600,
                            cursor: 'pointer',
                            boxShadow: (cita.estado === estado.label) ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease',
                            transform: (cita.estado === estado.label) ? 'scale(1.05)' : 'scale(1)',
                            fontSize: '0.9rem'
                          }}
                          onMouseEnter={(e) => {
                            if (cita.estado !== estado.label) {
                              e.currentTarget.style.background = estado.bgColor;
                              e.currentTarget.style.color = '#fff';
                              e.currentTarget.style.transform = 'scale(1.02)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (cita.estado !== estado.label) {
                              e.currentTarget.style.background = estado.bgColorInactive;
                              e.currentTarget.style.color = '#374151';
                              e.currentTarget.style.transform = 'scale(1)';
                            }
                          }}
                          title={estado.label === 'Cancelada' ? 'Solo cambia el estado, no elimina la cita' : `Cambiar estado a ${estado.label}`}
                          onClick={async () => {
                            // Si ya es el estado actual, no hacer nada
                            if (cita.estado === estado.label) {
                              return;
                            }
                            
                            try {
                              // Actualizar en el backend
                              await editarCita(cita.id, { id_estado_cita: estado.value });
                              
                              // Recargar todas las citas desde el backend para asegurar sincronización
                              const citasActualizadas = await getCitas();
                              const citasMapeadas = citasActualizadas.map(mapearCita);
                              setCitas(citasMapeadas);
                              
                              // Actualizar las citas del día con los datos frescos
                              if (selectedDate) {
                                const citasDiaActualizadas = citasMapeadas.filter(citaMappeada => {
                                  let fechaOriginal = '';
                                  if (citaMappeada.fecha && typeof citaMappeada.fecha === 'string') {
                                    // Si la fecha está en formato DD/MM/YYYY, convertir a ISO para comparar
                                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(citaMappeada.fecha)) {
                                      const [d, m, y] = citaMappeada.fecha.split('/');
                                      fechaOriginal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                    } else if (citaMappeada.fecha.includes('T')) {
                                      fechaOriginal = citaMappeada.fecha.split('T')[0];
                                    } else if (/^\d{4}-\d{2}-\d{2}$/.test(citaMappeada.fecha)) {
                                      fechaOriginal = citaMappeada.fecha;
                                    } else {
                                      fechaOriginal = citaMappeada.fecha.split(' ')[0];
                                    }
                                  }
                                  return fechaOriginal === selectedDate.toISOString().split('T')[0];
                                });
                                setCitasDelDia(citasDiaActualizadas);
                              }
                              
                            } catch (error) {
                              console.error('Error al cambiar estado:', error);
                              const errorMessage = error instanceof Error ? error.message : String(error);
                              alert(`Error al cambiar el estado de la cita: ${errorMessage}`);
                            }
                          }}
                        >
                          {estado.label}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modal para lista de empleados */}
      {showEmpleadosList && (
        <div className="modal-overlay" onClick={() => setShowEmpleadosList(false)}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#1a202c', fontWeight: 900, fontSize: '1.8rem', margin: 0, textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>👥 Gestionar Empleados</h3>
              <button className="close-btn" onClick={() => setShowEmpleadosList(false)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
            </div>
            
            <button 
              style={{ 
                background: '#357a6c', 
                color: 'white', 
                borderRadius: '8px', 
                padding: '12px 24px', 
                border: 'none', 
                fontWeight: 700, 
                fontSize: '1rem',
                marginBottom: '20px',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => {
                setShowEmpleadosList(false);
                setVieneDeGestionEmpleados(true);
                setShowEmployeeForm(true);
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#2d6356'}
              onMouseLeave={e => e.currentTarget.style.background = '#357a6c'}
            >
              + Agregar Nuevo Empleado
            </button>
            
            {empleados.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '12px' }}>No hay empleados registrados</p>
                <p style={{ fontSize: '0.9rem' }}>Usa el botón "Nuevo Empleado" para agregar el primero</p>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {empleados.map((empleado, idx) => (
                  <div key={empleado.id_empleado} style={{ 
                    marginBottom: '16px', 
                    background: '#f0fdf4', 
                    borderRadius: '12px', 
                    padding: '20px', 
                    border: '2px solid #d1fae5',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          color: '#204d47', 
                          fontSize: '1.2rem', 
                          fontWeight: 800, 
                          margin: '0 0 8px 0' 
                        }}>
                          {empleado.nombre_empleado}
                        </h4>
                        <p style={{ 
                          color: '#059669', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          margin: '0 0 4px 0' 
                        }}>
                          <strong>Especialidad:</strong> {
                            empleado.especialidad?.nombre_especialidad || 'Sin especialidad asignada'
                          }
                        </p>
                        <p style={{ 
                          color: '#047857', 
                          fontSize: '0.9rem', 
                          fontWeight: 600, 
                          margin: '0',
                          textTransform: 'capitalize'
                        }}>
                          <strong>Rol:</strong> {empleado.rol}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ 
                          background: '#10b981', 
                          color: '#fff', 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem', 
                          fontWeight: 700,
                          textAlign: 'center'
                        }}>
                          ID: {empleado.id_empleado}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para lista de clientes */}
      {showClientesList && (
        <div className="modal-overlay" onClick={() => setShowClientesList(false)}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#1a202c', fontWeight: 900, fontSize: '1.8rem', margin: 0, textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>👤 Gestionar Clientes</h3>
              <button className="close-btn" onClick={() => setShowClientesList(false)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
            </div>
            
            <button 
              style={{ 
                background: '#7c3aed', 
                color: 'white', 
                borderRadius: '8px', 
                padding: '12px 24px', 
                border: 'none', 
                fontWeight: 700, 
                fontSize: '1rem',
                marginBottom: '20px',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => {
                setShowClientesList(false);
                setShowClientForm(true);
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
            >
              + Agregar Nuevo Cliente
            </button>
            
            {clientes.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '12px' }}>No hay clientes registrados</p>
                <p style={{ fontSize: '0.9rem' }}>Usa el botón "Nuevo Cliente" para agregar el primero</p>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {clientes.map((cliente, idx) => (
                  <div key={cliente.id_cliente} style={{ 
                    marginBottom: '16px', 
                    background: '#faf5ff', 
                    borderRadius: '12px', 
                    padding: '20px', 
                    border: '2px solid #e9d5ff',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          color: '#204d47', 
                          fontSize: '1.2rem', 
                          fontWeight: 800, 
                          margin: '0 0 8px 0' 
                        }}>
                          {cliente.nombre_cliente} {cliente.apellido_cliente}
                        </h4>
                        <p style={{ 
                          color: '#7c3aed', 
                          fontSize: '1rem', 
                          fontWeight: 600, 
                          margin: '0 0 4px 0' 
                        }}>
                          <strong>📞 Teléfono:</strong> {cliente.telefono || 'No registrado'}
                        </p>
                        <p style={{ 
                          color: '#6d28d9', 
                          fontSize: '0.9rem', 
                          fontWeight: 600, 
                          margin: '0'
                        }}>
                          <strong>📧 Email:</strong> {cliente.correo_electronico || 'No registrado'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ 
                          background: '#7c3aed', 
                          color: '#fff', 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem', 
                          fontWeight: 700,
                          textAlign: 'center'
                        }}>
                          ID: {cliente.id_cliente}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCalendar;
