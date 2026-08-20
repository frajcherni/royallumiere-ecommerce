import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ShoppingBag, X, ArrowRight, ChevronDown, Plus, CornerDownLeft } from 'lucide-react';
import { getImageUrl, searchArticles, Article, CategoryNode } from '../api';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import SiteLogo from './SiteLogo';

interface HeaderProps {
  onNavigate: (id: string, props?: any) => void;
  currentPage: string;
}

// Kept for reference — header nav now renders categories directly instead of these static links.
// const NAV = [
//   { id: 'home',      label: 'Home' },
//   { id: 'shop',      label: 'Shop' },
//   { id: 'offers',    label: 'Offers' },
//   { id: 'categorie', label: 'Categories', hasMega: true },
//   { id: 'about',     label: 'About' },
//   { id: 'contact',   label: 'Contact' },
// ];

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [isMobOpen,   setIsMobOpen]   = useState(false);
  const [activeMenu,  setActiveMenu]  = useState<number | null>(null);
  const [mobExpanded, setMobExpanded] = useState<number | null>(null);
  const [isScrolled,  setIsScrolled]  = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── SEARCH ──────────────────────────────────────────────────
     Hits the back office's own POST /articles/search (searchArticles),
     so a term matches reference, désignation, nom, catégorie or marque
     exactly like it does inside the ERP. */
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [query,         setQuery]         = useState('');
  const [results,       setResults]       = useState<Article[]>([]);
  const [searching,     setSearching]     = useState(false);
  const [searchTotal,   setSearchTotal]   = useState(0);
  const [searchFailed,  setSearchFailed]  = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef  = useRef<HTMLDivElement>(null);

  const { totalItems, openCart } = useCart();
  // Categories come from the shared catalogue, so the nav is already populated
  // on first paint and never blanks out when moving between pages.
  const { tree, loading, articlesInCategory, countInCategory } = useCatalog();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openMenu  = (id: number) => { if (closeTimer.current) clearTimeout(closeTimer.current); setActiveMenu(id); };
  const closeMenu = ()           => { closeTimer.current = setTimeout(() => setActiveMenu(null), 80); };
  const keepOpen  = ()           => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
    setSearchTotal(0);
    setSearchFailed(false);
  };

  const go = (id: string, props?: any) => {
    onNavigate(id, props);
    setIsMobOpen(false);
    setActiveMenu(null);
    closeSearch();
  };

  /** Minimum term length before we bother the API. */
  const MIN_QUERY = 2;
  /** How many suggestions fit in the dropdown. */
  const SUGGESTIONS = 6;

  // Debounced live suggestions. Each keystroke aborts the previous request so
  // a slow response can never overwrite the results of a newer term.
  useEffect(() => {
    if (!searchOpen) return;
    const term = query.trim();
    if (term.length < MIN_QUERY) {
      setResults([]);
      setSearchTotal(0);
      setSearching(false);
      setSearchFailed(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setSearching(true);
    setSearchFailed(false);

    const timer = setTimeout(() => {
      searchArticles(term, { limit: SUGGESTIONS, signal: controller.signal })
        .then(({ articles, total }) => {
          if (cancelled) return;
          setResults(articles);
          setSearchTotal(total);
        })
        .catch(() => {
          if (cancelled) return;
          setResults([]);
          setSearchTotal(0);
          setSearchFailed(true);
        })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchOpen]);

  // Focus the field as soon as the panel opens.
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Escape closes it, and so does a click anywhere outside the panel.
  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch(); };
    const onDown = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node)) closeSearch();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [searchOpen]);

  /** Enter (or "see all results") hands the term over to the shop page. */
  const submitSearch = (term?: string) => {
    const q = (term ?? query).trim();
    if (q.length < MIN_QUERY) return;
    go('shop', { search: q });
  };

  const rootCats: CategoryNode[]     = tree.slice(0, 7);
  const overflowCats: CategoryNode[] = tree.slice(7);
  const subCats = (cat: CategoryNode) => cat.children;

  /** How many products a leaf category shows in its dropdown — one row of the
   *  grid, so the panel stays a short strip instead of covering the page. */
  const MENU_PRODUCTS = 4;

  /**
   * A category with sub-categories lists those; a leaf category lists its
   * products instead, so every nav entry has something to drop down.
   * Computed once per catalogue change rather than on every hover render.
   */
  const leafProducts = useMemo(() => {
    const map = new Map<number, Article[]>();
    rootCats.forEach(cat => {
      if (cat.children.length === 0) {
        map.set(Number(cat.id), articlesInCategory(cat.id).slice(0, MENU_PRODUCTS));
      }
    });
    return map;
    // rootCats is derived from `tree`, so tracking the tree is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree, articlesInCategory]);

  const menuProducts = (cat: CategoryNode): Article[] => leafProducts.get(Number(cat.id)) || [];

  /** True when the category has anything worth opening a panel for. */
  const hasMenu = (cat: CategoryNode) =>
    cat.children.length > 0 || countInCategory(cat.id) > 0;

  const articleImage = (item: Article) => {
    if (item.image) return getImageUrl(item.image);
    if (item.website_images && item.website_images.length > 0) {
      return getImageUrl(item.website_images[0]);
    }
    return getImageUrl(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

        /* ── RESET / BASE ───────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        #lum-hdr {
          position: fixed; top: var(--topbar, 0px); left: 0; right: 0; z-index: 1000;
          background: #ffffff;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          font-family: var(--font, 'Montserrat'), sans-serif;
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
          font-family: var(--font, 'Montserrat'), sans-serif;
          font-size: 1.6rem; font-weight: 500; letter-spacing: 0.22em;
          color: #03111f; cursor: pointer; user-select: none;
          display: flex; align-items: center; gap: 0.55rem; flex-shrink: 0;
          text-transform: uppercase;
        }
        .lum-logo em  { color: #008fca; font-style: normal; }
        .lum-logo sup { font-size: 0.48rem; vertical-align: super; color: #008fca; letter-spacing: 0; }
        /* Uploaded logo — height comes from the ERP setting, width follows. */
        .lum-logo .site-logo-img {
          width: auto; max-width: 220px; object-fit: contain; display: block;
        }
        .lum-logo .site-logo-name { white-space: nowrap; }

        /* ── NAV ────────────────────────────────────────────── */
        .lum-nav { display: flex; align-items: center; gap: 0.5rem; }
        .lum-navcat { position: relative; }
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
        .lum-nav-plus { padding: 0 0.9rem; }
        .lum-nav-sk { display: flex; align-items: center; gap: 1.6rem; padding: 0 1.2rem; }
        .lum-mega-sub-all .lum-mega-sub-item-name { color: #008fca; font-style: italic; }

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
        .lum-ib.on { background: rgba(0,143,202,0.1); color: #008fca; }

        /* ── SEARCH ─────────────────────────────────────────── */
        .lum-search { position: relative; display: flex; align-items: center; }
        .lum-search-panel {
          position: absolute; top: calc(100% + 14px); right: 0;
          width: min(460px, calc(100vw - 2rem));
          background: #fff; border: 1px solid rgba(0,0,0,0.07);
          border-radius: 8px; box-shadow: 0 22px 46px rgba(3,17,31,0.16);
          overflow: hidden; z-index: 1002;
          animation: lumFadeUp 0.18s cubic-bezier(.4,0,.2,1) forwards;
        }
        .lum-search-field {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.85rem 1rem; border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .lum-search-ico { color: rgba(3,17,31,0.35); flex-shrink: 0; }
        .lum-search-field input {
          flex: 1; min-width: 0; border: none; outline: none; background: none;
          font-family: var(--font, 'Montserrat'), sans-serif; font-size: 0.88rem; color: #03111f;
        }
        .lum-search-field input::placeholder { color: rgba(3,17,31,0.35); }
        .lum-search-field input::-webkit-search-cancel-button { display: none; }
        .lum-search-clear {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: rgba(3,17,31,0.4); display: flex; border-radius: 50%;
        }
        .lum-search-clear:hover { background: rgba(0,0,0,0.05); color: #03111f; }

        .lum-search-body { max-height: 380px; overflow-y: auto; }
        .lum-search-hint {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 1.4rem 1rem; font-size: 0.8rem; color: rgba(3,17,31,0.5);
        }
        .lum-search-spin {
          width: 13px; height: 13px; border-radius: 50%; flex-shrink: 0;
          border: 1.5px solid rgba(0,143,202,0.25); border-top-color: #008fca;
          animation: lumSpin 0.7s linear infinite;
        }
        @keyframes lumSpin { to { transform: rotate(360deg); } }

        .lum-search-row {
          display: flex; align-items: center; gap: 0.85rem; width: 100%;
          padding: 0.6rem 1rem; background: none; border: none;
          cursor: pointer; text-align: left; transition: background 0.15s;
        }
        .lum-search-row:hover { background: rgba(0,143,202,0.06); }
        .lum-search-row-img {
          width: 46px; height: 46px; flex-shrink: 0;
          border-radius: 5px; overflow: hidden; background: #f4f4f0;
        }
        .lum-search-row-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lum-search-row-tx { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
        .lum-search-row-nm {
          font-size: 0.85rem; color: #03111f;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .lum-search-row-ct {
          font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(3,17,31,0.4);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .lum-search-row-pr {
          font-family: var(--font, 'Montserrat'), sans-serif; font-size: 0.76rem;
          color: #008fca; white-space: nowrap; flex-shrink: 0;
        }
        .lum-search-all {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 0.85rem 1rem;
          border: none; border-top: 1px solid rgba(0,0,0,0.06);
          background: #f9fbfc; cursor: pointer;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #008fca;
        }
        .lum-search-all:hover { background: rgba(0,143,202,0.09); }

        .lum-mob-search {
          display: flex; align-items: center; gap: 0.6rem;
          margin: 0 2rem 1rem; padding: 0.7rem 0.9rem;
          border: 1px solid rgba(0,0,0,0.1); border-radius: 6px;
          color: rgba(3,17,31,0.4);
        }
        .lum-mob-search input {
          flex: 1; min-width: 0; border: none; outline: none; background: none;
          font-family: var(--font, 'Montserrat'), sans-serif; font-size: 0.85rem; color: #03111f;
        }
        .lum-mob-search input::-webkit-search-cancel-button { display: none; }

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

        /* ── FULL-WIDTH CATEGORY MEGA PANEL ─────────────────── */
        @keyframes lumFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lum-mega {
          position: fixed; left: 0; right: 0; top: calc(72px + var(--topbar, 0px)); z-index: 999;
          background: #ffffff;
          border-top: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 24px 48px rgba(3,17,31,0.12);
          opacity: 0; visibility: hidden; transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.16s cubic-bezier(.4,0,.2,1), transform 0.16s cubic-bezier(.4,0,.2,1), visibility 0.16s;
          will-change: opacity, transform;
        }
        .lum-mega.open { opacity: 1; visibility: visible; transform: translateY(0); pointer-events: all; }
        /* The panel is a short strip: it hugs its content instead of forcing a
           380px block, and a long sub-category list scrolls inside it rather
           than pushing the dropdown down the page. */
        .lum-mega-inner {
          max-width: 1440px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 340px;
          min-height: 0; max-height: 62vh;
        }
        .lum-mega-subs {
          padding: 1.7rem 3rem 1.9rem;
          display: flex; flex-wrap: wrap; align-content: flex-start;
          gap: 1.2rem 2.6rem;
          overflow-y: auto;
        }

        /* Sub-category: plain text item, no card/box — just a bigger label + a small line */
        .lum-mega-sub-item {
          background: none; border: none; padding: 0; cursor: pointer; text-align: left;
          display: inline-flex; flex-direction: column; gap: 0.35rem;
          opacity: 0; transform: translateY(10px);
        }
        .lum-mega.open .lum-mega-sub-item { animation: lumFadeUp 0.24s cubic-bezier(.4,0,.2,1) forwards; }
        .lum-mega-sub-item-name {
          font-family: var(--font, 'Montserrat'), sans-serif;
          font-size: 1.15rem; font-weight: 500; letter-spacing: 0.02em;
          color: #03111f; transition: color 0.2s ease;
        }
        .lum-mega-sub-item:hover .lum-mega-sub-item-name { color: #008fca; }
        .lum-mega-sub-item-line {
          height: 1.5px; width: 26px; background: #008fca;
          transition: width 0.25s cubic-bezier(.4,0,.2,1);
        }
        .lum-mega-sub-item:hover .lum-mega-sub-item-line { width: 60px; }

        /* ── LEAF CATEGORY: PRODUCTS INSIDE THE DROPDOWN ────── */
        .lum-mega-prodwrap {
          padding: 1.4rem 3rem 1.6rem;
          display: flex; flex-direction: column; gap: 1rem;
          min-width: 0;
        }
        .lum-mega-prodhead {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 1.5rem; padding-bottom: 0.7rem;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .lum-mega-prodhead-tit {
          font-family: var(--font, 'Montserrat'), sans-serif;
          font-size: 1.2rem; font-weight: 500; color: #03111f;
        }
        .lum-mega-prodhead-all {
          display: inline-flex; align-items: center; gap: 7px;
          background: none; border: none; cursor: pointer;
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #008fca;
          white-space: nowrap; transition: gap 0.2s;
        }
        .lum-mega-prodhead-all:hover { gap: 12px; }

        .lum-mega-prods {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.9rem 1.5rem;
        }
        .lum-mega-prod {
          background: none; border: none; padding: 0; cursor: pointer; text-align: left;
          display: flex; flex-direction: column; gap: 0.55rem; min-width: 0;
          opacity: 0; transform: translateY(10px);
        }
        .lum-mega.open .lum-mega-prod { animation: lumFadeUp 0.24s cubic-bezier(.4,0,.2,1) forwards; }
        /* Capped so four square thumbnails cannot make the strip tall again. */
        .lum-mega-prod-img {
          display: block; width: 100%; aspect-ratio: 4 / 3; max-height: 130px;
          background: #f4f4f0; border-radius: 6px; overflow: hidden;
        }
        .lum-mega-prod-img img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.45s cubic-bezier(.4,0,.2,1);
        }
        .lum-mega-prod:hover .lum-mega-prod-img img { transform: scale(1.07); }
        .lum-mega-prod-nm {
          font-size: 0.82rem; font-weight: 500; color: #03111f; line-height: 1.35;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; transition: color 0.2s;
        }
        .lum-mega-prod:hover .lum-mega-prod-nm { color: #008fca; }
        .lum-mega-prod-pr {
          font-family: var(--font, 'Montserrat'), sans-serif;
          font-size: 0.74rem; color: rgba(3,17,31,0.5);
        }

        /* Mobile drawer: product rows for a leaf category */
        .lum-mob-prod {
          display: flex; align-items: center; gap: 0.85rem; width: 100%;
          padding: 0.6rem 2.5rem; background: none; border: none;
          cursor: pointer; text-align: left; transition: background 0.2s;
        }
        .lum-mob-prod:hover { background: rgba(0,143,202,0.06); }
        .lum-mob-prod-img {
          width: 42px; height: 42px; flex-shrink: 0;
          border-radius: 5px; overflow: hidden; background: #f4f4f0;
        }
        .lum-mob-prod-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lum-mob-prod-tx { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .lum-mob-prod-nm {
          font-size: 0.84rem; color: rgba(3,17,31,0.78);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .lum-mob-prod-pr {
          font-family: var(--font, 'Montserrat'), sans-serif;
          font-size: 0.72rem; color: #008fca;
        }

        .lum-mega-img {
          position: relative;
          border-left: 1px solid rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .lum-mega-img img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .lum-mega-img::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(3,17,31,0) 55%, rgba(3,17,31,0.55) 100%);
        }
        .lum-mega-img-cap {
          position: absolute; left: 28px; right: 28px; bottom: 26px; z-index: 1;
          color: #fff;
        }
        .lum-mega-img-cap .lum-mega-img-tit {
          font-family: var(--font, 'Montserrat'), sans-serif;
          font-size: 1.7rem; font-weight: 500; letter-spacing: 0.03em;
        }
        .lum-mega-img-cap .lum-mega-img-sub {
          margin-top: 0.3rem;
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.75);
        }

        /* Dim overlay */
        .lum-overlay {
          position: fixed; inset: 0; top: calc(72px + var(--topbar, 0px)); z-index: 998;
          background: rgba(0,0,0,0.2); backdrop-filter: blur(2px);
          pointer-events: none;
          opacity: 0; transition: opacity 0.16s ease;
        }
        .lum-overlay.vis { opacity: 1; }

        /* ── MOBILE ─────────────────────────────────────────── */
        .lum-mob-bg {
          position: fixed; inset: 0; z-index: 1200;
          background: rgba(3,17,31,0.3); backdrop-filter: blur(8px);
          opacity: 0; pointer-events: none; transition: opacity 0.4s;
        }
        .lum-mob-bg.open { opacity: 1; pointer-events: all; }
        .lum-mob-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; width: min(340px, 90vw);
          background: #ffffff; border-left: 1px solid rgba(0,0,0,0.06);
          z-index: 1201; transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto; display: flex; flex-direction: column;
        }
        .lum-mob-drawer.open { transform: translateX(0); }
        .lum-mob-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 2rem; position: sticky; top: 0; background: #fff; z-index: 2;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .lum-mob-logo {
          font-family: var(--font, 'Montserrat'), sans-serif; font-size: 1.35rem;
          font-weight: 600; letter-spacing: 0.18em; color: #03111f; text-transform: uppercase;
          display: flex; align-items: center; gap: 0.5rem; cursor: pointer; min-width: 0;
        }
        .lum-mob-logo .site-logo-img { width: auto; max-width: 150px; object-fit: contain; }
        .lum-mob-logo sup { font-size: 0.5rem; vertical-align: super; color: #008fca; letter-spacing: 0; }
        .lum-mob-close {
          background: #f8f9fa; border: none; cursor: pointer;
          color: #03111f; width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .lum-mob-close:hover { background: #eee; }

        .lum-mob-body { padding: 1rem 0 3rem; }
        .lum-mob-item { border-bottom: 1px solid rgba(0,0,0,0.03); }
        .lum-mob-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 2rem; width: 100%; text-align: left;
          font-size: 0.82rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(3,17,31,0.6); cursor: pointer; background: none; border: none;
          transition: all 0.2s;
        }
        .lum-mob-link:hover, .lum-mob-link.on { color: #008fca; background: #f9fbfc; }
        .lum-mob-link.on { border-left: 3px solid #008fca; padding-left: calc(2rem - 3px); }
        .lum-mob-link .chev { color: rgba(0,0,0,0.2); transition: transform 0.3s; }
        .lum-mob-link.active .chev { transform: rotate(180deg); color: #008fca; }

        .lum-mob-sub {
          max-height: 0; overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          background: #f8fafb;
        }
        .lum-mob-sub.open { max-height: 2000px; padding-bottom: 1rem; }
        .lum-mob-sub a {
          display: block; padding: 0.7rem 3rem;
          font-size: 0.88rem; color: rgba(3,17,31,0.55);
          cursor: pointer; transition: all 0.2s; text-decoration: none;
        }
        .lum-mob-sub a:hover { color: #008fca; padding-left: 3.2rem; }
        .lum-mob-sub .mob-explore {
          margin: 0.8rem 2.5rem 0.5rem;
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #008fca; cursor: pointer;
        }
        .lum-mob-viewall {
          margin: 0.5rem 2rem 0;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 0.9rem 1.5rem;
          border: 1px solid #008fca; border-radius: 4px;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #008fca; cursor: pointer; background: transparent;
        }


        /* Between 1024px and 1280px the mega panel loses room to the image
           column, so everything tightens — but the products stay on one row. */
        @media (max-width: 1280px) {
          .lum-mega-inner    { grid-template-columns: 1fr 260px; }
          .lum-mega-prodwrap { padding: 1.2rem 1.8rem 1.4rem; }
          .lum-mega-prods    { gap: 0.8rem 1.1rem; }
          .lum-mega-prod-img { max-height: 105px; }
          .lum-mega-subs     { padding: 1.4rem 1.8rem 1.6rem; gap: 1rem 2rem; }
        }

        @media (max-width: 1024px) {
          .lum-nav  { display: none; }
          .lum-hbg  { display: flex; }
          .lum-bar  { height: 64px; padding: 0 1.5rem; }
          .lum-logo { font-size: 1.25rem; letter-spacing: 0.18em; }
          .lum-logo .site-logo-img { max-width: 170px; max-height: 40px; }
          .lum-overlay { top: 64px; }
        }
        @media (max-width: 600px) {
          .lum-bar { padding: 0 1rem; }
          .lum-logo { font-size: 1.15rem; letter-spacing: 0.15em; }
          .lum-logo .site-logo-img { max-width: 130px; max-height: 34px; }
          .lum-search-panel { right: -52px; width: calc(100vw - 2rem); }
          .lum-ib { padding: 8px; }
          .lum-ib-divider { margin: 0 0.2rem; }
        }

      `}</style>

      {/* Dim overlay */}
      <div className={`lum-overlay${activeMenu !== null ? ' vis' : ''}`} />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header id="lum-hdr" className={isScrolled ? 'scrolled' : ''}>
        {/* Main bar */}
        <div className="lum-bar">
          {/* Logo — uploaded in the ERP (Site Web → Gestion Logo) */}
          <SiteLogo className="lum-logo" onClick={() => go('home')} />

          {/* Desktop nav — one entry per root category + a "view all" link */}
          <nav className="lum-nav">
            {loading && rootCats.length === 0 && (
              <span className="lum-nav-sk" aria-hidden="true">
                {[68, 92, 76, 84, 70].map((w, i) => (
                  <span className="sk" key={i} style={{ width: w, height: 11, borderRadius: 4 }} />
                ))}
              </span>
            )}
            {rootCats.map((cat) => {
              const openable = hasMenu(cat);
              return (
                <div
                  key={cat.id}
                  className="lum-navcat"
                  onMouseEnter={() => { if (openable) openMenu(cat.id); }}
                  onMouseLeave={closeMenu}
                >
                  <button
                    className={['lum-nav-link', activeMenu === cat.id ? 'mopen' : ''].filter(Boolean).join(' ')}
                    onClick={() => go('shop', { category: cat.id })}
                  >
                    {cat.nom}
                    {openable && (
                      <ChevronDown className="chev" size={11} />
                    )}
                  </button>
                </div>
              );
            })}

            {!loading && (
              <button
                className="lum-nav-link lum-nav-plus"
                aria-label="Toutes les catégories"
                title="Toutes les catégories"
                onClick={() => go('categories')}
              >
                Voir plus{overflowCats.length > 0 ? ` (${overflowCats.length})` : ''} <Plus size={14} />
              </button>
            )}
          </nav>

          {/* Right icons */}
          <div className="lum-nav-r">
            <div className="lum-search" ref={searchWrapRef}>
              <button
                className={`lum-ib${searchOpen ? ' on' : ''}`}
                aria-label={searchOpen ? 'Fermer la recherche' : 'Rechercher'}
                aria-expanded={searchOpen}
                onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {searchOpen && (
                <div className="lum-search-panel">
                  <form
                    className="lum-search-field"
                    onSubmit={(e) => { e.preventDefault(); submitSearch(); }}
                  >
                    <Search size={16} className="lum-search-ico" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher un produit, une référence…"
                      aria-label="Rechercher"
                    />
                    {query && (
                      <button
                        type="button"
                        className="lum-search-clear"
                        aria-label="Effacer"
                        onClick={() => { setQuery(''); searchInputRef.current?.focus(); }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </form>

                  <div className="lum-search-body">
                    {query.trim().length < MIN_QUERY ? (
                      <div className="lum-search-hint">
                        Saisissez au moins {MIN_QUERY} caractères pour lancer la recherche.
                      </div>
                    ) : searching ? (
                      <div className="lum-search-hint">
                        <span className="lum-search-spin" /> Recherche…
                      </div>
                    ) : searchFailed ? (
                      <div className="lum-search-hint">
                        La recherche est momentanément indisponible.
                      </div>
                    ) : results.length === 0 ? (
                      <div className="lum-search-hint">
                        Aucun produit pour « {query.trim()} ».
                      </div>
                    ) : (
                      <>
                        {results.map((item) => (
                          <button
                            key={item.id}
                            className="lum-search-row"
                            onClick={() => go('detail', { article: item })}
                          >
                            <span className="lum-search-row-img">
                              <img src={articleImage(item)} alt={item.designation} loading="lazy" />
                            </span>
                            <span className="lum-search-row-tx">
                              <span className="lum-search-row-nm">{item.designation}</span>
                              {item.categorie?.nom && (
                                <span className="lum-search-row-ct">{item.categorie.nom}</span>
                              )}
                            </span>
                            <span className="lum-search-row-pr">
                              {Number(item.puv_ttc).toFixed(3)} DT
                            </span>
                          </button>
                        ))}
                        <button className="lum-search-all" onClick={() => submitSearch()}>
                          Voir les {searchTotal} résultat{searchTotal > 1 ? 's' : ''}
                          <CornerDownLeft size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="lum-ib-divider" />
            <button className="lum-ib" aria-label="Panier" onClick={openCart} style={{ position: 'relative' }}>
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
              )}
            </button>
            <button className="lum-hbg" aria-label="Menu" onClick={() => setIsMobOpen(true)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* ── FULL-WIDTH CATEGORY MEGA PANELS ──────────────────────────────── */}
      {rootCats.map((cat) => {
        const subs = subCats(cat);
        const products = menuProducts(cat);
        const total = countInCategory(cat.id);
        if (subs.length === 0 && products.length === 0) return null;
        return (
          <div
            key={cat.id}
            className={`lum-mega${activeMenu === cat.id ? ' open' : ''}`}
            onMouseEnter={keepOpen}
            onMouseLeave={closeMenu}
          >
            <div className="lum-mega-inner">
              {subs.length > 0 ? (
                /* ── Category with sub-categories: list the sub-categories ── */
                <div className="lum-mega-subs">
                  <button
                    className="lum-mega-sub-item lum-mega-sub-all"
                    onClick={() => go('shop', { category: cat.id })}
                  >
                    <span className="lum-mega-sub-item-name">Tout {cat.nom}</span>
                    <span className="lum-mega-sub-item-line" />
                  </button>
                  {subs.map((sub, i) => (
                    <button
                      key={sub.id}
                      className="lum-mega-sub-item"
                      style={{ animationDelay: `${Math.min(i * 30, 150)}ms` }}
                      onClick={() => go('shop', { category: sub.id })}
                    >
                      <span className="lum-mega-sub-item-name">{sub.nom}</span>
                      <span className="lum-mega-sub-item-line" />
                    </button>
                  ))}
                </div>
              ) : (
                /* ── Leaf category: no sub-categories, so show the products ── */
                <div className="lum-mega-prodwrap">
                  <div className="lum-mega-prodhead">
                    <span className="lum-mega-prodhead-tit">{cat.nom}</span>
                    <button className="lum-mega-prodhead-all" onClick={() => go('shop', { category: cat.id })}>
                      Voir les {total} produits <ArrowRight size={13} />
                    </button>
                  </div>
                  <div className="lum-mega-prods">
                    {products.map((item, i) => (
                      <button
                        key={item.id}
                        className="lum-mega-prod"
                        style={{ animationDelay: `${Math.min(i * 30, 180)}ms` }}
                        onClick={() => go('detail', { article: item })}
                      >
                        <span className="lum-mega-prod-img">
                          <img src={articleImage(item)} alt={item.designation} loading="lazy" />
                        </span>
                        <span className="lum-mega-prod-nm">{item.designation}</span>
                        <span className="lum-mega-prod-pr">{Number(item.puv_ttc).toFixed(3)} DT</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="lum-mega-img">
                <img src={getImageUrl(cat.image)} alt={cat.nom} />
                <div className="lum-mega-img-cap">
                  <div className="lum-mega-img-tit">{cat.nom}</div>
                  <div className="lum-mega-img-sub">
                    {subs.length > 0
                      ? 'Découvrir la collection'
                      : `${total} produit${total > 1 ? 's' : ''} disponibles`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── MOBILE OVERLAY + DRAWER ─────────────────────────────────────── */}
      <div className={`lum-mob-bg${isMobOpen ? ' open' : ''}`} onClick={() => setIsMobOpen(false)} />

      <div className={`lum-mob-drawer${isMobOpen ? ' open' : ''}`}>
        <div className="lum-mob-head">
          <SiteLogo className="lum-mob-logo" height={26} onClick={() => go('home')} />
          <button className="lum-mob-close" onClick={() => setIsMobOpen(false)}><X size={20} /></button>
        </div>

        <div className="lum-mob-body">
          <form
            className="lum-mob-search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              if (q.length >= MIN_QUERY) go('shop', { search: q });
            }}
          >
            <Search size={15} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit…"
              aria-label="Rechercher"
            />
          </form>

          {rootCats.map((cat) => {
            const subs = subCats(cat);
            const products = menuProducts(cat);
            const total = countInCategory(cat.id);
            const openable = subs.length > 0 || products.length > 0;
            return (
              <div className="lum-mob-item" key={cat.id}>
                <button
                  className={['lum-mob-link', mobExpanded === cat.id ? 'active' : ''].filter(Boolean).join(' ')}
                  onClick={() => {
                    if (openable) setMobExpanded(mobExpanded === cat.id ? null : cat.id);
                    else go('shop', { category: cat.id });
                  }}
                >
                  {cat.nom}
                  {openable && (
                    <svg className="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </button>

                {openable && (
                  <div className={`lum-mob-sub${mobExpanded === cat.id ? ' open' : ''}`}>
                    {subs.length > 0 ? (
                      subs.map((sub) => (
                        <a key={sub.id} onClick={() => go('shop', { category: sub.id })}>{sub.nom}</a>
                      ))
                    ) : (
                      /* Leaf category — the products themselves are the menu. */
                      products.map((item) => (
                        <button
                          key={item.id}
                          className="lum-mob-prod"
                          onClick={() => go('detail', { article: item })}
                        >
                          <span className="lum-mob-prod-img">
                            <img src={articleImage(item)} alt={item.designation} loading="lazy" />
                          </span>
                          <span className="lum-mob-prod-tx">
                            <span className="lum-mob-prod-nm">{item.designation}</span>
                            <span className="lum-mob-prod-pr">{Number(item.puv_ttc).toFixed(3)} DT</span>
                          </span>
                        </button>
                      ))
                    )}
                    <span className="mob-explore" onClick={() => go('shop', { category: cat.id })}>
                      {subs.length > 0 ? `Explorer ${cat.nom}` : `Voir les ${total} produits`}
                      <ArrowRight size={12} />
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          <button className="lum-mob-viewall" onClick={() => go('categories')}>
            Toutes les catégories <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </>
  );
};

export default Header;
