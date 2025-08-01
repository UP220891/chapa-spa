import React from 'react';

interface BusquedaProps {
  valor: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const Busqueda: React.FC<BusquedaProps> = ({ valor, onChange, placeholder = "Buscar servicios..." }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    margin: '1.5rem 0'
  }}>
    <input
      type="text"
      value={valor}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: '0.7rem 1.2rem',
        borderRadius: '12px',
        border: '1.5px solid #204d47',
        fontSize: '1.1rem',
        width: '100%',
        maxWidth: '350px',
        outline: 'none',
        color: '#204d47',
        background: '#eaf6f3',
        fontWeight: 600,
        fontFamily: "'Segoe UI', 'Roboto', Arial, sans-serif",
        boxShadow: '0 2px 8px rgba(32,77,71,0.10)',
        transition: 'border 0.2s, box-shadow 0.2s'
      }}
    />
  </div>
);

export default Busqueda;