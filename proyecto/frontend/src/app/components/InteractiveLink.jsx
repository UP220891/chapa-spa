// components/InteractiveLink.jsx
'use client';

import React from 'react';

const InteractiveLink = ({ href, target, rel, children }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      style={{
        backgroundColor: isHovered ? '#204d47' : '#357a6c',
        color: 'white',
        padding: '0.8rem 1.8rem',
        borderRadius: '50px',
        textDecoration: 'none',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        fontSize: '1.1rem',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </a>
  );
};

export default InteractiveLink;