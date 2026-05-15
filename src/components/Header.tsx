import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, ShoppingBag, X, ArrowRight, ChevronRight } from 'lucide-react';
import { fetchWebsiteCategories, Category } from '../api';

interface HeaderProps {
  onNavigate: (id: string, props?: any) => void;
  currentPage: string;
}

const NAV = [
  { id: 'home',      label: 'Home' },
  { id: 'shop',      label: 'Shop' },
  { id: 'offers',    label: 'Offers' },
  { id: 'categorie', label: 'Categories', hasMega: true },
  { id: 'about',     label: 'About' },
  { id: 'contact',   label: 'Contact' },
];

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [isMobOpen,   setIsMobOpen]   = useState(false);
  const [activeMenu,  setActiveMenu]  = useState<string | null>(null);
  const [mobExpanded, setMobExpanded] = useState<string | null>(null);
  const [hoveredCat,  setHoveredCat]  = useState<number | null>(null);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [isScrolled,  setIsScrolled]  = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try { setCategories(await fetchWebsiteCategories()); }
      catch (e) { console.error('Header categories error:', e); }
    })();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openMenu  = (id: string) => { if (closeTimer.current) clearTimeout(closeTimer.current); setActiveMenu(id); };
  const closeMenu = ()           => { closeTimer.current = setTimeout(() => { setActiveMenu(null); setHoveredCat(null); }, 140); };
  const keepOpen  = ()           => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const go = (id: string, props?: any) => { onNavigate(id, props); setIsMobOpen(false); setActiveMenu(null); };

  const rootCats = categories.filter(c => !c.parent_id).slice(0, 7);
  const subCats  = (parentId: number) => categories.filter(c => c.parent_id === parentId);
  const activeCat = hoveredCat ?? (rootCats[0]?.id ?? null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── RESET / BASE ───────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        #lum-hdr {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: #ffffff;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s ease;
        }
        #lum-hdr.scrolled {
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }

        /* ── MAIN BAR ───────────────────────────────────────── */
        .lum-bar {
          max-width: 1440px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; height: 72px;
        }

        /* ── LOGO ───────────────────────────────────────────── */
        .lum-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; font-weight: 500; letter-spacing: 0.22em;
          color: #03111f; cursor: pointer; user-select: none;
          display: flex; align-items: center; gap: 0.55rem; flex-shrink: 0;
          text-transform: uppercase;
        }
        .lum-logo-mark {
          width: 32px; height: 32px; flex-shrink: 0;
          border: 1px solid rgba(0,0,0,0.1); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .lum-logo-mark svg { display: block; }
        .lum-logo em  { color: #008fca; font-style: normal; }
        .lum-logo sup { font-size: 0.48rem; vertical-align: super; color: #008fca; letter-spacing: 0; }

        /* ── NAV ────────────────────────────────────────────── */
        .lum-nav { display: flex; align-items: center; gap: 0.5rem; }
        .lum-nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 0 1.2rem; height: 72px;
          font-size: 0.72rem; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(3,17,31,0.6);
          cursor: pointer; background: none; border: none;
          transition: all 0.25s; white-space: nowrap; position: relative;
        }
        .lum-nav-link::after {
          content: ''; position: absolute; bottom: 22px; left: 1.2rem; right: 1.2rem;
          height: 1.5px; background: #008fca;
          transform: scaleX(0); transform-origin: center;
          transition: transform 0.35s cubic-bezier(.4,0,.2,1);
        }
        .lum-nav-link:hover, .lum-nav-link.on { color: #03111f; }
        .lum-nav-link:hover::after, .lum-nav-link.on::after { transform: scaleX(1); }
        .lum-nav-link .chev {
          width: 11px; height: 11px; color: rgba(190,155,100,0.8);
          transition: transform 0.25s, color 0.2s; flex-shrink: 0;
        }
        .lum-nav-link.mopen { color: #03111f; }
        .lum-nav-link.mopen .chev { transform: rotate(180deg); color: #008fca; }

        /* ── RIGHT ICONS ────────────────────────────────────── */
        .lum-nav-r { display: flex; align-items: center; gap: 0.5rem; }
        .lum-ib {
          background: none; border: none; cursor: pointer;
          color: #03111f;
          padding: 10px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; position: relative;
        }
        .lum-ib:hover { background: rgba(0,0,0,0.04); transform: translateY(-1px); }
        .lum-ib-divider {
          width: 1px; height: 20px; background: rgba(0,0,0,0.1); margin: 0 0.5rem;
        }
        .cart-badge {
          position: absolute; top: 6px; right: 6px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #008fca; display: flex; align-items: center; justify-content: center;
          font-size: 0.6rem; font-weight: 700; color: #fff; letter-spacing: 0;
        }
        .lum-hbg {
          display: none; background: none; border: none; cursor: pointer;
          color: #03111f; padding: 8px;
          flex-direction: column; gap: 5px; align-items: flex-end;
        }
        .lum-hbg span {
          display: block; height: 1.5px; background: currentColor;
          transition: width 0.2s;
        }
        .lum-hbg span:nth-child(1) { width: 22px; }
        .lum-hbg span:nth-child(2) { width: 16px; }
        .lum-hbg span:nth-child(3) { width: 20px; }

        /* ── MEGA SHELL ─────────────────────────────────────── */
        .lum-mega {
          position: fixed; left: 0; right: 0; top: 72px; z-index: 999;
          background: #ffffff;
          border-top: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          max-height: 0; opacity: 0; overflow: hidden; pointer-events: none;
          transition: max-height 0.45s cubic-bezier(.4,0,.2,1), opacity 0.3s ease;
        }
        .lum-mega.open { max-height: 600px; opacity: 1; pointer-events: all; }

        /* ── MEGA INNER: two-column layout ──────────────────── */
        .lum-mega-inner {
          max-width: 1440px; margin: 0 auto;
          display: grid; grid-template-columns: 280px 1fr;
          min-height: 420px;
        }

        /* LEFT: category list */
        .lum-cat-list {
          border-right: 1px solid rgba(0,0,0,0.05);
          padding: 2.5rem 0;
          display: flex; flex-direction: column;
          background: #fafafa;
        }
        .lum-cat-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.85rem 2.5rem;
          font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(3,17,31,0.5);
          cursor: pointer; position: relative;
          transition: all 0.2s;
          border: none; background: none; text-align: left; width: 100%;
        }
        .lum-cat-item::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; background: #008fca;
          transform: scaleX(0); transform-origin: left; transition: transform 0.25s;
        }
        .lum-cat-item:hover, .lum-cat-item.active {
          color: #03111f; background: #fff;
        }
        .lum-cat-item.active::before { transform: scaleX(1); }
        .lum-cat-item svg { opacity: 0.3; flex-shrink: 0; transition: all 0.2s; }
        .lum-cat-item.active svg, .lum-cat-item:hover svg { opacity: 1; transform: translateX(3px); color: #008fca; }

        /* RIGHT: sub-category panel */
        .lum-sub-panel {
          padding: 3rem 4rem;
          display: flex; flex-direction: column; gap: 2rem;
        }
        .lum-sub-header {
          display: flex; flex-direction: column; gap: 0.4rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .lum-sub-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 400; letter-spacing: 0.04em;
          color: #03111f;
        }
        .lum-sub-desc {
          font-size: 0.85rem; color: rgba(3,17,31,0.5);
          letter-spacing: 0.02em; line-height: 1.6; max-width: 500px;
        }

        /* Sub-items grid */
        .lum-sub-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.8rem;
        }
        .lum-sub-tile {
          padding: 1rem 1.2rem;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 4px;
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(3,17,31,0.6);
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          background: #fff;
        }
        .lum-sub-tile:hover {
          border-color: #008fca;
          background: rgba(190,155,100,0.04);
          color: #03111f;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .lum-sub-tile svg { opacity: 0; transition: all 0.2s; flex-shrink: 0; color: #008fca; }
        .lum-sub-tile:hover svg { opacity: 1; transform: translateX(3px); }

        /* No sub-items: single explore button */
        .lum-sub-explore {
          margin-top: 0.5rem;
          display: inline-flex; align-items: center; gap: 10px;
          padding: 0.8rem 1.8rem;
          border: 1px solid #008fca; border-radius: 4px;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          color: #008fca; cursor: pointer; background: transparent;
          transition: all 0.25s; align-self: flex-start;
        }
        .lum-sub-explore:hover { background: #008fca; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(190,155,100,0.25); }
        .lum-sub-explore:hover svg { transform: translateX(4px); }
        .lum-sub-explore svg { transition: transform 0.2s; }

        /* Bottom bar */
        .lum-mega-bar {
          border-top: 1px solid rgba(0,0,0,0.05);
          padding: 1.2rem 2.5rem;
          display: flex; align-items: center; gap: 2.5rem;
          background: #fafafa;
        }
        .lum-mega-bar-link {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(3,17,31,0.4); cursor: pointer; transition: all 0.2s;
          background: none; border: none;
        }
        .lum-mega-bar-link:hover { color: #008fca; }
        .lum-mega-bar-cta {
          margin-left: auto;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 20px;
          border: 1px solid rgba(190,155,100,0.4); border-radius: 4px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #008fca; cursor: pointer; background: transparent; transition: all 0.25s;
        }
        .lum-mega-bar-cta:hover { background: #008fca; border-color: #008fca; color: #fff; transform: translateY(-1px); }

        /* Dim overlay */
        .lum-overlay {
          position: fixed; inset: 0; top: 72px; z-index: 998;
          background: rgba(0,0,0,0.2); backdrop-filter: blur(2px);
          pointer-events: none;
          opacity: 0; transition: opacity 0.3s;
        }
        .lum-overlay.vis { opacity: 1; }

        /* ── MOBILE ─────────────────────────────────────────── */
        .lum-mob-bg {
          position: fixed; inset: 0; z-index: 1200;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
          opacity: 0; pointer-events: none; transition: opacity 0.3s;
        }
        .lum-mob-bg.open { opacity: 1; pointer-events: all; }
        .lum-mob-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; width: min(320px, 88vw);
          background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06);
          z-index: 1201; transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(.4,0,.2,1); overflow-y: auto;
        }
        .lum-mob-drawer.open { transform: translateX(0); }
        .lum-mob-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .lum-mob-logo {
          font-family: 'Cormorant Garamond', serif; font-size: 1.3rem;
          font-weight: 600; letter-spacing: 0.15em; color: #03111f; text-transform: uppercase;
        }
        .lum-mob-close {
          background: none; border: none; cursor: pointer;
          color: #03111f; padding: 6px; transition: opacity 0.2s;
        }
        .lum-mob-close:hover { opacity: 0.6; }
        .lum-mob-item { border-bottom: 1px solid rgba(0,0,0,0.04); }
        .lum-mob-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.2rem 1.5rem; width: 100%; text-align: left;
          font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(3,17,31,0.6); cursor: pointer; background: none; border: none;
          transition: color 0.2s;
        }
        .lum-mob-link:hover, .lum-mob-link.on { color: #03111f; }
        .lum-mob-link .chev { color: #008fca; }
        .lum-mob-sub {
          max-height: 0; overflow: hidden;
          transition: max-height 0.4s cubic-bezier(.4,0,.2,1);
          background: #fcfcfc;
        }
        .lum-mob-sub.open { max-height: 1600px; }
        .lum-mob-sub-h {
          padding: 0.8rem 1.5rem 0.4rem;
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          color: #008fca; border-top: 1px solid rgba(0,0,0,0.03);
        }
        .lum-mob-sub a {
          display: block; padding: 0.6rem 2rem;
          font-size: 0.85rem; color: rgba(3,17,31,0.5);
          cursor: pointer; transition: color 0.2s;
        }
        .lum-mob-sub a:hover { color: #008fca; }
        .lum-mob-sub .mob-explore {
          margin: 0.8rem 2rem 1.2rem;
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #008fca; cursor: pointer;
        }

        @media (max-width: 1024px) {
          .lum-nav  { display: none; }
          .lum-hbg  { display: flex; }
          .lum-bar  { height: 64px; }
          .lum-mega { top: 64px; }
          .lum-overlay { top: 64px; }
        }
        @media (max-width: 600px) { .lum-bar { padding: 0 1.2rem; } }
      `}</style>

      {/* Dim overlay */}
      <div className={`lum-overlay${activeMenu ? ' vis' : ''}`} />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header id="lum-hdr" className={isScrolled ? 'scrolled' : ''}>
        {/* Main bar */}
        <div className="lum-bar">
          {/* Logo */}
          <a className="lum-logo" onClick={() => go('home')}>
            <span className="lum-logo-mark">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2.5" fill="#008fca"/>
                <circle cx="7" cy="7" r="5.5" stroke="#008fca" strokeWidth="0.8"/>
              </svg>
            </span>
            LUM<em>IÈ</em>RE<sup>®</sup>
          </a>

          {/* Desktop nav */}
          <nav className="lum-nav">
            {NAV.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => item.hasMega ? openMenu(item.id) : setActiveMenu(null)}
                onMouseLeave={item.hasMega ? closeMenu : undefined}
              >
                <button
                  className={[
                    'lum-nav-link',
                    currentPage === item.id ? 'on' : '',
                    activeMenu === item.id ? 'mopen' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => item.hasMega ? openMenu(item.id) : go(item.id)}
                >
                  {item.label}
                  {item.hasMega && (
                    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </nav>

          {/* Right icons */}
          <div className="lum-nav-r">
            <button className="lum-ib" aria-label="Search"><Search size={18} /></button>
            <button className="lum-ib" aria-label="Wishlist"><Heart size={18} /></button>
            <div className="lum-ib-divider" />
            <button className="lum-ib" aria-label="Cart">
              <ShoppingBag size={18} />
              <span className="cart-badge">2</span>
            </button>
            <button className="lum-hbg" aria-label="Menu" onClick={() => setIsMobOpen(true)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* ── CATEGORIES MEGA MENU ─────────────────────────────────────────── */}
      <div
        className={`lum-mega${activeMenu === 'categorie' ? ' open' : ''}`}
        onMouseEnter={keepOpen}
        onMouseLeave={closeMenu}
      >
        <div className="lum-mega-inner">

          {/* LEFT: category list */}
          <div className="lum-cat-list">
            {rootCats.map((cat) => (
              <button
                key={cat.id}
                className={`lum-cat-item${activeCat === cat.id ? ' active' : ''}`}
                onMouseEnter={() => setHoveredCat(cat.id)}
                onClick={() => go('shop', { category: cat.id })}
              >
                {cat.nom}
                <ChevronRight size={14} />
              </button>
            ))}
          </div>

          {/* RIGHT: sub-category panel */}
          {rootCats.map((cat) => {
            const subs = subCats(cat.id);
            return (
              <div
                key={cat.id}
                className="lum-sub-panel"
                style={{ display: activeCat === cat.id ? 'flex' : 'none' }}
              >
                <div className="lum-sub-header">
                  <span className="lum-sub-title">{cat.nom}</span>
                  {cat.description && (
                    <span className="lum-sub-desc">{cat.description}</span>
                  )}
                </div>

                {subs.length > 0 ? (
                  <div className="lum-sub-grid">
                    {subs.map((sub) => (
                      <button
                        key={sub.id}
                        className="lum-sub-tile"
                        onClick={() => go('shop', { category: sub.id })}
                      >
                        {sub.nom}
                        <ArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    className="lum-sub-explore"
                    onClick={() => go('shop', { category: cat.id })}
                  >
                    Explore collection <ArrowRight size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="lum-mega-bar">
          <button className="lum-mega-bar-link" onClick={() => go('shop', { filter: 'new' })}>New Arrivals</button>
          <button className="lum-mega-bar-link" onClick={() => go('shop', { filter: 'best' })}>Best Sellers</button>
          <button className="lum-mega-bar-link" onClick={() => go('shop', { filter: 'sale' })}>On Sale</button>
          <button className="lum-mega-bar-cta" onClick={() => go('shop')}>
            All categories <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── MOBILE OVERLAY + DRAWER ─────────────────────────────────────── */}
      <div className={`lum-mob-bg${isMobOpen ? ' open' : ''}`} onClick={() => setIsMobOpen(false)} />

      <div className={`lum-mob-drawer${isMobOpen ? ' open' : ''}`}>
        <div className="lum-mob-head">
          <span className="lum-mob-logo">LUMIÈRE<sup style={{ fontSize: '0.5rem', color: '#008fca', verticalAlign: 'super' }}>®</sup></span>
          <button className="lum-mob-close" onClick={() => setIsMobOpen(false)}><X size={20} /></button>
        </div>

        {NAV.map((item) => (
          <div className="lum-mob-item" key={item.id}>
            <button
              className={['lum-mob-link', currentPage === item.id ? 'on' : ''].filter(Boolean).join(' ')}
              onClick={() => {
                if (item.hasMega) setMobExpanded(mobExpanded === item.id ? null : item.id);
                else go(item.id);
              }}
            >
              {item.label}
              {item.hasMega && (
                <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>

            {item.hasMega && (
              <div className={`lum-mob-sub${mobExpanded === item.id ? ' open' : ''}`}>
                {rootCats.map((cat) => {
                  const subs = subCats(cat.id);
                  return (
                    <div key={cat.id}>
                      <p className="lum-mob-sub-h">{cat.nom}</p>
                      {subs.length > 0
                        ? subs.map((sub) => (
                            <a key={sub.id} onClick={() => go('shop', { category: sub.id })}>{sub.nom}</a>
                          ))
                        : (
                          <span className="mob-explore" onClick={() => go('shop', { category: cat.id })}>
                            Explore <ArrowRight size={10} />
                          </span>
                        )
                      }
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default Header;