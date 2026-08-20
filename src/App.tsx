import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Shop from './components/Shop';
import CartSidebar from './components/CartSidebar';
import RouteProgress from './components/RouteProgress';
import Loader from './components/Loader';
import SiteLogo from './components/SiteLogo';
import { CartProvider } from './context/CartContext';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import './styles/GlobalStyles.css';

// Split the pages a visitor does not hit first — the bundle for the landing
// view stays small, and the Suspense fallback below covers the fetch.
const Categories   = lazy(() => import('./components/Categories'));
const About        = lazy(() => import('./components/About'));
const Contact      = lazy(() => import('./components/Contact'));
const Offers       = lazy(() => import('./components/Offers'));
const Detail       = lazy(() => import('./components/Detail'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));

/** How long the splash stays up at minimum, so it never flashes. */
const MIN_SPLASH_MS = 900;

// --- CURSOR ---
const Cursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, .pc, .cat-card, .ofc, .ns, .nf, .tmc, .dth, .cl-b, .sz-b, .cl-sw, .padd, .hdot, .harr, .cbz-card, .subcat-pill, .sb-cat')) setHovered(true);
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

/** Full-screen splash, shown until the catalogue is actually ready. */
const Splash: React.FC<{ progress: number }> = ({ progress }) => (
  <motion.div
    key="loader"
    id="ldr"
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
  >
    <SiteLogo className="ldr-logo" height={56} />
    <div className="ldr-bar">
      <motion.div
        className="ldr-fill"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
    <div className="ldr-note">Préparation de la boutique…</div>
  </motion.div>
);

/** Shown while a lazily-loaded page chunk is being fetched. */
const PageFallback = () => (
  <div className="page on page-fallback">
    <Loader label="Chargement de la page…" block />
  </div>
);

const AppShell: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageProps, setPageProps] = useState<any>({});
  const [isBooting, setIsBooting] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const bootStart = useRef(Date.now());
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { loading: catalogLoading } = useCatalog();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentPage]);

  /* ── SPLASH: tied to real data, not an arbitrary timer ──────────
     It used to hide after a fixed 2s, which meant the page could still be
     empty when it lifted — or make a fast connection wait for nothing. */
  useEffect(() => {
    if (catalogLoading) return;
    const elapsed = Date.now() - bootStart.current;
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
    const t = setTimeout(() => setIsBooting(false), wait);
    return () => clearTimeout(t);
  }, [catalogLoading]);

  /** Safety valve: never trap a visitor behind the splash if the API hangs. */
  useEffect(() => {
    const t = setTimeout(() => setIsBooting(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const navigate = (id: string, props: any = {}) => {
    if (id === currentPage && JSON.stringify(props) === JSON.stringify(pageProps)) return;

    // Brief progress bar so a click always produces visible feedback, even
    // when the next page renders instantly from cached data.
    setNavigating(true);
    if (navTimer.current) clearTimeout(navTimer.current);
    navTimer.current = setTimeout(() => setNavigating(false), 420);

    setPageProps(props);
    setCurrentPage(id);
    window.history.pushState({ page: id, props }, '', `/${id === 'home' ? '' : id}`);
  };

  useEffect(() => () => { if (navTimer.current) clearTimeout(navTimer.current); }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const page = e.state?.page || 'home';
      const props = e.state?.props || {};
      setCurrentPage(page);
      setPageProps(props);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':       return <Home onNavigate={navigate} />;
      case 'shop':       return <Shop onNavigate={navigate} initialCategory={pageProps.category ?? 'all'} initialSearch={pageProps.search ?? ''} />;
      case 'categories': return <Categories onNavigate={navigate} />;
      case 'offers':     return <Offers onNavigate={navigate} />;
      case 'about':      return <About onNavigate={navigate} />;
      case 'contact':    return <Contact />;
      case 'detail':     return <Detail onNavigate={navigate} {...pageProps} />;
      case 'checkout':   return <CheckoutPage onNavigate={navigate} />;
      default:           return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-root">
      <Cursor />

      <AnimatePresence>{isBooting && <Splash progress={catalogLoading ? 70 : 100} />}</AnimatePresence>

      <RouteProgress active={navigating || catalogLoading} />

      <TopBar />

      <Header onNavigate={navigate} currentPage={currentPage} />

      <main>
        <Suspense fallback={<PageFallback />}>
          {/* Keyed on the page id so each view fades in rather than snapping. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage + JSON.stringify(pageProps?.category ?? '') + JSON.stringify(pageProps?.search ?? '')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer onNavigate={navigate} />

      <CartSidebar onNavigate={navigate} />
    </div>
  );
};

export default function App() {
  return (
    <CatalogProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </CatalogProvider>
  );
}
