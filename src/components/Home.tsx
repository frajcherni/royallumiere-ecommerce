import React, { useState, useEffect, useRef } from 'react';
import Hero from './Hero';
import ProductCard from './ProductCard';
import { Truck, RefreshCcw, Shield, Phone, Sparkles, Tag, Zap, Award, Mail, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { fetchWebsiteArticles, fetchWebsiteCategories, fetchCarouselSlides, Article, Category, CarouselSlide } from '../api';
import Categorystrip from './Categorystrip';

interface HomeProps {
  onNavigate: (id: string, props?: any) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  useScrollReveal();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCatalogue, setShowAllCatalogue] = useState(false);
  const [catalogueFilter, setCatalogueFilter] = useState('all');
  const [visibleCatalogueCount, setVisibleCatalogueCount] = useState(8);

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesData, categoriesData, slidesData] = await Promise.all([
          fetchWebsiteArticles(),
          fetchWebsiteCategories(),
          fetchCarouselSlides()
        ]);
        setArticles(articlesData);
        setCategories(categoriesData);
        setSlides(slidesData);
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter for novelty/new arrivals
  const novelties = articles.filter(a => a.is_new_arrival).slice(0, 5);
  // Filter for best sellers
  const bestSellers = articles.filter(a => a.is_top_seller);

  // Countdown Logic
  const [timeLeft, setTimeLeft] = useState(8 * 3600 + 34 * 60 + 22);
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev <= 0 ? 8 * 3600 : prev - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') };
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

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80&fit=crop";
    if (imagePath.startsWith('http')) return imagePath;
    return `${IMAGE_URL}/${imagePath.replace(/\\/g, '/')}`;
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
      <Hero onNavigate={onNavigate} slides={slides} />

      {/* MARQUEE */}
      <div className="mqbar">
        <div className="mqwrap">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="mqi"><Truck size={11} color="var(--se)" /> Free Shipping Over $50</span>
              <span className="mqi"><Sparkles size={11} color="var(--se)" /> New Arrivals Weekly</span>
              <span className="mqi"><RefreshCcw size={11} color="var(--se)" /> 30-Day Free Returns</span>
              <span className="mqi"><Shield size={11} color="var(--se)" /> Premium Quality Guaranteed</span>
              <span className="mqi"><Sparkles size={11} color="var(--se)" /> Exclusive Member Rewards</span>
              <span className="mqi"><Phone size={11} color="var(--se)" /> 24/7 Customer Support</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/*  <div className="fstrip">
        <div className="finner">
          <div className="fi rv">
            <div className="fi-ic"><Truck size={20} /></div>
            <div>
              <h4>Free Delivery</h4>
              <p>On all orders above $50</p>
            </div>
          </div>
          <div className="fi rv d1">
            <div className="fi-ic"><RefreshCcw size={20} /></div>
            <div>
              <h4>Easy Returns</h4>
              <p>30-day hassle-free policy</p>
            </div>
          </div>
          <div className="fi rv d2">
            <div className="fi-ic"><Shield size={20} /></div>
            <div>
              <h4>Secure Payment</h4>
              <p>100% protected checkout</p>
            </div>
          </div>
          <div className="fi rv d3">
            <div className="fi-ic"><Phone size={20} /></div>
            <div>
              <h4>24/7 Support</h4>
              <p>Always here for you</p>
            </div>
          </div>
        </div>
      </div> */}
     

      {/* NOVELTIES */}
      {novelties.length > 0 && (
        <section className="sec">
          <div className="shd rv">
            <div className="stag"><Sparkles size={11} /> Latest Drops</div>
            <h2 className="stit">What's <em>New</em></h2>
            <p className="ssub">Fresh arrivals curated with exquisite taste — be the first to own something extraordinary.</p>
          </div>
          <div className="nov-g">
            {novelties[0] && (
              <div className="nf rv" onClick={() => onNavigate('detail', { article: novelties[0] })}>
                <img src={getArticleImage(novelties[0])} alt={novelties[0].nom} />
                <div className="nf-ol"></div>
                <span className="pbadge pb-n" style={{ position: 'absolute', top: 14, left: 14 }}>NEW IN</span>
                <div className="nf-b">
                  <div className="nf-tag">★ Editor's Pick</div>
                  <div className="nf-tit">{novelties[0].designation}</div>
                  <div className="nf-pr">${Number(novelties[0].puv_ttc).toFixed(2)}</div>
                </div>
              </div>
            )}
            {novelties.slice(1, 5).map((item, idx) => (
              <div key={item.id} className={`ns rv d${(idx % 2) + 1}`} onClick={() => onNavigate('detail', { article: item })}>
                <img src={getArticleImage(item)} alt={item.nom} />
                <div className="ns-ol"></div>
                <span className="pbadge pb-n" style={{ position: 'absolute', top: 12, left: 12 }}>NEW</span>
                <div className="ns-b">
                  <div className="ns-nm">{item.designation}</div>
                  <div className="ns-pr">${Number(item.puv_ttc).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SHOP BY CATEGORY */}

<Categorystrip categories={categories} onNavigate={onNavigate} getImageUrl={getImageUrl} />
      {/* OFFER BANNER */}
      <div className="ofb-wrap">
        <div className="ofb rv">
          <div className="ofb-l">
            <div className="ofb-ey"><Zap size={13} fill="var(--se)" color="var(--se)" /> Flash Sale — Ends in</div>
            <div className="ofb-tit">Summer Mega Sale<br />Up to 60% Off</div>
            <div className="ofb-sub">Exclusive discounts on our most-coveted premium items. Don't miss these limited-time prices.</div>
            <div className="cdown">
              <div className="cdu"><div className="cdn">{cd.h}</div><div className="cdl">Hours</div></div>
              <span className="cds">:</span>
              <div className="cdu"><div className="cdn">{cd.m}</div><div className="cdl">Mins</div></div>
              <span className="cds">:</span>
              <div className="cdu"><div className="cdn">{cd.s}</div><div className="cdl">Secs</div></div>
            </div>
            <button className="btn btn-wh" onClick={() => onNavigate('offers')}>Shop the Sale <ArrowRight size={16} style={{ marginLeft: 8 }} /></button>
          </div>
          <div className="ofb-r">
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=80&fit=crop" alt="Sale" />
            <div className="ofb-badge"><span>60</span><small>% OFF</small></div>
          </div>
        </div>
      </div>

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="sec">
          <div className="flex-between shd rv" style={{ marginBottom: 0 }}>
            <div>
              <div className="stag"><Award size={11} /> Customer Faves</div>
              <h2 className="stit">Best <em>Sellers</em></h2>
            </div>
            <button className="btn btn-ol" onClick={() => onNavigate('shop', { filter: 'best' })}>View All <ArrowRight size={16} style={{ marginLeft: 8 }} /></button>
          </div>
          <div style={{ marginTop: '2.5rem' }}>
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
                      badge={{ text: 'BEST', type: 'best' }}
                      onDetail={() => onNavigate('detail', { article: item })}
                    />
                  ))}
                </div>
              </div>
              <button className="icr-btn rgt" onClick={() => scrollCarousel(1)}><ChevronRight size={18} /></button>
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {articles.filter(a => a.is_new_arrival).length > 0 && (
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="shd rv">
            <div className="stag"><Tag size={11} /> Just Landed</div>
            <h2 className="stit">New <em>Arrivals</em></h2>
            <p className="ssub">Be the first to discover our latest additions — fresh, seasonal, and utterly covetable.</p>
          </div>
          <div className="pgrid">
            {articles.filter(a => a.is_new_arrival).slice(0, 4).map(item => (
              <ProductCard
                key={item.id}
                category={item.categorie?.nom || "Premium"}
                name={item.designation}
                price={String(item.puv_ttc)}
                img={getArticleImage(item)}
                badge={{ text: 'NEW', type: 'new' }}
                onDetail={() => onNavigate('detail', { article: item })}
              />
            ))}
          </div>
        </section>
      )}

      {/* DYNAMIC CATALOGUE */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="flex-between shd rv" style={{ marginBottom: '2rem' }}>
          <div>
            <div className="stag"><Sparkles size={11} /> All Collections</div>
            <h2 className="stit">Product <em>Catalogue</em></h2>
          </div>
          {!showAllCatalogue && (
            <button className="btn btn-ol" onClick={() => setShowAllCatalogue(true)}>
              View All <ArrowRight size={16} style={{ marginLeft: 8 }} />
            </button>
          )}
        </div>

        {showAllCatalogue && (
          <div className="sc-tabs rv" style={{ marginBottom: '2.5rem' }}>
            <button 
              className={`sc-tab ${catalogueFilter === 'all' ? 'on' : ''}`}
              onClick={() => setCatalogueFilter('all')}
            >
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`sc-tab ${catalogueFilter === String(cat.id) ? 'on' : ''}`}
                onClick={() => setCatalogueFilter(String(cat.id))}
              >
                {cat.nom}
              </button>
            ))}
          </div>
        )}

        <div className="pgrid">
          {articles
            .filter(a => catalogueFilter === 'all' || String(a.categorie?.id) === catalogueFilter)
            .slice(0, showAllCatalogue ? visibleCatalogueCount : 4)
            .map(item => (
              <ProductCard
                key={item.id}
                category={item.categorie?.nom || "Premium"}
                name={item.designation}
                price={String(item.puv_ttc)}
                img={getArticleImage(item)}
                onDetail={() => onNavigate('detail', { article: item })}
              />
            ))}
        </div>

        {showAllCatalogue && articles.filter(a => catalogueFilter === 'all' || String(a.categorie?.id) === catalogueFilter).length > visibleCatalogueCount && (
          <div className="text-center" style={{ marginTop: '4rem' }}>
            <button 
              className="btn btn-ol" 
              onClick={() => setVisibleCatalogueCount(prev => prev + 4)}
              style={{ minWidth: '200px' }}
            >
              Show More
            </button>
          </div>
        )}
      </section>

      {/* TESTIMONIALS */}
      <div style={{ background: 'var(--ow)', borderTop: '1px solid var(--g2)', borderBottom: '1px solid var(--g2)', padding: 'clamp(3rem,6vw,6rem) 0' }}>
        <div className="mx">
          <div className="shd c rv">
            <div className="stag">Reviews</div>
            <h2 className="stit">What Clients <em>Say</em></h2>
          </div>
          <div className="tgrid">
            <div className="tc rv">
              <div className="tc-st">★★★★★</div>
              <p className="tc-tx">Absolutely obsessed with my new bag. The quality is outstanding — shipping was faster than expected. LUMIÈRE has become my go-to for everything luxe.</p>
              <div className="tc-au"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&fit=crop&crop=face" className="tc-av" alt="S" />
                <div><div className="tc-nm">Sarah M.</div><div className="tc-rl">Fashion Blogger · Paris</div></div>
              </div>
            </div>
            <div className="tc rv d1">
              <div className="tc-st">★★★★★</div>
              <p className="tc-tx">The crystal ring is even more beautiful in person. The packaging was immaculate — felt like opening a gift to myself. Five stars, no hesitation.</p>
              <div className="tc-au"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&fit=crop&crop=face" className="tc-av" alt="J" />
                <div><div className="tc-nm">James K.</div><div className="tc-rl">Architect · London</div></div>
              </div>
            </div>
            <div className="tc rv d2">
              <div className="tc-st">★★★★★</div>
              <p className="tc-tx">Customer service went above and beyond. The sneakers fit perfectly and the quality rivals brands twice the price. Truly exceptional experience.</p>
              <div className="tc-au"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80&fit=crop&crop=face" className="tc-av" alt="A" />
                <div><div className="tc-nm">Amira L.</div><div className="tc-rl">Stylist · Dubai</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEWSLETTER */}
      <div className="nl">
        <div className="nl-in rv">
          <div className="nl-tag"><Mail size={11} /> Stay in the Loop</div>
          <h2 className="nl-tit">Join the <strong>LUMIÈRE</strong> Club</h2>
          <p className="nl-sub">Subscribe for early access to new drops, exclusive offers, and styling inspiration delivered weekly.</p>
          <div className="nl-form">
            <input className="nl-inp" type="email" placeholder="Your email address…" />
            <button className="btn btn-pr">Subscribe</button>
          </div>
          <p className="nl-note">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
