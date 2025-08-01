import React from 'react';
import '../../styles/conocenos.css';
import Navbar from '../components/Navbar';

const Conocenos = () => {
  return (
    <>
      <Navbar />
      <div className="conocenos-container">
        <div className="conocenos-card">
          <h1 className="conocenos-title">Nuestra Esencia</h1>
          
          <p className="section-content" style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '3rem' }}>
            En <strong>ChapaSpa</strong>, transformamos tu bienestar en una experiencia única, 
            donde cada tratamiento es un viaje hacia la armonía entre cuerpo y mente.
          </p>
          
          <div className="mision-vision-container">
            <div className="mision-card">
              <h2 className="section-title">
                <span className="section-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </span>
                Misión
              </h2>
              <p className="section-content">
                Ofrecer experiencias de bienestar excepcionales a través de terapias 
                personalizadas que combinan técnicas ancestrales con innovación moderna, 
                promoviendo el equilibrio integral de cada cliente en un ambiente de 
                tranquilidad absoluta.
              </p>
            </div>
            
            <div className="vision-card">
              <h2 className="section-title">
                <span className="section-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-8a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                </span>
                Visión
              </h2>
              <p className="section-content">
                Ser reconocidos como el spa líder en Aguascalientes, siendo referencia 
                en innovación terapéutica y cuidado holístico, expandiendo nuestra filosofía 
                de bienestar a través de una red de centros que mantengan nuestra esencia 
                de excelencia y calidez humana.
              </p>
            </div>
          </div>
          
          <div className="team-section">
            <h2 className="section-title" style={{ justifyContent: 'center', fontSize: '1.8rem' }}>
              Nuestro Equipo
            </h2>
            <p className="section-content" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Profesionales certificados con pasión por el bienestar
            </p>
            
            <div className="team-grid">
              <div className="team-member">
                <img 
                  src="/images/perro2.jpg" 
                  alt="Mariana González" 
                  className="member-avatar"
                />
                <h3 className="member-name">Jeinny Melissa Villalobos Durón</h3>
                <p className="member-role">Terapeuta Principal</p>
                <p className="section-content" style={{ fontSize: '1rem' }}>
                  Especialista en masajes descontracturantes y aromaterapia
                </p>
              </div>
              
              <div className="team-member">
                <img 
                  src="/images/perro1.jpg" 
                  alt="Laura Méndez" 
                  className="member-avatar"
                />
                <h3 className="member-name">Braulio López Hernández</h3>
                <p className="member-role">Esteticista Certificada</p>
                <p className="section-content" style={{ fontSize: '1rem' }}>
                  Experta en tratamientos faciales y corporales
                </p>
              </div>
              
              <div className="team-member">
                <img 
                  src="/images/perro3.jpg" 
                  alt="Ricardo Torres" 
                  className="member-avatar"
                />
                <h3 className="member-name">Alondra Chapa Macias</h3>
                <p className="member-role">Gerente de Experiencia</p>
                <p className="section-content" style={{ fontSize: '1rem' }}>
                  Encargado de tu experiencia personalizada
                </p>
              </div>

              <div className="team-member">
                <img 
                  src="/images/perro4.jpg" 
                  alt="Ricardo Torres" 
                  className="member-avatar"
                />
                <h3 className="member-name">Flor de María Gómez Ojeda</h3>
                <p className="member-role">Gerente de Experiencia</p>
                <p className="section-content" style={{ fontSize: '1rem' }}>
                  Encargado de tu experiencia personalizada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Conocenos;