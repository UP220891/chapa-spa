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

  return (
    <div>
      <Navbar usuario={usuario} />
      <h1 className={styles.tituloServicios}>Servicios Disponibles</h1>
      <Busqueda valor={busqueda} onChange={e => setBusqueda(e.target.value)} />
      {loading ? (
        <p>Cargando servicios...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          <ServicioList servicios={serviciosFiltrados} />
          {(usuario && (usuario.rol === 'admin' || usuario.rol === 'empleado')) && (
            <AgregarServicio />
          )}
        </>
      )}
    </div>
  );
};

// Componente para mostrar botón y formulario
const AgregarServicio: React.FC = () => {
  const [mostrar, setMostrar] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token') || undefined);
    }
  }, [mostrar]);

  return (
    <div style={{ margin: '2rem auto', textAlign: 'center' }}>
      {!mostrar ? (
        <button
          onClick={() => setMostrar(true)}
          style={{ padding: '10px 24px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, fontSize: 16 }}
        >
          Agregar nuevo servicio
        </button>
      ) : (
        <FormularioServicio token={token} onServicioCreado={() => window.location.reload()} />
      )}
    </div>
  );
};

export default Page;