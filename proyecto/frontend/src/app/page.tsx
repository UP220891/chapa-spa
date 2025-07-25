import Navbar from './components/Navbar';

import HeroSection from '../components/HeroSection';
import Footer from '@/components/Footer';

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
        overflowX: 'hidden',
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
      <div
        className="hero-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100vw',
          flex: 1,
          position: 'relative',
          background: 'transparent',
          boxShadow: 'none',
          borderRadius: 0,
          marginBottom: 0,
          padding: 0,
        }}>
        <HeroSection />
      </div>
      <Footer />
    </div>
  );
}