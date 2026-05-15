import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Shop from './components/Shop';
import About from './components/About';
import Contact from './components/Contact';
import Offers from './components/Offers';
import Detail from './components/Detail';
import './styles/GlobalStyles.css';

// --- CURSOR ---
const Cursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, .pc, .cat-card, .ofc, .ns, .nf, .tmc, .dth, .cl-b, .sz-b, .cl-sw, .padd, .hdot, .harr')) setHovered(true);
      else setHovered(false);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleHover);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleHover);
    };
  }, []);

  return (
    <>
      <div id="csr" className={hovered ? 'on' : ''} style={{ left: pos.x, top: pos.y }} />
      <div id="csrr" className={hovered ? 'on' : ''} style={{ left: pos.x, top: pos.y }} />
    </>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageProps, setPageProps] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  const navigate = (id: string, props: any = {}) => {
    setPageProps(props);
    setCurrentPage(id);
  };

  useEffect(() => {
    // Initial reveal on load
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={navigate} />;
      case 'shop': return <Shop onNavigate={navigate} initialCategory={pageProps.category || 'all'} />;
      case 'offers': return <Offers onNavigate={navigate} />;
      case 'about': return <About onNavigate={navigate} />;
      case 'contact': return <Contact />;
      case 'detail': return <Detail onNavigate={navigate} {...pageProps} />;
      default: return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-root">
      <Cursor />
      
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="loader" 
            id="ldr" 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <div className="ldr-logo">LUMIÈRE</div>
            <div className="ldr-bar">
              <motion.div 
                className="ldr-fill" 
                initial={{ width: 0 }} 
                animate={{ width: '100%' }} 
                transition={{ duration: 1.5, ease: 'easeInOut' }} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Header onNavigate={navigate} currentPage={currentPage} />

      <main>
        {renderPage()}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
