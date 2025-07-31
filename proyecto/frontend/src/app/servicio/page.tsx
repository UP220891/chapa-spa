'use client';
import React, { useState } from 'react';
import ServicioList from './ServicioList';
import Navbar from '../components/Navbar';
import Busqueda from '../../components/busqueda';
import styles from '../../styles/ServicioList.module.css'; 


const servicios = [
    {
        id: 1,
        nombre: 'Masaje relajante espalda',
        descripcion: 'Disfruta de un masaje especializado para aliviar el estrés y relajar profundamente los músculos de la espalda, eliminando tensiones y mejorando tu bienestar general.',
        duracion: '45 minutos',
        precio: 400,
        imagen: '/images/masajerelajante.jpg'
    },
    {
        id: 2,
        nombre: 'Masaje relajante cuerpo completo',
        descripcion: 'Sumérgete en una experiencia de relajación total con un masaje en todo el cuerpo, ideal para liberar tensiones, reducir el estrés y renovar tu energía.',
        duracion: '60 minutos',
        precio: 700,
        imagen: '/images/masajecuerpo.jpg'
    },
    {
        id: 3,
        nombre: 'Facial Hidratante',
        descripcion: 'Tratamiento facial intensivo que hidrata, revitaliza y aporta luminosidad a tu piel, dejándola suave, fresca y radiante.',
        duracion: '40 minutos',
        precio: 400,
        imagen: '/images/facial.jpg'
    },
    {
        id: 4,
        nombre: 'Manicura',
        descripcion: 'Embellece y cuida tus manos y uñas con nuestro servicio de manicura profesional, que incluye limado, cutícula, e hidratación.',
        duracion: '30 minutos',
        precio: 250,
        imagen: '/images/spamanos.jpg'
    },
    {
        id: 5,
        nombre: 'Pedicura',
        descripcion: 'Relaja tus pies y dales el cuidado que merecen con una pedicura completa: exfoliación e hidratación.',
        duracion: '40 minutos',
        precio: 300,
        imagen: '/images/spapies.jpg'
    },
    {
        id: 6,
        nombre: 'Limpieza Facial Profunda',
        descripcion: 'Limpieza facial profesional que elimina impurezas, puntos negros y células muertas, dejando tu piel limpia, suave y renovada.',
        duracion: '50 minutos',
        precio: 500,
        imagen: '/images/limpfacialprof.jpg'
    },
    {
        id: 7,
        nombre: 'Paquete depilación (piernas, brazos, axilas y área de bikini)',
        descripcion: 'Paquete completo de depilación con cera profesional para piernas, brazos, axilas y área de bikini. Piel suave y libre de vello por más tiempo.',
        duracion: '80 minutos',
        precio: 800,
        imagen: '/images/depilación.jpg' 
    },
    {
        id: 8,
        nombre: 'Exfoliación Corporal',
        descripcion: 'Elimina las células muertas y renueva tu piel con una exfoliación corporal que deja tu cuerpo suave, luminoso y revitalizado.',
        duracion: '35 minutos',
        precio: 400,
        imagen: '/images/exfcorporal.jpg'
    },
];

const Page = () => {
      const [busqueda, setBusqueda] = useState(''); 

  const serviciosFiltrados = servicios.filter(servicio =>
    servicio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    servicio.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );
    return (
        <div>
            <Navbar />
            <h1 className={styles.tituloServicios}>Servicios Disponibles</h1>
            <Busqueda valor={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <ServicioList servicios={serviciosFiltrados} />
        </div>
    );
};

export default Page;