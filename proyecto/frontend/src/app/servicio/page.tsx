'use client';
import React, { useState, useEffect } from 'react';
import ServicioList from './ServicioList';
import Navbar from '../components/Navbar';
import Busqueda from '../../components/busqueda';
import styles from '../../styles/ServicioList.module.css';
import { getServicios, Servicio } from '../../servicios/serviciosService';
import FormularioServicio from '../../servicios/FormularioServicio';

const Page = () => {
  const [busqueda, setBusqueda] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('usuario') : null;
    if (userStr) {
      try {
        setUsuario(JSON.parse(userStr));
      } catch {
        setUsuario(null);
      }
    }
  }, []);

  useEffect(() => {
    async function cargarServicios() {
      try {
        setLoading(true);
        const data = await getServicios();
        setServicios(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar servicios');
      } finally {
        setLoading(false);
      }
    }
    cargarServicios();
  }, []);

  const serviciosFiltrados = servicios.filter(servicio =>
    (servicio.nombre ? servicio.nombre.toLowerCase() : "").includes(busqueda.toLowerCase()) ||
    (servicio.descripcion ? servicio.descripcion.toLowerCase() : "").includes(busqueda.toLowerCase())
  );

  const [showAgregar, setShowAgregar] = useState(false);
   return (
     <div>
       <Navbar usuario={usuario} />
       <h1 className={styles.tituloServicios}>Servicios Disponibles</h1>
       <Busqueda valor={busqueda} onChange={e => setBusqueda(e.target.value)} />
       {(usuario && (usuario.rol === 'admin' || usuario.rol === 'empleado')) && (
         <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
           <button
             onClick={() => setShowAgregar(true)}
             className={styles.reservaBtn}
             style={{
               fontSize: '1rem',
               fontWeight: 700,
               padding: '0.5rem 1.2rem',
               borderRadius: '10px',
               display: 'flex',
               alignItems: 'center',
               gap: '8px',
               boxShadow: '0 2px 8px rgba(32,77,71,0.13)',
               background: 'linear-gradient(90deg, #4f46e5 0%, #357a6c 100%)',
               marginBottom: '1rem',
               marginTop: '0',
               transition: 'background 0.2s'
             }}
           >
             <span style={{ fontSize: '1.2rem', fontWeight: 900, marginRight: '6px' }}>+</span>
             Agregar nuevo servicio
           </button>
         </div>
       )}
       {showAgregar && (
         <AgregarServicio onClose={() => setShowAgregar(false)} />
       )}
       {loading ? (
         <p>Cargando servicios...</p>
       ) : error ? (
         <p style={{ color: 'red' }}>{error}</p>
       ) : (
         <ServicioList servicios={serviciosFiltrados} />
       )}
     </div>
   );
}


// Componente para mostrar el formulario directamente
const AgregarServicio: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [token, setToken] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token') || undefined);
    }
  }, []);
  return (
    <div style={{ margin: '2rem auto', textAlign: 'center' }}>
      <FormularioServicio token={token} onServicioCreado={() => { window.location.reload(); if (onClose) onClose(); }} />
    </div>
  );
};

export default Page;