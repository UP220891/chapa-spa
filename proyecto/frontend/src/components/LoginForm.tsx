import React from 'react';

const LoginForm = () => {
  return (
    <div className="login-container">
      <div className="login-form-section">
        <h2 className="login-title">CHAPASPA´S</h2>
        <h1 className="login-heading">Iniciar sesión</h1>
        <form className="login-form">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" placeholder="email" />
          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" placeholder="Ingresar contraseña" />
          <button type="submit" className="login-btn">Iniciar sesión</button>
        </form>
        <div className="login-register">
          <span>¿No tienes cuenta?</span>
          <a href="/register" className="login-link">Regístrate aquí</a>
        </div>
      </div>
      <div className="login-image-section">
        <img src="/images/login.png" alt="Spa login" className="login-image" />
      </div>
    </div>
  );
};

export default LoginForm;
