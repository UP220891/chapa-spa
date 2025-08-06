"use client";
// Tipos locales para evitar errores de compilación
import React, { useEffect, useState } from 'react';
import Navbar from '../app/components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { crearCita, editarCita, getCitas } from '../servicios/citasService';
import { createCliente, getClientes } from '../servicios/clientesService';
import { getServicios } from '../servicios/serviciosService';
import '../styles/notification.css';
import '../styles/manager.css';
import { ProtectedRoute } from './ProtectedRoute';

interface ClienteFormProps {
  onClose: () => void;
  onClienteCreado?: () => void;
}

interface EmpleadoFormProps {
  onClose: () => void;
  onEmpleadoCreado?: () => void;
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
}
// Formulario para crear empleado
const EmpleadoForm: React.FC<EmpleadoFormProps> = ({ onClose, onEmpleadoCreado }) => {
  const [form, setForm] = useState({
    nombre_empleado: '',
    email: '',
    password: '',
    telefono: '',
    id_especialidad: 1,
    rol: 'empleado' as 'empleado' | 'admin'  // Todos los empleados tienen rol empleado
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [fieldErrors, setFieldErrors] = useState({
    nombre_empleado: false,
    email: false,
    password: false,
    telefono: false,
    id_especialidad: false
  });

  // Cargar especialidades al montar el componente
  useEffect(() => {
    async function cargarEspecialidades() {
      try {
        const { obtenerEspecialidades } = await import('../servicios/especialidadService');
        const especialidadesData = await obtenerEspecialidades();
        setEspecialidades(especialidadesData);
      } catch (error) {
        console.error('Error al cargar especialidades:', error);
      }
    }
    cargarEspecialidades();
  }, []);

  // Función para validar campos en tiempo real
  const validateField = (fieldName: string, value: any) => {
    let isValid = true;
    
    switch (fieldName) {
      case 'nombre_empleado':
        isValid = value && value.trim().length > 0;
        break;
      case 'email':
        isValid = value && value.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        break;
      case 'password':
        isValid = value && value.length >= 6;
        break;
      case 'telefono':
        isValid = value && value.trim().length > 0;
        break;
      case 'id_especialidad':
        isValid = value && value > 0;
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
      nombre_empleado: !form.nombre_empleado?.trim(),
      email: !form.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
      password: !form.password || form.password.length < 6,
      telefono: !form.telefono?.trim(),
      id_especialidad: !form.id_especialidad || form.id_especialidad < 1
    };
    
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    if (!validateAllFields()) {
      setError('Por favor completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log('📋 Datos del formulario antes del envío:', {
      nombre_empleado: form.nombre_empleado,
      email: form.email,
      password: '***hidden***',
      telefono: form.telefono,
      id_especialidad: form.id_especialidad,
      rol: form.rol
    });

    try {
      const { crearEmpleado } = await import('../servicios/empleadosService');
      await crearEmpleado({
        nombre_empleado: form.nombre_empleado.trim(),
        email: form.email.trim(),
        password: form.password,
        telefono: form.telefono.trim(),
        id_especialidad: form.id_especialidad,
        rol: form.rol
      });
      
      // Mostrar notificación de éxito
      setNotification({ type: 'success', message: 'Empleado guardado exitosamente' });
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => {
          setNotification(null);
          // Recargar la lista de empleados si se proporciona la función
          if (onEmpleadoCreado) {
            onEmpleadoCreado();
          }
          onClose();
        }, 400);
      }, 3000);
    } catch (error: any) {
      console.error('Error al guardar empleado:', error);
      setError(error.message || 'Error al guardar el empleado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification && (
        <div
          className={`notification-popup ${notification.type} ${showNotification ? 'show' : 'hide'}`}
          style={{ position: 'fixed', top: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
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
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c53030', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            marginBottom: '16px',
            border: '1px solid #feb2b2'
          }}>
            {error}
          </div>
        )}
        
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label>Nombre completo</label>
          <input 
            type="text" 
            value={form.nombre_empleado} 
            onChange={e => {
              const value = e.target.value;
              setForm(f => ({ ...f, nombre_empleado: value }));
              validateField('nombre_empleado', value);
            }}
            onBlur={e => validateField('nombre_empleado', e.target.value)}
            required 
            disabled={loading}
            placeholder="Nombre completo del empleado"
            style={{
              borderColor: fieldErrors.nombre_empleado ? '#e53e3e' : '#ddd',
              backgroundColor: fieldErrors.nombre_empleado ? '#fed7d7' : '#fff'
            }}
          />
          {fieldErrors.nombre_empleado && (
            <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px' }}>
              El nombre es obligatorio
            </span>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label>Email</label>
          <input 
            type="email" 
            value={form.email} 
            onChange={e => {
              const value = e.target.value;
              setForm(f => ({ ...f, email: value }));
              validateField('email', value);
            }}
            onBlur={e => validateField('email', e.target.value)}
            required 
            disabled={loading}
            placeholder="correo@ejemplo.com"
            style={{
              borderColor: fieldErrors.email ? '#e53e3e' : '#ddd',
              backgroundColor: fieldErrors.email ? '#fed7d7' : '#fff'
            }}
          />
          {fieldErrors.email && (
            <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px' }}>
              Ingresa un email válido
            </span>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label>Contraseña</label>
          <input 
            type="password" 
            value={form.password} 
            onChange={e => {
              const value = e.target.value;
              setForm(f => ({ ...f, password: value }));
              validateField('password', value);
            }}
            onBlur={e => validateField('password', e.target.value)}
            required 
            disabled={loading}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            style={{
              borderColor: fieldErrors.password ? '#e53e3e' : '#ddd',
              backgroundColor: fieldErrors.password ? '#fed7d7' : '#fff'
            }}
          />
          {fieldErrors.password && (
            <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px' }}>
              La contraseña debe tener al menos 6 caracteres
            </span>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label>Teléfono</label>
          <input 
            type="tel" 
            value={form.telefono} 
            onChange={e => {
              const value = e.target.value;
              setForm(f => ({ ...f, telefono: value }));
              validateField('telefono', value);
            }}
            onBlur={e => validateField('telefono', e.target.value)}
            required 
            disabled={loading}
            placeholder="Número de teléfono"
            style={{
              borderColor: fieldErrors.telefono ? '#e53e3e' : '#ddd',
              backgroundColor: fieldErrors.telefono ? '#fed7d7' : '#fff'
            }}
          />
          {fieldErrors.telefono && (
            <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px' }}>
              El teléfono es obligatorio
            </span>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label>Especialidad</label>
          <select 
            value={form.id_especialidad} 
            onChange={e => {
              const value = parseInt(e.target.value);
              setForm(f => ({ ...f, id_especialidad: value }));
              validateField('id_especialidad', value);
            }}
            onBlur={e => validateField('id_especialidad', parseInt(e.target.value))}
            required 
            disabled={loading}
            style={{
              borderColor: fieldErrors.id_especialidad ? '#e53e3e' : '#ddd',
              backgroundColor: fieldErrors.id_especialidad ? '#fed7d7' : '#fff'
            }}
          >
            {especialidades.length > 0 ? (
              especialidades.map(esp => (
                <option key={esp.id_especialidad} value={esp.id_especialidad}>
                  {esp.nombre_especialidad}
                </option>
              ))
            ) : (
              <>
                <option value={1}>Masajes</option>
                <option value={2}>Facial</option>
                <option value={3}>Corporal</option>
                <option value={4}>Relajación</option>
              </>
            )}
          </select>
          {fieldErrors.id_especialidad && (
            <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px' }}>
              Selecciona una especialidad
            </span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            type="button" 
            className="btn-cancel-form" 
            onClick={onClose} 
            style={{ 
              background: '#eee', 
              color: '#204d47', 
              borderRadius: '6px', 
              padding: '8px 16px', 
              border: 'none', 
              fontWeight: 700 
            }}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-submit" 
            style={{ 
              background: loading || Object.values(fieldErrors).some(error => error) ? '#ccc' : '#357a6c', 
              color: 'white', 
              borderRadius: '6px', 
              padding: '8px 16px', 
              border: 'none', 
              fontWeight: 700,
              cursor: loading || Object.values(fieldErrors).some(error => error) ? 'not-allowed' : 'pointer'
            }}
            disabled={loading || Object.values(fieldErrors).some(error => error)}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </>
  );
};
// Formulario para crear cliente
const ClienteForm: React.FC<ClienteFormProps> = ({ onClose, onClienteCreado }) => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    fechaNacimiento: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    nombre: false,
    apellido: false,
    telefono: false,
    correo: false,
    fechaNacimiento: false,
    password: false
  });

  // Función para validar campos en tiempo real
  const validateField = (fieldName: string, value: any) => {
    let isValid = true;
    
    switch (fieldName) {
      case 'nombre':
        isValid = value && value.trim().length > 0;
        break;
      case 'apellido':
        isValid = value && value.trim().length > 0;
        break;
      case 'telefono':
        isValid = value && value.trim().length > 0 && /^[\d\s\-\+\(\)]+$/.test(value.trim());
        break;
      case 'correo':
        isValid = value && value.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        break;
      case 'fechaNacimiento':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          isValid = age >= 18 && age <= 100; // Validar edad entre 18 y 100 años
        } else {
          isValid = false;
        }
        break;
      case 'password':
        isValid = value && value.length >= 6;
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
    const today = new Date();
    const birthDate = form.fechaNacimiento ? new Date(form.fechaNacimiento) : null;
    const age = birthDate ? today.getFullYear() - birthDate.getFullYear() : 0;
    
    const errors = {
      nombre: !form.nombre?.trim(),
      apellido: !form.apellido?.trim(),
      telefono: !form.telefono?.trim() || !/^[\d\s\-\+\(\)]+$/.test(form.telefono.trim()),
      correo: !form.correo?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo),
      fechaNacimiento: !form.fechaNacimiento || !birthDate || age < 18 || age > 100,
      password: !form.password || form.password.length < 6
    };
    
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    if (!validateAllFields()) {
      setError('Por favor completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createCliente({
        nombre_cliente: form.nombre,
        apellido_cliente: form.apellido,
        telefono: form.telefono,
        correo_electronico: form.correo,
        fecha_nacimiento: form.fechaNacimiento,
        password: form.password
      });
      
      // Mostrar notificación de éxito
      setNotification({ type: 'success', message: 'Cliente guardado exitosamente' });
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => {
          setNotification(null);
          // Recargar la lista de clientes si se proporciona la función
          if (onClienteCreado) {
            onClienteCreado();
          }
          onClose();
        }, 400);
      }, 3000);
    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      setError(error.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification && (
        <div
          className={`notification-popup ${notification.type} ${showNotification ? 'show' : 'hide'}`}
          style={{ position: 'fixed', top: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
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
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c53030', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            marginBottom: '16px',
            border: '1px solid #feb2b2'
          }}>
            {error}
          </div>
        )}
      
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>Nombre</label>
        <input 
          type="text" 
          value={form.nombre} 
          onChange={e => {
            const value = e.target.value;
            setForm(f => ({ ...f, nombre: value }));
            validateField('nombre', value);
          }}
          onBlur={e => validateField('nombre', e.target.value)}
          required 
          disabled={loading}
          style={{
            borderColor: fieldErrors.nombre ? '#e53e3e' : '#ddd',
            backgroundColor: fieldErrors.nombre ? '#fed7d7' : '#fff'
          }}
        />
        {fieldErrors.nombre && (
          <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
            El nombre es obligatorio
          </span>
        )}
      </div>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>Apellido</label>
        <input 
          type="text" 
          value={form.apellido} 
          onChange={e => {
            const value = e.target.value;
            setForm(f => ({ ...f, apellido: value }));
            validateField('apellido', value);
          }}
          onBlur={e => validateField('apellido', e.target.value)}
          required 
          disabled={loading}
          style={{
            borderColor: fieldErrors.apellido ? '#e53e3e' : '#ddd',
            backgroundColor: fieldErrors.apellido ? '#fed7d7' : '#fff'
          }}
        />
        {fieldErrors.apellido && (
          <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
            El apellido es obligatorio
          </span>
        )}
      </div>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>Teléfono</label>
        <input 
          type="tel" 
          value={form.telefono} 
          onChange={e => {
            const value = e.target.value;
            setForm(f => ({ ...f, telefono: value }));
            validateField('telefono', value);
          }}
          onBlur={e => validateField('telefono', e.target.value)}
          required 
          disabled={loading}
          style={{
            borderColor: fieldErrors.telefono ? '#e53e3e' : '#ddd',
            backgroundColor: fieldErrors.telefono ? '#fed7d7' : '#fff'
          }}
        />
        {fieldErrors.telefono && (
          <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
            Ingresa un número de teléfono válido
          </span>
        )}
      </div>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>Correo</label>
        <input 
          type="email" 
          value={form.correo} 
          onChange={e => {
            const value = e.target.value;
            setForm(f => ({ ...f, correo: value }));
            validateField('correo', value);
          }}
          onBlur={e => validateField('correo', e.target.value)}
          required 
          disabled={loading}
          style={{
            borderColor: fieldErrors.correo ? '#e53e3e' : '#ddd',
            backgroundColor: fieldErrors.correo ? '#fed7d7' : '#fff'
          }}
        />
        {fieldErrors.correo && (
          <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
            Ingresa un email válido
          </span>
        )}
      </div>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>Fecha de Nacimiento</label>
        <input 
          type="date" 
          value={form.fechaNacimiento} 
          onChange={e => {
            const value = e.target.value;
            setForm(f => ({ ...f, fechaNacimiento: value }));
            validateField('fechaNacimiento', value);
          }}
          onBlur={e => validateField('fechaNacimiento', e.target.value)}
          required 
          disabled={loading}
          style={{
            borderColor: fieldErrors.fechaNacimiento ? '#e53e3e' : '#ddd',
            backgroundColor: fieldErrors.fechaNacimiento ? '#fed7d7' : '#fff'
          }}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
          min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
        />
        {fieldErrors.fechaNacimiento && (
          <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
            Debe ser mayor de 18 años
          </span>
        )}
      </div>
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>Contraseña</label>
        <input 
          type="password" 
          value={form.password} 
          onChange={e => {
            const value = e.target.value;
            setForm(f => ({ ...f, password: value }));
            validateField('password', value);
          }}
          onBlur={e => validateField('password', e.target.value)}
          required 
          disabled={loading}
          placeholder="Contraseña para acceder al sistema"
          minLength={6}
          style={{
            borderColor: fieldErrors.password ? '#e53e3e' : '#ddd',
            backgroundColor: fieldErrors.password ? '#fed7d7' : '#fff'
          }}
        />
        {fieldErrors.password && (
          <span style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
            La contraseña debe tener al menos 6 caracteres
          </span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button 
          type="button" 
          className="btn-cancel-form" 
          onClick={onClose} 
          style={{ 
            background: '#eee', 
            color: '#204d47', 
            borderRadius: '6px', 
            padding: '8px 16px', 
            border: 'none', 
            fontWeight: 700 
          }}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-submit" 
          style={{ 
            background: loading || Object.values(fieldErrors).some(error => error) ? '#ccc' : '#357a6c', 
            color: 'white', 
            borderRadius: '6px', 
            padding: '8px 16px', 
            border: 'none', 
            fontWeight: 700,
            cursor: loading || Object.values(fieldErrors).some(error => error) ? 'not-allowed' : 'pointer'
          }}
          disabled={loading || Object.values(fieldErrors).some(error => error)}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
    </>
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
        <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', zIndex: 10, position: 'relative' }}>
          <h3 style={{ color: '#204d47', fontWeight: 800, fontSize: '1.5rem', margin: 0, background: 'white', padding: '8px', borderRadius: '4px', border: '1px solid #204d47' }}>
            Editar cita
          </h3>
          <button className="close-btn" onClick={onClose} style={{ fontSize: '1.5rem', background: 'white', border: '1px solid #204d47', color: '#204d47', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px' }}>×</button>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          
          // Encontrar el id_horario basado en la hora seleccionada
          const horarioSeleccionado = horasDisponibles.find(h => {
            let horaInicio = '';
            if (h.hora_inicio && h.hora_inicio.includes('T')) {
              horaInicio = h.hora_inicio.split('T')[1].substring(0,5);
            } else if (h.hora_inicio) {
              horaInicio = h.hora_inicio.split(':').slice(0,2).join(':');
            }
            return horaInicio === form.hora;
          });
          
          const idHorario = horarioSeleccionado ? horarioSeleccionado.id_horario : form.hora;
          
          console.log('Datos a enviar:', {
            cliente: form.cliente,
            telefono: form.telefono,
            id_servicio: form.servicio,
            id_horario: idHorario,
            notas: form.notas,
            id_estado_cita: form.estado
          });
          
          await onSave({
            cliente: form.cliente,
            telefono: form.telefono,
            id_servicio: form.servicio,
            id_horario: idHorario,
            notas: form.notas,
            id_estado_cita: form.estado
          });
        }}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Cliente</label>
            <input type="text" value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))} required style={{ marginBottom: '8px', width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Teléfono</label>
            <input type="tel" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} required style={{ marginBottom: '8px', width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
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
            <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2} style={{ marginBottom: '8px', width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Estado</label>
            <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: Number(e.target.value) }))} required style={{ marginBottom: '8px', width: '100%' }}>
              <option value={1}>Programada</option>
              <option value={2}>Confirmada</option>
              <option value={3}>En proceso</option>
              <option value={4}>Completada</option>
              <option value={5}>Cancelada</option>
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
  const { user, isAuthenticated } = useAuth();

  return (
    <ProtectedRoute>
      <AdminCalendarContent />
    </ProtectedRoute>
  );
};

const AdminCalendarContent = () => {
  const [showClientForm, setShowClientForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showEmployeesManager, setShowEmployeesManager] = useState(false);
  const [showClientsManager, setShowClientsManager] = useState(false);
  const handleNewAppointment = () => setShowAppointmentForm(true);
  const handleEmployeesManager = () => setShowEmployeesManager(true);
  const handleClientsManager = () => setShowClientsManager(true);
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
      // Usar la fecha original del backend para comparar
      let fechaOriginal = '';
      if (cita.fecha && typeof cita.fecha === 'string') {
        // Si la fecha está en formato DD/MM/YYYY, convertir a ISO para comparar
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(cita.fecha)) {
          const [d, m, y] = cita.fecha.split('/');
          fechaOriginal = `${y}-${m}-${d}`;
        } else if (cita.fecha.includes('T')) {
          fechaOriginal = cita.fecha.split('T')[0];
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(cita.fecha)) {
          fechaOriginal = cita.fecha;
        } else {
          fechaOriginal = cita.fecha.split(' ')[0];
        }
      }
      return fechaOriginal === dateString;
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
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);

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

  // Función para recargar clientes
  const recargarClientes = async () => {
    try {
      const clientesData = await getClientes();
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al recargar clientes:', error);
    }
  };

  // Función para recargar empleados
  const recargarEmpleados = async () => {
    setLoadingEmpleados(true);
    try {
      const { getEmpleados } = await import('../servicios/empleadosService');
      const empleadosData = await getEmpleados();
      setEmpleados(empleadosData);
    } catch (error) {
      console.error('Error al recargar empleados:', error);
    } finally {
      setLoadingEmpleados(false);
    }
  };

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
          console.log('Fecha enviada a backend:', fechaCita);
          return fechaCita;
        })(),
        notas: newAppointment.notas,
        costo_total: servicioObj.precio ?? 0,
        id_estado_cita: 1, // SIEMPRE 'Agendada' por defecto
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
    // Estado: usar c.estado o c.estado_cita o c.nombre_estado_cita
    let estadoRaw = c.estado ?? c.estado_cita ?? c.nombre_estado_cita ?? '';
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
    return {
      id: c.id_cita,
      cliente: c.nombre_cliente,
      servicio: servicioLimpio,
      fecha: fechaFormateada,
      hora: horaFormateada,
      estado: estadoFinal,
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

  // Cargar citas al montar el componente
  useEffect(() => {
    async function cargarCitasIniciales() {
      try {
        const citasActualizadas = await getCitas();
        setCitas(citasActualizadas.map(mapearCita));
      } catch (error) {
        // Puedes mostrar un error si lo necesitas
      }
    }
    cargarCitasIniciales();
  }, []);

  // Cargar empleados cuando se abre el gestor
  useEffect(() => {
    if (showEmployeesManager) {
      recargarEmpleados();
    }
  }, [showEmployeesManager]);

  // Cargar clientes cuando se abre el gestor
  useEffect(() => {
    if (showClientsManager) {
      setLoadingClientes(true);
      recargarClientes().finally(() => setLoadingClientes(false));
    }
  }, [showClientsManager]);

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

  // Componente para gestionar empleados
  const EmpleadosManager = () => {
    const handleEliminarEmpleado = async (id: number) => {
      if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
        try {
          const { eliminarEmpleado } = await import('../servicios/empleadosService');
          await eliminarEmpleado(id);
          alert('Empleado eliminado correctamente');
          recargarEmpleados();
        } catch (error: any) {
          console.error('Error al eliminar empleado:', error);
          // Mostrar el mensaje de error específico del backend
          const mensaje = error.message || 'Error al eliminar empleado';
          alert(mensaje);
        }
      }
    };

    return (
      <div className="modal-overlay" onClick={() => setShowEmployeesManager(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '0', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
          <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#204d47', borderRadius: '16px 16px 0 0', padding: '24px 32px' }}>
            <h3 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>
              👥 Gestión de Empleados
            </h3>
            <button className="close-btn" onClick={() => setShowEmployeesManager(false)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>×</button>
          </div>
          
          <div style={{ padding: '0 32px 32px 32px' }}>
            <div style={{ marginBottom: '20px' }}>
            <button 
              style={{ background: '#357a6c', color: 'white', borderRadius: '8px', padding: '10px 20px', border: 'none', fontWeight: 700, fontSize: '1rem' }} 
              onClick={() => { setShowEmployeeForm(true); setShowEmployeesManager(false); }}
            >
              + Agregar Nuevo Empleado
            </button>
          </div>

          {loadingEmpleados ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Cargando empleados...
            </div>
          ) : empleados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No hay empleados registrados
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#495057', fontWeight: 600 }}>Nombre</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#495057', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#495057', fontWeight: 600 }}>Teléfono</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#495057', fontWeight: 600 }}>Especialidad</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#495057', fontWeight: 600 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map((empleado) => (
                    <tr key={empleado.id_empleado} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px', color: '#495057' }}>{empleado.nombre_empleado}</td>
                      <td style={{ padding: '12px', color: '#495057' }}>{empleado.email}</td>
                      <td style={{ padding: '12px', color: '#495057' }}>{empleado.telefono || 'N/A'}</td>
                      <td style={{ padding: '12px', color: '#495057' }}>
                        {empleado.especialidad?.nombre_especialidad || 'Sin especialidad'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleEliminarEmpleado(empleado.id_empleado)}
                          style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '0.875rem', cursor: 'pointer' }}
                          title="Eliminar empleado"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  };

  // Componente para gestionar clientes
  const ClientesManager = () => {
    const handleEliminarCliente = async (id: number) => {
      if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        try {
          const { deleteCliente } = await import('../servicios/clientesService');
          await deleteCliente(id);
          recargarClientes();
        } catch (error: any) {
          console.error('Error al eliminar cliente:', error);
          alert(error.message || 'Error al eliminar cliente');
        }
      }
    };

    return (
      <div className="modal-overlay" onClick={() => setShowClientsManager(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '0', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
          <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#204d47', borderRadius: '16px 16px 0 0', padding: '24px 32px' }}>
            <h3 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>
              📋 Gestión de Clientes
            </h3>
            <button className="close-btn" onClick={() => setShowClientsManager(false)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>×</button>
          </div>
          
          <div style={{ padding: '0 32px 32px 32px' }}>
            <div style={{ marginBottom: '20px' }}>
            <button 
              style={{ background: '#204d47', color: 'white', borderRadius: '8px', padding: '10px 20px', border: 'none', fontWeight: 700, fontSize: '1rem' }} 
              onClick={() => { setShowClientForm(true); setShowClientsManager(false); }}
            >
              + Agregar Nuevo Cliente
            </button>
          </div>

          {loadingClientes ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Cargando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No hay clientes registrados
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#495057', fontWeight: 600 }}>Nombre</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#495057', fontWeight: 600 }}>Apellido</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#495057', fontWeight: 600 }}>Teléfono</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#495057', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#495057', fontWeight: 600 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id_cliente} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px', color: '#495057' }}>{cliente.nombre_cliente}</td>
                      <td style={{ padding: '12px', color: '#495057' }}>{cliente.apellido_cliente}</td>
                      <td style={{ padding: '12px', color: '#495057' }}>{cliente.telefono || 'N/A'}</td>
                      <td style={{ padding: '12px', color: '#495057' }}>{cliente.correo_electronico || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleEliminarCliente(cliente.id_cliente)}
                          style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '0.875rem', cursor: 'pointer' }}
                          title="Eliminar cliente"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      </div>
    );
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
            <button className="btn-manage-employees" style={{ background: '#0891b2', color: 'white', borderRadius: '8px', padding: '0.8rem 2rem', border: 'none', fontWeight: 700, fontSize: '1.1rem', marginRight: '12px' }} onClick={handleEmployeesManager}>
              👥 Gestionar Empleados
            </button>
            <button className="btn-manage-clients" style={{ background: '#7c3aed', color: 'white', borderRadius: '8px', padding: '0.8rem 2rem', border: 'none', fontWeight: 700, fontSize: '1.1rem' }} onClick={handleClientsManager}>
              📋 Gestionar Clientes
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
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', zIndex: 10, position: 'relative' }}>
              <h3 style={{ color: '#204d47', fontWeight: 800, fontSize: '1.5rem', margin: 0, background: 'white', padding: '8px', borderRadius: '4px', border: '1px solid #204d47' }}>
                Nueva cita para el día {selectedDate ? selectedDate.toLocaleDateString('es-MX') : ''}
              </h3>
              <button className="close-btn" onClick={handleCloseAppointmentForm} style={{ fontSize: '1.5rem', background: 'white', border: '1px solid #204d47', color: '#204d47', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px' }}>×</button>
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
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#204d47', fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>Nuevo Cliente</h3>
              <button className="close-btn" onClick={() => setShowClientForm(false)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
            </div>
            <ClienteForm 
              onClose={() => setShowClientForm(false)} 
              onClienteCreado={recargarClientes}
            />
          </div>
        </div>
      )}
      {/* Modal para nuevo empleado */}
      {showEmployeeForm && (
        <div className="modal-overlay" onClick={() => setShowEmployeeForm(false)}>
          <div className="modal-content appointment-form-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', margin: '40px auto', background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(31,38,135,0.13)' }}>
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#204d47', fontWeight: 800, fontSize: '1.3rem', margin: 0 }}>Nuevo Empleado</h3>
              <button className="close-btn" onClick={() => setShowEmployeeForm(false)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: '#204d47', cursor: 'pointer' }}>×</button>
            </div>
            <EmpleadoForm onClose={() => setShowEmployeeForm(false)} onEmpleadoCreado={recargarEmpleados} />
          </div>
        </div>
      )}

      {showEditForm && editAppointment && (
        <EditCitaModal
          editAppointment={editAppointment}
          onClose={() => setShowEditForm(false)}
          onSave={async (nuevaCita) => {
            try {
              await editarCita(editAppointment.id, nuevaCita);
              
              // Recargar todas las citas desde el backend primero
              const citasActualizadas = await getCitas();
              const citasMapeadas = citasActualizadas.map(mapearCita);
              setCitas(citasMapeadas);
              
              // Cerrar el modal de edición
              setShowEditForm(false);
              
              // Si había una fecha seleccionada, reabrir el modal del día con datos actualizados
              if (selectedDate) {
                const dateString = selectedDate.toISOString().split('T')[0];
                const citasDiaActualizadas = citasMapeadas.filter(citaItem => {
                  let fechaOriginal = '';
                  if (citaItem.fecha && typeof citaItem.fecha === 'string') {
                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(citaItem.fecha)) {
                      const [d, m, y] = citaItem.fecha.split('/');
                      fechaOriginal = `${y}-${m}-${d}`;
                    } else if (citaItem.fecha.includes('T')) {
                      fechaOriginal = citaItem.fecha.split('T')[0];
                    } else if (/^\d{4}-\d{2}-\d{2}$/.test(citaItem.fecha)) {
                      fechaOriginal = citaItem.fecha;
                    } else {
                      fechaOriginal = citaItem.fecha.split(' ')[0];
                    }
                  }
                  return fechaOriginal === dateString;
                });
                setCitasDelDia(citasDiaActualizadas);
                setShowDayCitasModal(true); // Reabrir el modal del día
              }
              
              console.log('Cita editada correctamente');
            } catch (error) {
              console.error('Error al editar cita:', error);
              alert('Error al editar la cita');
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
            <div className="modal-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', zIndex: 10, position: 'relative' }}>
              <h3 style={{ color: '#204d47', fontWeight: 800, fontSize: '1.5rem', margin: 0, background: 'white', padding: '8px', borderRadius: '4px', border: '1px solid #204d47' }}>
                Citas para el día {selectedDate ? selectedDate.toLocaleDateString('es-MX') : ''}
              </h3>
              <button className="close-btn" onClick={() => setShowDayCitasModal(false)} style={{ fontSize: '1.5rem', background: 'white', border: '1px solid #204d47', color: '#204d47', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px' }}>×</button>
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
                          setEditAppointment(cita); 
                          setShowEditForm(true); 
                          setShowDayCitasModal(false); // Cerrar el modal del día cuando se abre editar
                        }}>Editar</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '16px 0 0 0', justifyContent: 'center' }}>
                      {[{ label: 'Agendada', value: 1 }, { label: 'Completada', value: 2 }, { label: 'Cancelada', value: 3 }, { label: 'No asistió', value: 4 }].map(estado => (
                        <button
                          key={estado.value}
                          type="button"
                          style={{
                            background: (cita.estado === estado.label) ? '#357a6c' : '#eee',
                            color: (cita.estado === estado.label) ? '#fff' : '#204d47',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: (cita.estado === estado.label) ? '0 2px 8px rgba(31,38,135,0.13)' : 'none'
                          }}
                          title={estado.label === 'Cancelada' ? 'Solo cambia el estado, no elimina la cita' : `Cambiar estado a ${estado.label}`}
                          onClick={async () => {
                            try {
                              // Actualizar inmediatamente la cita en el modal (optimistic update)
                              setCitasDelDia(prevCitas => 
                                prevCitas.map(citaItem => 
                                  citaItem.id === cita.id 
                                    ? { ...citaItem, estado: estado.label }
                                    : citaItem
                                )
                              );
                              
                              // Hacer la llamada al backend
                              await editarCita(cita.id, { id_estado_cita: estado.value });
                              
                              // Actualizar también el estado principal de citas
                              setCitas(prevCitas => 
                                prevCitas.map(citaItem => 
                                  citaItem.id === cita.id 
                                    ? { ...citaItem, estado: estado.label }
                                    : citaItem
                                )
                              );
                              
                              console.log(`Estado de cita ${cita.id} cambiado a: ${estado.label}`);
                            } catch (error) {
                              // Si hay error, revertir el cambio optimista
                              console.error('Error al cambiar estado de cita:', error);
                              alert('Error al cambiar el estado de la cita');
                              
                              // Recargar las citas para restaurar el estado correcto
                              const citasActualizadas = await getCitas();
                              const citasMapeadas = citasActualizadas.map(mapearCita);
                              setCitas(citasMapeadas);
                              
                              if (selectedDate) {
                                const dateString = selectedDate.toISOString().split('T')[0];
                                const citasDiaRestauradas = citasMapeadas.filter(citaItem => {
                                  let fechaOriginal = '';
                                  if (citaItem.fecha && typeof citaItem.fecha === 'string') {
                                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(citaItem.fecha)) {
                                      const [d, m, y] = citaItem.fecha.split('/');
                                      fechaOriginal = `${y}-${m}-${d}`;
                                    } else if (citaItem.fecha.includes('T')) {
                                      fechaOriginal = citaItem.fecha.split('T')[0];
                                    } else if (/^\d{4}-\d{2}-\d{2}$/.test(citaItem.fecha)) {
                                      fechaOriginal = citaItem.fecha;
                                    } else {
                                      fechaOriginal = citaItem.fecha.split(' ')[0];
                                    }
                                  }
                                  return fechaOriginal === dateString;
                                });
                                setCitasDelDia(citasDiaRestauradas);
                              }
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

      {/* Modal para gestionar empleados */}
      {showEmployeesManager && <EmpleadosManager />}

      {/* Modal para gestionar clientes */}
      {showClientsManager && <ClientesManager />}
    </>
  );
};

export default AdminCalendar;
