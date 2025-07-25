import React from 'react';
import '../styles/hero.css';

const HeroSection = () => {
  return (
    <section className="hero-section" style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: 0 }}>
      <div style={{ width: '100%', textAlign: 'center', margin: '3.5rem 0 2.5rem 0', minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 500, color: '#204d47', letterSpacing: '0.04em', fontFamily: 'Montserrat, Open Sans, Arial, sans-serif', textShadow: '0 2px 16px rgba(32,77,71,0.13)', margin: 0 }}>
          BIENVENIDOS
        </h1>
      </div>
      <div style={{ width: '100vw', flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: 'transparent', boxShadow: 'none', padding: 0, borderRadius: 0, minHeight: '350px', maxHeight: '600px', margin: 0 }}>
        <img
          src="/images/a.png"
          alt="Spa hero"
          style={{
            width: '100vw',
            height: '100%',
            maxHeight: '600px',
            objectFit: 'cover',
            borderRadius: 0,
            boxShadow: 'none',
            margin: 0,
            display: 'block',
          }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
