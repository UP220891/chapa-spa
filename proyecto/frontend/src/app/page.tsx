import Navbar from './components/Navbar';
import HeroSection from '../components/HeroSection';

export default function Home() {
  return (
    <div
      className="homepage-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100vw',
        background: '#fff',
        padding: 0,
        margin: 0,
      }}>
      
      {/* Banner superior */}
      <div
        className="homepage-banner"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '40px',
          background: '#1A3C3C',
          marginBottom: '0.5rem',
        }}>
        {/* Puedes agregar texto o íconos aquí si lo deseas */}
      </div>

      {/* Header y menú */}
      <div
        className="homepage-header"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1440px',
          height: '86px',
          padding: '0 72px',
          boxSizing: 'border-box',
          marginBottom: '1.5rem',
        }}>
        <Navbar />
      </div>

      {/* Hero principal */}
      <div style={{width: '100vw', textAlign: 'center', marginBottom: '1.5rem', padding: 0}}>
        <h1
          style={{
            color: '#204d47',
            fontSize: '4rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textShadow: '0 2px 10px rgba(0,0,0,0.15)',
            margin: 0,
            marginBottom: '1.5rem',
            fontFamily: 'Alegreya Sans, Arial, sans-serif',
          }}
        >BIENVENIDOS</h1>
        <div
          className="hero-image-container"
          style={{
            width: '100vw',
            height: '806px',
            margin: 0,
            overflow: 'hidden',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            position: 'relative',
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
          <img
            src="/images/a.png"
            alt="Hero"
            className="hero-image"
            style={{
              width: '100vw',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              borderRadius: 0,
              margin: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
