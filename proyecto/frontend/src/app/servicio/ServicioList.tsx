import React from 'react';
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
  // Obtener usuario del localStorage
  let usuario: any = null;
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try { usuario = JSON.parse(userStr); } catch {}
    }
  }

  // Funciones de editar y borrar (puedes conectar con backend)
  const handleEditar = (servicio: Servicio) => {
    alert('Editar servicio: ' + (servicio.nombre_servicio || servicio.nombre));
    // Aquí puedes abrir un modal o navegar a un formulario de edición
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
          alert('Servicio borrado correctamente');
          window.location.reload();
        } else {
          let errorMsg = 'Error desconocido';
          try {
            const data = await res.json();
            errorMsg = data?.error || errorMsg;
          } catch {
            errorMsg = 'No se pudo leer el error del backend';
          }
          alert('Error al borrar: ' + errorMsg);
        }
      } catch (err: any) {
        alert('Error al borrar: ' + (err?.message || 'Error desconocido'));
      }
    }
  };

  return (
    <div className={styles.servicioList}>
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
            <button
              className={styles.reservaBtn}
              onClick={() => window.location.href = `/citas?servicio=${id}`}
            >
              Reserva ahora
            </button>
            {(usuario && (usuario.rol === 'admin' || usuario.rol === 'empleado') && id !== undefined) && (
              <div style={{marginTop:'1rem',display:'flex',gap:'0.5rem',justifyContent:'center'}}>
                <button style={{background:'#f5a623',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:600,cursor:'pointer'}} onClick={() => handleEditar(servicio)}>Editar</button>
                <button style={{background:'#d32f2f',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontWeight:600,cursor:'pointer'}} onClick={() => handleBorrar(id!)}>Borrar</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ServicioList;