import React from 'react';

const Navbar = () => (
  <header className="w-full flex items-center justify-between px-8 py-4 shadow-sm bg-white">
    <nav className="flex-1">
      <ul className="flex gap-8 text-gray-700 text-sm font-medium">
        <li><a href="#" className="hover:text-pink-600">Inicio</a></li>
        <li><a href="#" className="hover:text-pink-600">Conocenos</a></li>
        <li><a href="#" className="hover:text-pink-600">Servicios</a></li>
        <li><a href="#" className="hover:text-pink-600">Ubicación</a></li>
      </ul>
    </nav>
    <div className="flex-1 flex justify-center">
      <span className="text-2xl font-bold tracking-widest text-gray-800">CHAPASPA'S</span>
    </div>
    <nav className="flex-1 flex justify-end">
      <ul className="flex gap-6 text-gray-700 text-sm font-medium">
        <li><a href="/login" className="hover:text-pink-600">Iniciar sesión</a></li>
        <li><a href="/register" className="hover:text-pink-600">Registrarse</a></li>
        <li><a href="#" className="hover:text-pink-600">Cerrar sesión</a></li>
      </ul>
    </nav>
  </header>
);

export default Navbar;
