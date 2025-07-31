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
        imagen: '/images/masajerelajante.jpg'
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
        imagen: '/images/spamanos.jpg'
    },
    {
        id: 4,
        nombre: 'Spa de Pies',
        descripcion: 'Relajación y cuidado especial para tus pies.',
        precio: 300,
        imagen: '/images/spapies.jpg'
    },
    {
    id: 5,
    nombre: 'Limpieza Facial Profunda',
    descripcion: 'Tratamiento para limpiar y purificar la piel del rostro a profundidad.',
    precio: 400,
    imagen: '/images/limpfacialprof.jpg'
},
{
    id: 6,
    nombre: 'Depilación con Cera',
    descripcion: 'Eliminación de vello corporal y facial con cera profesional.',
    precio: 300,
    imagen: '/images/depilación.jpg' 
},
{
    id: 7,
    nombre: 'Exfoliación Corporal',
    descripcion: 'Eliminación de células muertas para una piel suave y renovada.',
    precio: 350,
    imagen: '/images/exfcorporal.jpg'
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