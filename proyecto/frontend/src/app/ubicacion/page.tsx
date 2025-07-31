// app/ubicacion/page.jsx
import React from "react";
import "../../styles/ubicacion.css";
import Navbar from '../components/Navbar';
import InteractiveLink from '../components/InteractiveLink';

const Ubicacion = () => {
  return (
    <>
      <Navbar />
      <div className="ubicacion-container" style={{ 
        maxWidth: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        padding: 0
      }}>
        <section style={{ 
          background: 'linear-gradient(120deg, #e0f1ee 0%, #ffffff 100%)',
          borderRadius: 32,
          boxShadow: '0 4px 32px 0 rgba(31,38,135,0.10)',
          border: '2px solid #357a6c',
          padding: '4.5rem 4rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 600,
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto'
        }}>
          <h2 style={{ 
            color: '#204d47', 
            fontWeight: 900, 
            fontSize: '2.5rem', 
            marginBottom: '1.1rem', 
            textAlign: 'center', 
            fontFamily: 'Montserrat, sans-serif', 
            letterSpacing: '0.03em' 
          }}>
            Visítanos
          </h2>
          
          <div style={{ 
            fontSize: '1.18rem', 
            color: '#357a6c', 
            fontWeight: 600, 
            textAlign: 'center', 
            fontFamily: 'Montserrat, sans-serif', 
            marginBottom: '1.3rem',
            width: '100%'
          }}>
            {/* Mapa embebido actualizado */}
            <div style={{
              height: '400px',
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              marginBottom: '2rem',
              border: '1px solid #e0e9f0'
            }}>
              <iframe
                title="Ubicación del negocio"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3702.237247377108!2d-102.3135659!3d21.9169155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8429ef1d4235794f%3A0x1e33b1899d0de0c!2sEdificio%20Torre%20Plaza%20Bosques!5e0!3m2!1ses!2smx!4v1620000000000!5m2!1ses!2smx"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: '2rem', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginTop: '1.5rem'
            }}>
              <div style={{ 
                minWidth: 250, 
                backgroundColor: '#f0f7f6',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'left'
              }}>
                <h3 style={{ 
                  color: '#204d47', 
                  fontWeight: 700, 
                  fontSize: '1.2rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#357a6c" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Dirección
                </h3>
                <p style={{ color: '#357a6c', lineHeight: '1.6' }}>
                  Edificio Torre Plaza Bosques<br />
                  Aguascalientes, Ags.<br />
                  {/* Manteniendo el mismo código postal */}
                  20342
                </p>
              </div>

              <div style={{ 
                minWidth: 250, 
                backgroundColor: '#f0f7f6',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'left'
              }}>
                <h3 style={{ 
                  color: '#204d47', 
                  fontWeight: 700, 
                  fontSize: '1.2rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#357a6c" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                  </svg>
                  Horario
                </h3>
                <p style={{ color: '#357a6c', lineHeight: '1.6' }}>
                  Lunes a Viernes: 9:00 - 18:00<br />
                  Sábado: 10:00 - 14:00<br />
                  Domingo: Cerrado
                </p>
              </div>

              <div style={{ 
                minWidth: 250, 
                backgroundColor: '#f0f7f6',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'left'
              }}>
                <h3 style={{ 
                  color: '#204d47', 
                  fontWeight: 700, 
                  fontSize: '1.2rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#357a6c" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                  </svg>
                  Contacto
                </h3>
                <p style={{ color: '#357a6c', lineHeight: '1.6' }}>
                  Tel: +52 123 456 7890<br />
                  Email: contacto@chapaspa.com<br />
                </p>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', borderTop: '2px solid #357a6c', margin: '1.3rem 0 1.1rem 0' }} />
          
          <div style={{ textAlign: 'center', color: '#204d47', fontWeight: 700, fontSize: '1.13rem', fontFamily: 'Montserrat, sans-serif', marginBottom: '0.7rem' }}>
            <p>¿Necesitas indicaciones más detalladas? Contáctanos y con gusto te ayudamos.</p>
          </div>
          
          <div style={{ marginTop: '0.2rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <InteractiveLink 
              href="https://www.google.com/maps/dir//Edificio+Torre+Plaza+Bosques/@21.9169155,-102.3135659,17z/data=!4m9!4m8!1m0!1m5!1m1!1s0x8429ef1d4235794f:0x1e33b1899d0de0c!2m2!1d-102.3135659!2d21.9169155!3e0" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Cómo llegar
            </InteractiveLink>
          </div>
        </section>
      </div>
    </>
  );
};

export default Ubicacion;