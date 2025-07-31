import React from 'react';
import styles from './ServicioList.module.css';

interface ServicioListProps {
  servicios: {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
  }[];
}

const ServicioList: React.FC<ServicioListProps> = ({ servicios }) => {
  return (
    <div className={styles.servicioList}>
      {servicios.map(servicio => (
        <div key={servicio.id} className={styles.servicioCard}>
          <img src={servicio.imagen} alt={servicio.nombre} className={styles.servicioImage} />
          <h3 className={styles.servicioNombre}>{servicio.nombre}</h3>
          <p className={styles.servicioDescripcion}>{servicio.descripcion}</p>
          <p className={styles.servicioPrecio}>${servicio.precio.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};

export default ServicioList;