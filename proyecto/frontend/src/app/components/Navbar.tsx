"use client";



import React from 'react';

interface NavbarProps {
  usuario?: any;
}

const Navbar: React.FC<NavbarProps> = ({ usuario: usuarioProp }) => {
  const [usuario, setUsuario] = React.useState<any>(usuarioProp ?? null);

  React.useEffect(() => {
    if (usuarioProp) {
      setUsuario(usuarioProp);
    } else {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('usuario');
      if (token && userStr) {
        try {
          setUsuario(JSON.parse(userStr));
        } catch {
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
    }
  }, [usuarioProp]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  };

  return (
    <header className="w-full flex items-center px-8 py-4 shadow-sm bg-white">
      {/* Bloque izquierdo: navegación */}
      <nav className="flex-1 flex justify-start">
        <ul className="flex flex-wrap gap-10 text-gray-700 text-sm font-medium">
          <li><a href="/" className="hover:text-pink-600">Inicio</a></li>
          <li><a href="/conocenos" className="hover:text-pink-600">Conócenos</a></li>
          <li><a href="/servicio" className="hover:text-pink-600">Servicios</a></li>
          <li><a href="/ubicacion" className="hover:text-pink-600">Ubicación</a></li>
          {/* Enlace para cualquier empleado (admin o empleado) */}
          {usuario && (usuario.tipo === 'admin' || usuario.tipo === 'empleado') && (
            <li><a href="/Administrador" className="hover:text-pink-600">Administrador</a></li>
          )}
        </ul>
      </nav>
      {/* Bloque central: nombre/logo */}
      <div className="flex flex-1 justify-center items-center">
        <span className="text-2xl font-bold tracking-widest text-gray-800">ChapaSPA</span>
      </div>
      {/* Bloque derecho: usuario y acciones */}
      <div className="flex flex-1 items-center justify-end gap-6 min-w-[260px]">
        {usuario && (
          <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
            <span className="text-sm text-gray-600 text-right min-w-[120px] leading-tight">
              Bienvenido,<br />{usuario.nombre || usuario.email}
            </span>
            <button
              className="flex items-center justify-center bg-[#204d47] hover:bg-[#357a6c] rounded-full p-2 border-none transition-colors shadow-md"
              style={{ width: '40px', height: '40px' }}
              onClick={() => window.location.href = '/perfil'}
              title="Mi perfil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" style={{ width: '24px', height: '24px' }}>
                <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5" fill="#357a6c" />
                <path stroke="white" strokeWidth="1.5" d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" />
              </svg>
            </button>
          </div>
        )}
        <ul className="flex gap-4 text-gray-700 text-sm font-medium ml-4">
          {!usuario && <li><a href="/login" className="hover:text-pink-600">Iniciar sesión</a></li>}
          {!usuario && <li><a href="/register" className="hover:text-pink-600">Registrarse</a></li>}
          {usuario && <li><button onClick={handleLogout} className="hover:text-pink-600 bg-transparent border-none cursor-pointer">Cerrar sesión</button></li>}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
