import React from "react";
import "../../styles/contacto.css";
import Navbar from '../components/Navbar';

const Contactanos = () => {
  return (
    <>
      <Navbar />
      <div className="contact-container" style={{ 
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
          <h2 style={{ color: '#204d47', fontWeight: 900, fontSize: '2.5rem', marginBottom: '1.1rem', textAlign: 'center', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.03em' }}>Contáctanos</h2>
          <div style={{ fontSize: '1.18rem', color: '#357a6c', fontWeight: 600, textAlign: 'center', fontFamily: 'Montserrat, sans-serif', marginBottom: '1.3rem' }}>
            <p style={{ marginBottom: '0.8rem' }}>¿Tienes alguna pregunta o necesitas ayuda?<br />¡Estamos para servirte!</p>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ minWidth: 170, color: '#204d47' }}><strong>Email:</strong><br /><span style={{ color: '#357a6c' }}>contacto@chapaspa.com</span></span>
              <span style={{ minWidth: 170, color: '#204d47' }}><strong>Teléfono:</strong><br /><span style={{ color: '#357a6c' }}>+52 123 456 7890</span></span>
              <span style={{ minWidth: 170, color: '#204d47' }}><strong>Dirección:</strong><br /><span style={{ color: '#357a6c' }}>Calle ChapoFlore 113, AGS</span></span>
            </div>
          </div>
          <div style={{ width: '100%', borderTop: '2px solid #357a6c', margin: '1.3rem 0 1.1rem 0' }} />
          <div style={{ textAlign: 'center', color: '#204d47', fontWeight: 700, fontSize: '1.13rem', fontFamily: 'Montserrat, sans-serif', marginBottom: '0.7rem' }}>
            <p>También puedes visitarnos en nuestras redes sociales para más información y promociones.</p>
          </div>
          <div style={{ marginTop: '0.2rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#357a6c', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '1.22rem' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#357a6c" xmlns="http://www.w3.org/2000/svg"><path d="M22.675 0h-21.35C.595 0 0 .594 0 1.326v21.348C0 23.406.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .594 23.406 0 22.675 0"/></svg>
              Facebook
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#357a6c', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '1.22rem' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#357a6c" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.417 3.678 1.398c-.981.981-1.267 2.093-1.326 3.374C2.013 8.332 2 8.741 2 12c0 3.259.013 3.668.072 4.948.059 1.281.345 2.393 1.326 3.374.981.981 2.093 1.267 3.374 1.326C8.332 23.987 8.741 24 12 24c3.259 0 3.668-.013 4.948-.072 1.281-.059 2.393-.345 3.374-1.326.981-.981 1.267-2.093 1.326-3.374.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.345-2.393-1.326-3.374-.981-.981-2.093-1.267-3.374-1.326C15.668.013 15.259 0 12 0zm0 5.838A6.162 6.162 0 0 0 5.838 12 6.162 6.162 0 0 0 12 18.162 6.162 6.162 0 0 0 18.162 12 6.162 6.162 0 0 0 12 5.838zm0 10.162A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>
              Instagram
            </a>
            <a href="https://wa.me/521234567890" target="_blank" rel="noopener noreferrer" style={{ color: '#357a6c', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '1.22rem' }}>
              <svg width="26" height="26" viewBox="0 0 32 32" fill="#357a6c" xmlns="http://www.w3.org/2000/svg"><path d="M16.001 3.2c-7.073 0-12.8 5.727-12.8 12.8 0 2.262.601 4.477 1.74 6.414l-1.801 5.236a1.6 1.6 0 0 0 2.021 2.021l5.236-1.801a12.74 12.74 0 0 0 6.404 1.73c7.073 0 12.8-5.727 12.8-12.8s-5.727-12.8-12.8-12.8zm0 23.2c-2.021 0-4.001-.527-5.727-1.527l-.401-.236-3.113 1.072 1.072-3.113-.236-.401c-1-1.726-1.527-3.706-1.527-5.727 0-6.08 4.92-11 11-11s11 4.92 11 11-4.92 11-11 11zm6.08-8.08c-.334-.167-1.98-.98-2.287-1.093-.307-.114-.534-.167-.76.167-.227.334-.867 1.093-1.063 1.32-.194.227-.387.254-.72.087-.334-.167-1.413-.52-2.693-1.653-.995-.888-1.667-1.983-1.86-2.317-.194-.334-.021-.513.146-.68.15-.15.334-.387.5-.58.167-.194.223-.334.334-.56.111-.227.056-.42-.028-.587-.083-.167-.76-1.833-1.04-2.507-.274-.66-.553-.57-.76-.58-.194-.008-.42-.01-.646-.01-.227 0-.594.084-.907.42-.313.334-1.195 1.168-1.195 2.846 0 1.678 1.223 3.299 1.393 3.527.167.227 2.409 3.68 5.84 5.013.816.314 1.452.502 1.949.642.818.208 1.563.179 2.153.109.657-.078 2.02-.827 2.306-1.626.286-.8.286-1.486.2-1.626-.084-.14-.307-.223-.64-.39z"/></svg>
              WhatsApp
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contactanos;