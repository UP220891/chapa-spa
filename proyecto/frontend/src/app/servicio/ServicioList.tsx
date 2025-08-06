import React, { useState } from 'react';
import styles from '../../styles/ServicioList.module.css';

interface Servicio {
  id?: number;
  nombre?: string;
  descripcion?: string;
  duracion?: string | number;
  precio?: number | string;
  imagen?: string;
  // Campos del backend
  id_servicio?: number;
  nombre_servicio?: string;
}

interface ServicioListProps {
  servicios: Servicio[];
}

const ServicioList: React.FC<ServicioListProps> = ({ servicios }) => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [formData, setFormData] = useState({
    nombre_servicio: '',
    descripcion: '',
    duracion: '',
    precio: '',
    imagen: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  // Efecto para manejar las notificaciones
  React.useEffect(() => {
    if (notification) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => setNotification(null), 400);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Obtener usuario del localStorage
  let usuario: any = null;
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try { 
        usuario = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing usuario:', e);
      }
    }
  }

  // Funciones de editar y borrar (puedes conectar con backend)
  const handleEditar = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setFormData({
      nombre_servicio: servicio.nombre_servicio || servicio.nombre || '',
      descripcion: servicio.descripcion || '',
      duracion: String(servicio.duracion || ''),
      precio: String(servicio.precio || ''),
      imagen: servicio.imagen || ''
    });
    if (servicio.imagen) {
      setImagePreview(servicio.imagen);
    }
    setShowEditModal(true);
  };
  const handleBorrar = async (id: number) => {
    if (window.confirm('¿Seguro que quieres borrar este servicio?')) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : undefined;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_URL}/api/servicios/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          setNotification({ type: 'success', message: 'Servicio eliminado correctamente' });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          let errorMsg = 'Error desconocido';
          try {
            const data = await res.json();
            errorMsg = data?.error || errorMsg;
          } catch {
            errorMsg = 'No se pudo leer el error del backend';
          }
          setNotification({ type: 'error', message: `Error al eliminar: ${errorMsg}` });
        }
      } catch (err: any) {
        setNotification({ type: 'error', message: `Error al eliminar: ${err?.message || 'Error desconocido'}` });
      }
    }
  };

  const handleAgregarServicio = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setImagePreview('');
    setFormData({
      nombre_servicio: '',
      descripcion: '',
      duracion: '',
      precio: '',
      imagen: ''
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingServicio(null);
    setImagePreview('');
    setFormData({
      nombre_servicio: '',
      descripcion: '',
      duracion: '',
      precio: '',
      imagen: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si es el campo de imagen URL, actualizar preview
    if (name === 'imagen' && value) {
      setImagePreview(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar que sea una imagen
      if (file.type.startsWith('image/')) {
        // Verificar tamaño del archivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setNotification({ type: 'error', message: 'La imagen es muy grande. Máximo 5MB permitido.' });
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImagePreview(result);
          setFormData(prev => ({
            ...prev,
            imagen: result // Guardar la imagen como base64 data URL
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setNotification({ type: 'error', message: 'Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.)' });
      }
    }
  };

  const handleSubmitServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.nombre_servicio.trim() || !formData.duracion || !formData.precio) {
      setNotification({ type: 'error', message: 'Por favor completa todos los campos obligatorios (Nombre, Duración y Precio)' });
      return;
    }

    setLoading(true);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : undefined;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const servicioData = {
        nombre_servicio: formData.nombre_servicio.trim(),
        descripcion: formData.descripcion.trim() || null,
        duracion: parseInt(formData.duracion),
        precio: parseFloat(formData.precio),
        imagen: formData.imagen.trim() || null
      };

      const res = await fetch(`${API_URL}/api/servicios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(servicioData)
      });

      if (res.ok) {
        setNotification({ type: 'success', message: '¡Servicio creado exitosamente!' });
        handleCloseModal();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        let errorMsg = 'Error desconocido';
        try {
          const data = await res.json();
          errorMsg = data?.error || errorMsg;
        } catch {
          errorMsg = 'No se pudo leer el error del backend';
        }
        setNotification({ type: 'error', message: `Error al crear servicio: ${errorMsg}` });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: `Error al crear servicio: ${err?.message || 'Error desconocido'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingServicio) return;
    
    // Validar campos obligatorios
    if (!formData.nombre_servicio.trim() || !formData.duracion || !formData.precio) {
      setNotification({ type: 'error', message: 'Por favor completa todos los campos obligatorios (Nombre, Duración y Precio)' });
      return;
    }

    setLoading(true);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : undefined;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const servicioData = {
        nombre_servicio: formData.nombre_servicio.trim(),
        descripcion: formData.descripcion.trim() || null,
        duracion: parseInt(formData.duracion),
        precio: parseFloat(formData.precio),
        imagen: formData.imagen.trim() || null
      };

      const servicioId = editingServicio.id_servicio || editingServicio.id;
      const res = await fetch(`${API_URL}/api/servicios/${servicioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(servicioData)
      });

      if (res.ok) {
        setNotification({ type: 'success', message: '¡Servicio actualizado exitosamente!' });
        handleCloseEditModal();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        let errorMsg = 'Error desconocido';
        try {
          const data = await res.json();
          errorMsg = data?.error || errorMsg;
        } catch {
          errorMsg = 'No se pudo leer el error del backend';
        }
        setNotification({ type: 'error', message: `Error al actualizar servicio: ${errorMsg}` });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: `Error al actualizar servicio: ${err?.message || 'Error desconocido'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.servicioList}>
      {/* Notificación emergente */}
      {notification && (
        <div
          className={`notification-popup ${notification.type} ${showNotification ? 'show' : 'hide'}`}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            zIndex: 1001,
            background: notification.type === 'error' ? '#fee' : '#efe',
            color: notification.type === 'error' ? '#c53030' : '#38a169',
            padding: '16px 24px',
            borderRadius: '12px',
            border: `2px solid ${notification.type === 'error' ? '#fed7d7' : '#c6f6d5'}`,
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: '1rem',
            maxWidth: '500px',
            textAlign: 'center',
            opacity: showNotification ? 1 : 0,
            transition: 'all 0.4s ease-in-out',
            transform: showNotification ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-20px)'
          }}
        >
          {notification.message}
          <button
            onClick={() => {
              setShowNotification(false);
              setTimeout(() => setNotification(null), 400);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              marginLeft: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              padding: '0 4px'
            }}
          >
            ×
          </button>
        </div>
      )}
      <style jsx global>{`
        .modal-input, .modal-textarea, 
        input[type="text"], input[type="number"], input[type="url"], textarea {
          color: #333 !important;
          background-color: #fff !important;
        }
        .modal-input::placeholder, .modal-textarea::placeholder,
        input::placeholder, textarea::placeholder {
          color: #666 !important;
          opacity: 1 !important;
        }
        /* Específico para modales */
        div[style*="zIndex: 1000"] input,
        div[style*="zIndex: 1000"] textarea {
          color: #333 !important;
          background-color: #fff !important;
        }
        div[style*="zIndex: 1000"] input::placeholder,
        div[style*="zIndex: 1000"] textarea::placeholder {
          color: #666 !important;
          opacity: 1 !important;
        }
        
        /* Animaciones para el modal */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Efectos de hover suaves */
        input:focus, textarea:focus {
          outline: none !important;
        }
        
        /* Scroll personalizado para el modal */
        div[style*="overflowY: auto"]::-webkit-scrollbar {
          width: 8px;
        }
        
        div[style*="overflowY: auto"]::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #204d47 0%, #357a6c 100%);
          border-radius: 10px;
        }
        
        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #1a3f3a 0%, #2d6b5f 100%);
        }
      `}</style>
      
      {servicios.map((servicio, idx) => {
        // Mapeo para datos del backend
        const nombre = servicio.nombre_servicio || servicio.nombre;
        const descripcion = servicio.descripcion;
        const id = servicio.id_servicio ?? servicio.id;
        const duracion = servicio.duracion;
        const precio = servicio.precio;
        const imagen = servicio.imagen;
        return (
          <div key={id ?? idx} className={styles.servicioCard}>
            <h2 className={styles.servicioNombre}>{nombre}</h2>
            <img src={imagen} alt={nombre} className={styles.servicioImage} />
            <p className={styles.servicioDescripcion}>{descripcion}</p>
            <p className={styles.servicioDuracion}><b>Duración:</b> {duracion}</p>
            <p className={styles.servicioPrecio}>${Number(precio).toFixed(2)}</p>
            {(usuario && usuario.tipo === 'cliente') && (
              <button
                className={styles.reservaBtn}
                onClick={() => {
                  // Usar el nombre del servicio para autocompletar
                  const nombreServicio = (nombre ?? '').toLowerCase();
                  window.location.href = `/citas?servicio=${encodeURIComponent(nombreServicio)}`;
                }}
              >
                Reserva ahora
              </button>
            )}
            {(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado') && id !== undefined) && (
              <div style={{marginTop:'1.5rem',display:'flex',gap:'12px',justifyContent:'center'}}>
                <button 
                  style={{
                    background: 'linear-gradient(135deg, #f5a623 0%, #f76b1c 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(245, 166, 35, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleEditar(servicio)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 166, 35, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 166, 35, 0.3)';
                  }}
                >
                  Editar
                </button>
                <button 
                  style={{
                    background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleBorrar(id!)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(211, 47, 47, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(211, 47, 47, 0.3)';
                  }}
                >
                  Borrar
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Botón flotante para agregar servicio - solo para admin/empleados */}
      {(usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado')) && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 999
        }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #204d47 0%, #357a6c 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(32, 77, 71, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={handleAgregarServicio}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(32, 77, 71, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(32, 77, 71, 0.3)';
            }}
            title="Agregar nuevo servicio"
          >
            +
          </button>
        </div>
      )}

      {/* Modal para agregar servicio */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '24px',
            padding: '0',
            maxWidth: '550px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transform: 'scale(1)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {/* Header del modal */}
            <div style={{
              background: 'linear-gradient(135deg, #204d47 0%, #2d6b5f 50%, #357a6c 100%)',
              borderRadius: '24px 24px 0 0',
              padding: '32px 40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-30%',
                left: '-5%',
                width: '150px',
                height: '150px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                borderRadius: '50%'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.75rem',
                  margin: 0,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  Nuevo Servicio
                </h3>
                <p style={{
                  color: 'rgba(255,255,255,0.9)',
                  margin: '8px 0 0 0',
                  fontSize: '0.95rem',
                  fontWeight: 400
                }}>
                  Crea un nuevo servicio para tu spa
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  fontSize: '1.8rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  zIndex: 1
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            </div>

            {/* Contenido del modal */}
            <div style={{ padding: '40px' }}>
              <form onSubmit={handleSubmitServicio}>
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px', 
                    fontWeight: 700, 
                    color: '#204d47',
                    fontSize: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      Nombre del Servicio *
                    </div>
                  </label>
                  <input
                    type="text"
                    name="nombre_servicio"
                    value={formData.nombre_servicio}
                    onChange={handleInputChange}
                    placeholder="Ej: Masaje Relajante, Facial Hidratante..."
                    maxLength={50}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e8f5f3',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s ease',
                      background: '#fafcfb',
                      fontWeight: 500
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#204d47';
                      e.target.style.background = '#fff';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(32, 77, 71, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e8f5f3';
                      e.target.style.background = '#fafcfb';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px', 
                    fontWeight: 700, 
                    color: '#204d47',
                    fontSize: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      Descripción
                    </div>
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Describe los beneficios y características del servicio..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e8f5f3',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      minHeight: '100px',
                      transition: 'all 0.3s ease',
                      background: '#fafcfb',
                      fontWeight: 500,
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#204d47';
                      e.target.style.background = '#fff';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(32, 77, 71, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e8f5f3';
                      e.target.style.background = '#fafcfb';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '28px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '10px', 
                      fontWeight: 700, 
                      color: '#204d47',
                      fontSize: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        Duración *
                      </div>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        name="duracion"
                        value={formData.duracion}
                        onChange={handleInputChange}
                        placeholder="60"
                        min="1"
                        required
                        style={{
                          width: '100%',
                          padding: '16px 20px 16px 50px',
                          border: '2px solid #e8f5f3',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          boxSizing: 'border-box',
                          transition: 'all 0.3s ease',
                          background: '#fafcfb',
                          fontWeight: 500
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#204d47';
                          e.target.style.background = '#fff';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 8px 25px rgba(32, 77, 71, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e8f5f3';
                          e.target.style.background = '#fafcfb';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        left: '18px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}>min</span>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '10px', 
                      fontWeight: 700, 
                      color: '#204d47',
                      fontSize: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        Precio *
                      </div>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleInputChange}
                        placeholder="150.00"
                        min="0"
                        step="0.01"
                        required
                        style={{
                          width: '100%',
                          padding: '16px 20px 16px 45px',
                          border: '2px solid #e8f5f3',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          boxSizing: 'border-box',
                          transition: 'all 0.3s ease',
                          background: '#fafcfb',
                          fontWeight: 500
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#204d47';
                          e.target.style.background = '#fff';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 8px 25px rgba(32, 77, 71, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e8f5f3';
                          e.target.style.background = '#fafcfb';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        left: '18px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666',
                        fontSize: '1.1rem',
                        fontWeight: 700
                      }}>$</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '12px', 
                    fontWeight: 700, 
                    color: '#204d47',
                    fontSize: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      Imagen del Servicio
                    </div>
                  </label>
                  
                  {/* Opciones de imagen */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <label style={{ 
                        background: 'linear-gradient(135deg, #f8fffe 0%, #e8f5f3 100%)', 
                        border: '2px dashed #204d47', 
                        borderRadius: '16px', 
                        padding: '24px', 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        flex: 1,
                        transition: 'all 0.3s ease',
                        fontWeight: 600,
                        color: '#204d47'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #e8f5f3 0%, #d1ede8 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(32, 77, 71, 0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f8fffe 0%, #e8f5f3 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                        <div style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 600 }}>Archivo</div>
                        <div>Subir desde dispositivo</div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                          JPG, PNG, GIF (max 5MB)
                        </div>
                      </label>
                    </div>
                    
                    <div style={{ 
                      textAlign: 'center', 
                      margin: '16px 0', 
                      color: '#666',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(to right, transparent, #ddd, transparent)'
                      }}></div>
                      <span style={{
                        background: 'white',
                        padding: '0 16px',
                        fontSize: '0.9rem',
                        fontWeight: 500
                      }}>o ingresa una URL</span>
                    </div>
                    
                    <input
                      type="url"
                      name="imagen"
                      value={formData.imagen.startsWith('data:') ? '' : formData.imagen}
                      onChange={handleInputChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid #e8f5f3',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease',
                        background: '#fafcfb',
                        fontWeight: 500
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#204d47';
                        e.target.style.background = '#fff';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(32, 77, 71, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e8f5f3';
                        e.target.style.background = '#fafcfb';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Preview de la imagen */}
                  {imagePreview && (
                    <div style={{ 
                      marginTop: '20px', 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #f8fffe 0%, #e8f5f3 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '2px solid #e8f5f3'
                    }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '250px', 
                          maxHeight: '200px', 
                          borderRadius: '12px',
                          objectFit: 'cover',
                          border: '3px solid #fff',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <div style={{ marginTop: '12px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, imagen: '' }));
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          Quitar imagen
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '16px',
                  marginTop: '40px',
                  paddingTop: '24px',
                  borderTop: '1px solid #e8f5f3'
                }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      color: '#495057',
                      borderRadius: '12px',
                      padding: '14px 28px',
                      border: '2px solid #dee2e6',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      minWidth: '120px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: loading 
                        ? 'linear-gradient(135deg, #ccc 0%, #aaa 100%)' 
                        : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '14px 28px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      minWidth: '160px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #3730a3 0%, #6b21a8 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(79, 70, 229, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!loading) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          border: '2px solid #fff',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        Creando...
                      </div>
                    ) : (
                      'Crear Servicio'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar servicio */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '0',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 24px rgba(31,38,135,0.13)'
          }}>
            {/* Header del modal */}
            <div style={{
              background: '#204d47',
              borderRadius: '16px 16px 0 0',
              padding: '24px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.5rem',
                margin: 0
              }}>
                ✏️ Editar Servicio
              </h3>
              <button
                onClick={handleCloseEditModal}
                style={{
                  fontSize: '1.5rem',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {/* Contenido del modal */}
            <div style={{ padding: '32px' }}>
              <form onSubmit={handleSubmitEditServicio}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#204d47' }}>
                    Nombre del Servicio *
                  </label>
                  <input
                    type="text"
                    name="nombre_servicio"
                    value={formData.nombre_servicio}
                    onChange={handleInputChange}
                    placeholder="Ej: Masaje Relajante"
                    maxLength={50}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#204d47' }}>
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Describe el servicio..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#204d47' }}>
                      Duración (minutos) *
                    </label>
                    <input
                      type="number"
                      name="duracion"
                      value={formData.duracion}
                      onChange={handleInputChange}
                      placeholder="60"
                      min="1"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#204d47' }}>
                      Precio ($) *
                    </label>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      placeholder="150.00"
                      min="0"
                      step="0.01"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#204d47' }}>
                    Imagen del Servicio
                  </label>
                  
                  {/* Opciones de imagen */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <label style={{ 
                        background: '#f8f9fa', 
                        border: '2px dashed #204d47', 
                        borderRadius: '8px', 
                        padding: '20px', 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        flex: 1,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#e8f5f3';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#f8f9fa';
                      }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                        Cambiar imagen
                      </label>
                    </div>
                    
                    <div style={{ textAlign: 'center', margin: '8px 0', color: '#666' }}>o</div>
                    
                    <input
                      type="url"
                      name="imagen"
                      value={formData.imagen.startsWith('data:') ? '' : formData.imagen}
                      onChange={handleInputChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Preview de la imagen */}
                  {imagePreview && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '150px', 
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '2px solid #e0e0e0'
                        }} 
                      />
                      <div style={{ marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, imagen: '' }));
                          }}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    style={{
                      background: '#eee',
                      color: '#204d47',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: loading ? '#ccc' : '#f5a623',
                      color: 'white',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      border: 'none',
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Servicio'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicioList;