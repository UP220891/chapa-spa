import React from 'react';
import ServicioList from './ServicioList';
import Navbar from '../components/Navbar';
import styles from '../../styles/ServicioList.module.css'; 

const servicios = [
    {
        id: 1,
        nombre: 'Masaje Relajante',
        descripcion: 'Masaje para aliviar el estrés y relajar los músculos.',
        precio: 500,
        imagen: '/images/masaje.jpg'
    },
    {
        id: 2,
        nombre: 'Facial Hidratante',
        descripcion: 'Tratamiento facial para hidratar y revitalizar la piel.',
        precio: 350,
        imagen: '/images/facial.jpg'
    },
    {
        id: 3,
        nombre: 'Spa de Manos',
        descripcion: 'Cuidado y embellecimiento de manos y uñas.',
        precio: 250,
        imagen: '/images/manos.jpg'
    },
    // Agrega más servicios según lo que ofrezca tu spa
];

const Page = () => {
    return (
        <div>
            <Navbar />
            <h1 className={styles.tituloServicios}>Servicios Disponibles</h1>
            <ServicioList servicios={servicios} />
        </div>
    );
};

export default Page;