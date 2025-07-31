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
        border: '1.5px solid #388e3c',
        fontSize: '1.1rem',
        width: '100%',
        maxWidth: '350px',
        outline: 'none',
        color: '#256029',
        background: '#f9fbe7',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(44,62,80,0.06)'
      }}
    />
  </div>
);

export default Busqueda;