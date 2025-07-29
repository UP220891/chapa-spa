import React from "react";
import "../../styles/contacto.css";
import Navbar from '../components/Navbar';

const Contactanos = () => {
  return (
    <>
      <Navbar />
      <div className="contact-container">
        <section className="contact-info-section">
          <h2 className="contact-info-title">Contáctanos</h2>
          <div className="contact-info-details">
            <p>¿Tienes alguna pregunta o necesitas ayuda? ¡Estamos para servirte!</p>
            <p>
              <strong>Email:</strong> contacto@chapaspa.com<br />
              <strong>Teléfono:</strong> +52 123 456 7890<br />
              <strong>Dirección:</strong> Calle Ejemplo 123, CDMX
            </p>
          </div>
        </section>
        <section className="contact-form-section">
          <h3 className="contact-title">Envíanos un mensaje</h3>
          <form className="contact-form">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" name="nombre" required />

            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="mensaje">Mensaje</label>
            <textarea id="mensaje" name="mensaje" rows={5} required />

            <button type="submit" className="contact-btn">Enviar</button>
          </form>
        </section>
      </div>
    </>
  );
};

export default Contactanos;