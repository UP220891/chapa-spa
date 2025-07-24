import React from 'react';
import '../styles/hero.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-image-container">
        <img
          src="/images/a.jpg"
          alt="Fondo del spa"
          className="hero-image"
        />
      </div>
      <div className="hero-text-container">
        <h1 className="hero-title">BIENVENIDOS</h1>
      </div>
    </section>
  );
};

export default HeroSection;
