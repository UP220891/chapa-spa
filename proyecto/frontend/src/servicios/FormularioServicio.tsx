import React, { useState } from "react";
import { crearServicio, ServicioNuevo } from "../servicios/serviciosService";

interface Props {
  token?: string;
  onServicioCreado?: () => void;
}

const FormularioServicio: React.FC<Props> = ({ token, onServicioCreado }) => {
  const [form, setForm] = useState<ServicioNuevo>({
    nombre: "",
    descripcion: "",
    duracion: "",
    precio: 0,
    imagen: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "precio" ? Number(value) : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar que sea una imagen
      if (file.type.startsWith('image/')) {
        // Verificar tamaño del archivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('La imagen es muy grande. Máximo 5MB permitido.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImagePreview(result);
          setForm(prev => ({ ...prev, imagen: result }));
        };
        reader.readAsDataURL(file);
      } else {
        setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.)');
      }
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setForm(prev => ({ ...prev, imagen: url }));
    if (url && !url.startsWith('data:')) {
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validar campos obligatorios
    if (!form.nombre.trim() || !form.duracion || !form.precio) {
      setError('Por favor completa todos los campos obligatorios (Nombre, Duración y Precio)');
      setLoading(false);
      return;
    }

    try {
      await crearServicio(form, token);
      setSuccess("¡Servicio creado exitosamente!");
      setForm({ nombre: "", descripcion: "", duracion: "", precio: 0, imagen: "" });
      setImagePreview("");
      if (onServicioCreado) onServicioCreado();
    } catch (err: any) {
      setError(`Error al crear servicio: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <style jsx global>{`
        /* Animaciones */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .form-container {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Estilos de focus */
        input:focus, textarea:focus {
          outline: none !important;
        }
      `}</style>

      {/* Notificaciones */}
      {error && (
        <div style={{
          background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
          color: '#c53030',
          padding: '16px 24px',
          borderRadius: '12px',
          border: '2px solid #fed7d7',
          marginBottom: '24px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(197, 48, 48, 0.1)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: 'linear-gradient(135deg, #efe 0%, #dfd 100%)',
          color: '#38a169',
          padding: '16px 24px',
          borderRadius: '12px',
          border: '2px solid #c6f6d5',
          marginBottom: '24px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(56, 161, 105, 0.1)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {success}
        </div>
      )}

      <div className="form-container" style={{
        backgroundColor: '#fff',
        borderRadius: '24px',
        padding: '0',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #204d47 0%, #2d6b5f 50%, #357a6c 100%)',
          padding: '32px 40px',
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
            <h2 style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.75rem',
              margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              Agregar nuevo servicio
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              margin: '8px 0 0 0',
              fontSize: '0.95rem',
              fontWeight: 400
            }}>
              Crea un nuevo servicio para tu spa
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
          {/* Campo Nombre */}
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
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Masaje Relajante, Facial Hidratante..."
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

          {/* Campo Descripción */}
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
              value={form.descripcion}
              onChange={handleChange}
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

          {/* Campos Duración y Precio */}
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
                  name="duracion"
                  value={form.duracion}
                  onChange={handleChange}
                  placeholder="60"
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
                  name="precio"
                  type="number"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="150.00"
                  required
                  min={0}
                  step="0.01"
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

          {/* Campo Imagen */}
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
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>Archivo</div>
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
                name="imagen"
                type="url"
                value={form.imagen.startsWith('data:') ? '' : form.imagen}
                onChange={handleImageUrlChange}
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
                      setForm(prev => ({ ...prev, imagen: '' }));
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

          {/* Botón de envío */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid #e8f5f3'
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading 
                  ? 'linear-gradient(135deg, #ccc 0%, #aaa 100%)' 
                  : 'linear-gradient(135deg, #204d47 0%, #357a6c 100%)',
                color: 'white',
                borderRadius: '12px',
                padding: '16px 40px',
                border: 'none',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '200px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1a3f3a 0%, #2d6b5f 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(32, 77, 71, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #204d47 0%, #357a6c 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Guardando...
                </div>
              ) : (
                'Guardar servicio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioServicio;
