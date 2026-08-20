import React, { useState, useEffect, useRef } from 'react';
import Hero from './Hero';
import ProductCard from './ProductCard';
import { Truck, RefreshCcw, Shield, Phone, Sparkles, Tag, Zap, Award, Mail, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { fetchCarouselSlides, fetchPromos, Article, CarouselSlide, Promo, getImageUrl } from '../api';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';

import Categorystrip from './Categorystrip';
import Brands from './Brands';
import Testimonials from './Testimonials';
import { SkeletonProductGrid, Skeleton } from './Skeleton';

interface HomeProps {
  onNavigate: (id: string, props?: any) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  useScrollReveal();
  const { addToCart, openCart } = useCart();

  // Articles + categories come from the shared catalogue (fetched once for the
  // whole app); only the home-specific content is loaded here.
  const { articles, tree, loading, countInCategory, articlesInCategory } = useCatalog();

  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [showAllCatalogue, setShowAllCatalogue] = useState(false);
  const [catalogueFilter, setCatalogueFilter] = useState<string | number>('all');
  const [visibleCatalogueCount, setVisibleCatalogueCount] = useState(8);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [slidesData, promosData] = await Promise.all([
          fetchCarouselSlides().catch(() => []),
          fetchPromos().catch(() => []),
        ]);
        setSlides(slidesData);
        setPromos(promosData);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setHeroLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter for novelty/new arrivals
  const novelties = articles.filter(a => a.is_new_arrival).slice(0, 5);
  // Filter for best sellers
  const bestSellers = articles.filter(a => a.is_top_seller);
  // Catalogue tab respects sub-categories: picking a parent shows its children too.
  const catalogueItems = articlesInCategory(catalogueFilter);

  // Featured promo for the offer banner
  const featuredPromo = promos[0] || null;

  // Countdown Logic — based on the featured promo's end date
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    if (!featuredPromo?.date_end) { setTimeLeft(0); return; }
    const end = new Date(featuredPromo.date_end).getTime();
    const tick = () => setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [featuredPromo?.id, featuredPromo?.date_end]);

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      d: String(d).padStart(2, '0'),
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0'),
    };
  };
  const cd = formatTime(timeLeft);

  // Carousel Logic (Simplified for Parity)
  const bsRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (dir: number) => {
    if (bsRef.current) {
      const scrollAmount = bsRef.current.offsetWidth / 2;
      bsRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  // Helper to pick the best image for an article
  const getArticleImage = (item: Article) => {
    if (item.image) return getImageUrl(item.image);
    if (item.website_images && item.website_images.length > 0) {
      return getImageUrl(item.website_images[0]);
    }
    return getImageUrl(null);
  };


  return (
    <div className="page on">
      <Hero onNavigate={onNavigate} slides={slides} loading={heroLoading} />

      {/*  <div className="fstrip">
        <div className="finner">
          <div className="fi rv">
            <div className="fi-ic"><Truck size={20} /></div>
            <div>
              <h4>Livraison gratuite</h4>
              <p>Dès 50 DT d’achat</p>
            </div>
          </div>
          <div className="fi rv d1">
            <div className="fi-ic"><RefreshCcw size={20} /></div>
            <div>
              <h4>Retours faciles</h4>
              <p>30 jours, sans complication</p>
            </div>
          </div>
          <div className="fi rv d2">
            <div className="fi-ic"><Shield size={20} /></div>
            <div>
              <h4>Paiement sécurisé</h4>
              <p>Commande protégée à 100 %</p>
            </div>
          </div>
          <div className="fi rv d3">
            <div className="fi-ic"><Phone size={20} /></div>
            <div>
              <h4>Support 24h/24</h4>
              <p>Toujours à votre écoute</p>
            </div>
          </div>
        </div>
      </div> */}
     

      {/* NOVELTIES — "Latest Drops / What's New" band.
          Hidden on request; the markup is kept intact so it can be switched
          back on by removing the comment wrapper below.
          The same `novelties` data still drives the "New Arrivals" split
          section further down, so nothing else is affected. */}
      {/*
      {novelties.length > 0 && (
        <section className="sec">
          <div className="shd rv">
            <div className="stag"><Sparkles size={11} /> Dernières nouveautés</div>
            <h2 className="stit">Quoi de <em>neuf</em></h2>
            <p className="ssub">Des arrivages choisis avec un goût exquis — soyez les premiers à posséder l’exceptionnel.</p>
          </div>
          <div className="nov-g">
            {novelties[0] && (
              <div className="nf rv" onClick={() => onNavigate('detail', { article: novelties[0] })}>
                <img src={getArticleImage(novelties[0])} alt={novelties[0].nom} />
                <div className="nf-ol"></div>
                <span className="pbadge pb-n" style={{ position: 'absolute', top: 14, left: 14 }}>NOUVEAU</span>
                <div className="nf-b">
                  <div className="nf-tag">★ Coup de cœur</div>
                  <div className="nf-tit">{novelties[0].designation}</div>
                  <div className="nf-pr">${Number(novelties[0].puv_ttc).toFixed(2)}</div>
                </div>
              </div>
            )}
            {novelties.slice(1, 5).map((item, idx) => (
              <div key={item.id} className={`ns rv d${(idx % 2) + 1}`} onClick={() => onNavigate('detail', { article: item })}>
                <img src={getArticleImage(item)} alt={item.nom} />
                <div className="ns-ol"></div>
                <span className="pbadge pb-n" style={{ position: 'absolute', top: 12, left: 12 }}>NOUVEAU</span>
                <div className="ns-b">
                  <div className="ns-nm">{item.designation}</div>
                  <div className="ns-pr">${Number(item.puv_ttc).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      */}

      {/* SHOP BY CATEGORY */}

      <Categorystrip
        categories={tree}
        loading={loading}
        onNavigate={onNavigate}
        getImageUrl={getImageUrl}
        countInCategory={countInCategory}
      />

      {/* OFFER BANNER — driven by the featured promo */}
      {featuredPromo && (
        <div className="ofb-wrap">
          <div className="ofb rv">
            <div className="ofb-l">
              <div className="ofb-ey">
                <Zap size={13} fill="var(--se)" color="var(--se)" />
                {featuredPromo.date_end && timeLeft > 0 ? 'Promotion — Se termine dans' : 'Promotion'}
              </div>
              <div className="ofb-tit">{featuredPromo.title}</div>
              {featuredPromo.description && (
                <div className="ofb-sub">{featuredPromo.description}</div>
              )}
              {featuredPromo.date_end && timeLeft > 0 && (
                <div className="cdown">
                  {Number(cd.d) > 0 && (
                    <>
                      <div className="cdu"><div className="cdn">{cd.d}</div><div className="cdl">Jours</div></div>
                      <span className="cds">:</span>
                    </>
                  )}
                  <div className="cdu"><div className="cdn">{cd.h}</div><div className="cdl">Heures</div></div>
                  <span className="cds">:</span>
                  <div className="cdu"><div className="cdn">{cd.m}</div><div className="cdl">Min</div></div>
                  <span className="cds">:</span>
                  <div className="cdu"><div className="cdn">{cd.s}</div><div className="cdl">Sec</div></div>
                </div>
              )}
              <button className="btn btn-wh" onClick={() => onNavigate('detail', { article: featuredPromo.product })}>
                Voir le produit <ArrowRight size={16} style={{ marginLeft: 8 }} />
              </button>
            </div>
            <div
              className="ofb-r"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('detail', { article: featuredPromo.product })}
            >
              <img src={getArticleImage(featuredPromo.product)} alt={featuredPromo.product?.designation || featuredPromo.title} />
              <div className="ofb-badge"><span>{Number(featuredPromo.product?.puv_ttc).toFixed(0)}</span><small>DT</small></div>
            </div>
          </div>
        </div>
      )}

      {/* BEST SELLERS — skeleton row first so the section keeps its height */}
      {loading && (
        <section className="sec">
          <div className="shd">
            <Skeleton h={10} w={110} />
            <Skeleton h={30} w={220} style={{ marginTop: '.6rem' }} />
          </div>
          <SkeletonProductGrid count={4} className="pgrid" />
        </section>
      )}

      {!loading && bestSellers.length > 0 && (
        <section className="sec">
          <div className="flex-between shd rv" style={{ marginBottom: 0 }}>
            <div>
              <div className="stag"><Award size={11} /> Coups de cœur clients</div>
              <h2 className="stit">Meilleures <em>ventes</em></h2>
            </div>
            <button className="btn btn-ol" onClick={() => onNavigate('shop', { filter: 'best' })}>Voir tout <ArrowRight size={16} style={{ marginLeft: 8 }} /></button>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <div className="icr-wrap rv">
              <button className="icr-btn lft" onClick={() => scrollCarousel(-1)}><ChevronLeft size={18} /></button>
              <div className="icr-outer">
                <div className="icr-track" ref={bsRef} style={{ overflowX: 'hidden', scrollBehavior: 'smooth' }}>
                  {bestSellers.map(item => (
                    <ProductCard
                      key={item.id}
                      category={item.categorie?.nom || "Premium"}
                      name={item.designation}
                      price={String(item.puv_ttc)}
                      img={getArticleImage(item)}
                      badge={{ text: 'TOP', type: 'best' }}
                      onDetail={() => onNavigate('detail', { article: item })}
                      onAddToCart={() => { addToCart(item); openCart(); }}
                      onCommander={() => { addToCart(item); onNavigate('checkout'); }}
                    />
                  ))}
                </div>
              </div>
              <button className="icr-btn rgt" onClick={() => scrollCarousel(1)}><ChevronRight size={18} /></button>
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS — SPLIT FEATURE LAYOUT */}
      {novelties.length > 0 && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="shd rv">
            <div className="stag"><Tag size={11} /> Tout juste arrivés</div>
            <h2 className="stit">Nouveaux <em>arrivages</em></h2>
            <p className="ssub">Soyez les premiers à découvrir nos dernières nouveautés — fraîches, de saison et irrésistibles.</p>
          </div>

          <div className="na-split rv">
            {/* LEFT: big featured image */}
            <div
              className="na-feature"
              onClick={() => onNavigate('detail', { article: novelties[0] })}
            >
              <div className="na-feature-img">
                <img src={getArticleImage(novelties[0])} alt={novelties[0].designation} />
              </div>
              <div className="na-label">
                <div className="na-name">{novelties[0].designation}</div>
                <div className="na-price">{Number(novelties[0].puv_ttc).toFixed(3)} DT</div>
              </div>
            </div>

            {/* RIGHT: 2x2 grid */}
            <div className="na-grid">
              {novelties.slice(1, 5).map(item => (
                <div
                  key={item.id}
                  className="na-cell"
                  onClick={() => onNavigate('detail', { article: item })}
                >
                  <div className="na-cell-img">
                    <img src={getArticleImage(item)} alt={item.designation} />
                  </div>
                  <div className="na-label">
                    <div className="na-name">{item.designation}</div>
                    <div className="na-price">{Number(item.puv_ttc).toFixed(3)} DT</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DYNAMIC CATALOGUE */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="flex-between shd rv" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="stag"><Sparkles size={11} /> Toutes les collections</div>
            <h2 className="stit">Catalogue <em>produits</em></h2>
          </div>
          {!showAllCatalogue && (
            <button className="btn btn-ol" onClick={() => setShowAllCatalogue(true)}>
              Voir tout <ArrowRight size={16} style={{ marginLeft: 8 }} />
            </button>
          )}
        </div>

        {showAllCatalogue && !loading && (
          <div className="sc-tabs rv" style={{ marginBottom: '1.5rem' }}>
            <button
              className={`sc-tab ${catalogueFilter === 'all' ? 'on' : ''}`}
              onClick={() => { setCatalogueFilter('all'); setVisibleCatalogueCount(8); }}
            >
              Tout <span className="sc-tab-ct">{countInCategory('all')}</span>
            </button>
            {/* Root categories, each followed by its sub-categories so a shopper
                can narrow down without leaving the home page. */}
            {tree.map(cat => (
              <React.Fragment key={cat.id}>
                <button
                  className={`sc-tab ${String(catalogueFilter) === String(cat.id) ? 'on' : ''}`}
                  onClick={() => { setCatalogueFilter(cat.id); setVisibleCatalogueCount(8); }}
                >
                  {cat.nom} <span className="sc-tab-ct">{countInCategory(cat.id)}</span>
                </button>
                {cat.children.map(sub => (
                  <button
                    key={sub.id}
                    className={`sc-tab sc-tab-sub ${String(catalogueFilter) === String(sub.id) ? 'on' : ''}`}
                    onClick={() => { setCatalogueFilter(sub.id); setVisibleCatalogueCount(8); }}
                  >
                    {sub.nom} <span className="sc-tab-ct">{countInCategory(sub.id)}</span>
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>
        )}

        {loading ? (
          <SkeletonProductGrid count={showAllCatalogue ? 8 : 4} />
        ) : (
          <div className="pgrid">
            {catalogueItems
              .slice(0, showAllCatalogue ? visibleCatalogueCount : 4)
              .map(item => (
                <ProductCard
                  key={item.id}
                  category={item.categorie?.nom || "Premium"}
                  name={item.designation}
                  price={String(item.puv_ttc)}
                  img={getArticleImage(item)}
                  onDetail={() => onNavigate('detail', { article: item })}
                  onAddToCart={() => { addToCart(item); openCart(); }}
                  onCommander={() => { addToCart(item); onNavigate('checkout'); }}
                />
              ))}
          </div>
        )}

        {showAllCatalogue && !loading && catalogueItems.length > visibleCatalogueCount && (
          <div className="text-center" style={{ marginTop: '4rem' }}>
            <button 
              className="btn btn-ol" 
              onClick={() => setVisibleCatalogueCount(prev => prev + 4)}
              style={{ minWidth: '200px' }}
            >
              Afficher plus
            </button>
          </div>
        )}
      </section>

      {/* BRANDS */}
      <Brands onNavigate={onNavigate} />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* NEWSLETTER */}
      <div className="nl">
        <div className="nl-in rv">
          <div className="nl-tag"><Mail size={11} /> Restez informé</div>
          <h2 className="nl-tit">Rejoignez le club <strong>LUMIÈRE</strong></h2>
          <p className="nl-sub">Inscrivez-vous pour accéder en avant-première aux nouveautés, à des offres exclusives et à nos conseils style chaque semaine.</p>
          <div className="nl-form">
            <input className="nl-inp" type="email" placeholder="Votre adresse e-mail…" />
            <button className="btn btn-pr">S’abonner</button>
          </div>
          <p className="nl-note">Jamais de spam. Désinscription à tout moment.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
