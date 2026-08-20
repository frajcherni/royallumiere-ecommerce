import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter, ChevronDown, ChevronRight, LayoutGrid, List, Tag, X, Home as HomeIcon,
  PackageOpen, RotateCcw, Search,
} from 'lucide-react';
import ProductCard from './ProductCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { getImageUrl, searchArticles, Article, CategoryNode } from '../api';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { SkeletonProductGrid, SkeletonSidebar, Skeleton } from './Skeleton';

interface ShopProps {
  onNavigate: (id: string, props?: any) => void;
  initialCategory?: string | number;
  /** Term coming from the header search — results replace the category list. */
  initialSearch?: string;
}

/** Upper bound on results pulled back from the API for one term. */
const SEARCH_LIMIT = 60;

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name';

const Shop: React.FC<ShopProps> = ({ onNavigate, initialCategory = 'all', initialSearch = '' }) => {
  useScrollReveal();
  const { addToCart, openCart, closeCart } = useCart();
  const {
    tree, loading, error, refresh,
    articlesInCategory, countInCategory, pathTo,
  } = useCatalog();

  const [category, setCategory] = useState<string | number>(initialCategory);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobFilterOpen, setIsMobFilterOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['categories', 'sort']);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>('default');

  /* ── SEARCH ────────────────────────────────────────────────────
     The term is resolved by the back office's own POST /articles/search
     (searchArticles), so the shop matches on reference, désignation, nom,
     catégorie and fournisseur exactly like the ERP does — the local
     catalogue only knows what it has already downloaded. */
  const [search, setSearch] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchTotal, setSearchTotal] = useState(0);
  const isSearching = search.trim().length > 0;

  // Follow navigation — clicking a category in the header while already on the
  // shop page has to move the selection, not just re-render the same list.
  useEffect(() => { setCategory(initialCategory); }, [initialCategory]);
  useEffect(() => { setSearch(initialSearch); }, [initialSearch]);

  useEffect(() => {
    const term = search.trim();
    if (!term) {
      setSearchResults([]);
      setSearchTotal(0);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError(null);

    searchArticles(term, { limit: SEARCH_LIMIT, signal: controller.signal })
      .then(({ articles, total }) => {
        if (cancelled) return;
        setSearchResults(articles);
        setSearchTotal(total);
      })
      .catch((e: any) => {
        if (cancelled) return;
        setSearchResults([]);
        setSearchTotal(0);
        setSearchError(e?.message || 'La recherche a échoué.');
      })
      .finally(() => { if (!cancelled) setSearchLoading(false); });

    return () => { cancelled = true; controller.abort(); };
  }, [search]);

  /** Drops the term and returns to the ordinary category browsing. */
  const clearSearch = () => {
    setSearch('');
    window.history.replaceState({ page: 'shop', props: { category } }, '', '/shop');
  };

  // Auto-open the branch that contains the current selection.
  useEffect(() => {
    if (category === 'all') return;
    const path = pathTo(category);
    if (path.length === 0) return;
    setExpanded(prev => {
      const next = new Set(prev);
      path.slice(0, -1).forEach(n => next.add(String(n.id)));
      const self = path[path.length - 1];
      if (self && self.children.length > 0) next.add(String(self.id));
      // Bail out when nothing actually opened, so selecting a sibling does not
      // trigger a second render for an identical set.
      return next.size === prev.size ? prev : next;
    });
  }, [category, pathTo]);

  const trail = useMemo(
    () => (category === 'all' ? [] : pathTo(category)),
    [category, pathTo],
  );
  const currentNode = trail[trail.length - 1];
  const currentCategoryName =
    category === 'all' ? 'Tous les produits' : (currentNode ? currentNode.nom : 'Produits');

  /** A search waits on the API; ordinary browsing waits on the catalogue. */
  const busy = isSearching ? searchLoading : loading;

  // A live search takes over the grid; the sidebar stays available so picking
  // a category is the way back out of the results.
  const matching = useMemo(
    () => (isSearching ? searchResults : articlesInCategory(category)),
    [isSearching, searchResults, articlesInCategory, category],
  );

  const filteredArticles = useMemo(() => {
    const list = [...matching];
    switch (sort) {
      case 'price-asc':  return list.sort((a, b) => Number(a.puv_ttc) - Number(b.puv_ttc));
      case 'price-desc': return list.sort((a, b) => Number(b.puv_ttc) - Number(a.puv_ttc));
      case 'name':       return list.sort((a, b) => (a.designation || '').localeCompare(b.designation || ''));
      default:           return list;
    }
  }, [matching, sort]);

  const handleCatClick = (id: string | number) => {
    setCategory(id);
    setSearch('');
    setIsMobFilterOpen(false);
    // keep the URL honest so a refresh or the back button lands on the same view
    window.history.replaceState(
      { page: 'shop', props: { category: id } },
      '',
      id === 'all' ? '/shop' : '/shop?c=' + id,
    );
  };

  const toggleSection = (s: string) =>
    setOpenSections(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));

  const toggleExpand = (id: string | number) =>
    setExpanded(prev => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const getArticleImage = (item: Article) => {
    if (item.image) return getImageUrl(item.image);
    if (item.website_images && item.website_images.length > 0) {
      return getImageUrl(item.website_images[0]);
    }
    return getImageUrl(null);
  };

  /* ── SIDEBAR: recursive category tree ─────────────────────────
     These are plain render functions rather than inline components: an inline
     component would be a brand-new type on every render, so React would tear
     down and rebuild the whole sidebar and the expand/collapse transition
     would never get a chance to play. */
  const renderBranch = (node: CategoryNode): React.ReactNode => {
    const key = String(node.id);
    const isOpen = expanded.has(key);
    const isActive = String(category) === key;
    const hasKids = node.children.length > 0;

    return (
      <div className={'sb-node depth-' + Math.min(node.depth, 2)} key={node.id}>
        <div className={'sb-cat' + (isActive ? ' on' : '')}>
          <button className="sb-cat-main" onClick={() => handleCatClick(node.id)}>
            <span className="sb-cat-nm">{node.nom}</span>
            <span className="sb-cat-ct">{countInCategory(node.id)}</span>
          </button>
          {hasKids && (
            <button
              className={'sb-cat-tog' + (isOpen ? ' open' : '')}
              onClick={() => toggleExpand(node.id)}
              aria-expanded={isOpen}
              aria-label={(isOpen ? 'Réduire ' : 'Déplier ') + node.nom}
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {hasKids && (
          <div className={'sb-branch' + (isOpen ? ' open' : '')}>
            <div>{node.children.map(renderBranch)}</div>
          </div>
        )}
      </div>
    );
  };

  const renderSidebar = () => (
    <>
      <div className="sb-sec">
        <div
          className={'sb-tit ' + (openSections.includes('categories') ? 'open' : '')}
          onClick={() => toggleSection('categories')}
        >
          Catégories <ChevronDown size={14} />
        </div>
        {openSections.includes('categories') && (
          loading ? <SkeletonSidebar /> : (
            <div className="sb-cats">
              <div className={'sb-cat root-all' + (category === 'all' ? ' on' : '')}>
                <button className="sb-cat-main" onClick={() => handleCatClick('all')}>
                  <span className="sb-cat-nm">Tous les produits</span>
                  <span className="sb-cat-ct">{countInCategory('all')}</span>
                </button>
              </div>
              {tree.map(renderBranch)}
            </div>
          )
        )}
      </div>

      <div className="sb-sec">
        <div
          className={'sb-tit ' + (openSections.includes('sort') ? 'open' : '')}
          onClick={() => toggleSection('sort')}
        >
          Trier par <ChevronDown size={14} />
        </div>
        {openSections.includes('sort') && (
          <div className="sb-sorts">
            {([
              ['default',    'Pertinence'],
              ['price-asc',  'Prix croissant'],
              ['price-desc', 'Prix décroissant'],
              ['name',       'Nom (A-Z)'],
            ] as [SortKey, string][]).map(([key, label]) => (
              <button
                key={key}
                className={'sb-sort' + (sort === key ? ' on' : '')}
                onClick={() => setSort(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="page on">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <div className="br-hero">
        <div className="br-hero-b">
          <div className="br-hero-tag">Boutique</div>
          {loading && !isSearching ? (
            <Skeleton h={44} w="min(420px, 70vw)" style={{ margin: '0 0 .75rem' }} />
          ) : (
            <h1>
              {isSearching
                ? <>Résultats pour <em>{search.trim()}</em></>
                : category === 'all'
                  ? <>Notre <em>Collection</em> complète</>
                  : <>Rayon <em>{currentCategoryName}</em></>}
            </h1>
          )}
          <p>
            {isSearching
              ? 'Recherche effectuée sur la référence, la désignation, la catégorie et la marque.'
              : (currentNode && currentNode.description)
                || 'Découvrez notre sélection premium soigneusement choisie pour vous.'}
          </p>
        </div>
      </div>

      {/* ── BREADCRUMB ────────────────────────────────────────── */}
      <nav className="shop-crumb mx" aria-label="Fil d’Ariane">
        <button onClick={() => onNavigate('home')}><HomeIcon size={13} /> Accueil</button>
        <ChevronRight size={12} />
        <button onClick={() => handleCatClick('all')} className={category === 'all' ? 'crumb-on' : ''}>
          Boutique
        </button>
        {isSearching ? (
          <>
            <ChevronRight size={12} />
            <button className="crumb-on">Recherche</button>
          </>
        ) : trail.map((node, i) => (
          <React.Fragment key={node.id}>
            <ChevronRight size={12} />
            <button
              onClick={() => handleCatClick(node.id)}
              className={i === trail.length - 1 ? 'crumb-on' : ''}
            >
              {node.nom}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* ── ACTIVE SEARCH CHIP ────────────────────────────────── */}
      {isSearching && (
        <div className="subcat-bar mx">
          <button className="subcat-pill on shop-search-chip" onClick={clearSearch}>
            <Search size={13} /> {search.trim()}
            <X size={13} />
          </button>
          <span className="shop-search-note">
            {searchLoading ? 'Recherche en cours…' : 'Cliquez pour effacer la recherche'}
          </span>
        </div>
      )}

      {/* ── SUB-CATEGORY QUICK BAR ────────────────────────────── */}
      {!loading && !isSearching && (
        currentNode && currentNode.children.length > 0 ? (
          <div className="subcat-bar mx">
            <button
              className={'subcat-pill' + (String(category) === String(currentNode.id) ? ' on' : '')}
              onClick={() => handleCatClick(currentNode.id)}
            >
              Tout {currentNode.nom} <span>{countInCategory(currentNode.id)}</span>
            </button>
            {currentNode.children.map(sub => (
              <button
                key={sub.id}
                className={'subcat-pill' + (String(category) === String(sub.id) ? ' on' : '')}
                onClick={() => handleCatClick(sub.id)}
              >
                {sub.nom} <span>{countInCategory(sub.id)}</span>
              </button>
            ))}
          </div>
        ) : category === 'all' && tree.length > 0 ? (
          <div className="subcat-bar mx">
            <button className="subcat-pill on" onClick={() => handleCatClick('all')}>
              Tout <span>{countInCategory('all')}</span>
            </button>
            {tree.map(node => (
              <button key={node.id} className="subcat-pill" onClick={() => handleCatClick(node.id)}>
                {node.nom} <span>{countInCategory(node.id)}</span>
              </button>
            ))}
          </div>
        ) : null
      )}

      {/* ── MOBILE FILTER TOGGLE ──────────────────────────────── */}
      <div className="mx" style={{ padding: '1rem clamp(1rem,3vw,2.5rem) .25rem' }}>
        <div className="flex-between">
          <div style={{ fontSize: '.82rem', color: 'var(--g4)' }}>
            {busy
              ? <Skeleton h={12} w={150} />
              : <>Affichage de <strong>{filteredArticles.length}</strong> produit{filteredArticles.length > 1 ? 's' : ''}</>}
          </div>
          <button className="btn btn-ol mob-filter-btn" onClick={() => setIsMobFilterOpen(v => !v)}>
            {isMobFilterOpen ? <X size={16} /> : <Filter size={16} />} Filtres
          </button>
        </div>
      </div>

      <div className={'mx br-sidebar-mob ' + (isMobFilterOpen ? 'open' : '')}>
        <div style={{ background: 'var(--ow)', border: '1px solid var(--g2)', borderRadius: 'var(--rx)', padding: '1.5rem', marginTop: '1rem' }}>
          {renderSidebar()}
        </div>
      </div>

      {/* ── LAYOUT ────────────────────────────────────────────── */}
      <div className="br-layout mx">
        <aside className="br-sidebar" id="brSide">
          {renderSidebar()}
        </aside>

        <div>
          <div className="br-toolbar">
            <div className="br-count">
              {busy ? (
                <Skeleton h={12} w={230} />
              ) : isSearching ? (
                <>
                  <strong>{searchTotal}</strong> résultat{searchTotal > 1 ? 's' : ''} pour{' '}
                  <strong>{search.trim()}</strong>
                  {searchTotal > filteredArticles.length && (
                    <> — {filteredArticles.length} affiché{filteredArticles.length > 1 ? 's' : ''}</>
                  )}
                </>
              ) : (
                <>Affichage de <strong>{filteredArticles.length}</strong> produit{filteredArticles.length > 1 ? 's' : ''} dans <strong>{currentCategoryName}</strong></>
              )}
            </div>
            <div className="br-view-btns">
              <button className={'vbtn ' + (viewMode === 'grid' ? 'on' : '')} onClick={() => setViewMode('grid')} aria-label="Vue grille"><LayoutGrid size={16} /></button>
              <button className={'vbtn ' + (viewMode === 'list' ? 'on' : '')} onClick={() => setViewMode('list')} aria-label="Vue liste"><List size={16} /></button>
            </div>
          </div>

          {isSearching && searchError ? (
            <div className="shop-empty">
              <PackageOpen size={46} />
              <h3>La recherche n'a pas abouti</h3>
              <p>{searchError}</p>
              <button className="btn btn-ol" onClick={clearSearch}>
                <RotateCcw size={15} style={{ marginRight: 8 }} /> Revenir au catalogue
              </button>
            </div>
          ) : !isSearching && error ? (
            <div className="shop-empty">
              <PackageOpen size={46} />
              <h3>Le catalogue n'a pas pu être chargé</h3>
              <p>{error}</p>
              <button className="btn btn-pr" onClick={refresh}>
                <RotateCcw size={15} style={{ marginRight: 8 }} /> Réessayer
              </button>
            </div>
          ) : busy ? (
            <SkeletonProductGrid count={9} />
          ) : filteredArticles.length === 0 ? (
            isSearching ? (
              <div className="shop-empty">
                <Search size={46} />
                <h3>Aucun produit pour « {search.trim()} »</h3>
                <p>Vérifiez l'orthographe ou essayez un terme plus court.</p>
                <button className="btn btn-ol" onClick={clearSearch}>
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <div className="shop-empty">
                <Tag size={46} />
                <h3>Aucun produit dans ce rayon</h3>
                <p>Essayez une autre catégorie ou revenez au catalogue complet.</p>
                <button className="btn btn-ol" onClick={() => handleCatClick('all')}>
                  Voir tous les produits
                </button>
              </div>
            )
          ) : (
            <div className="pgrid" style={viewMode === 'list' ? { gridTemplateColumns: '1fr' } : {}}>
              {filteredArticles.map(item => (
                <ProductCard
                  key={item.id}
                  category={item.categorie?.nom || 'Premium'}
                  name={item.designation}
                  price={String(item.puv_ttc)}
                  img={getArticleImage(item)}
                  badge={item.is_new_arrival ? { text: 'NEW', type: 'new' } : item.is_top_seller ? { text: 'BEST', type: 'best' } : undefined}
                  onDetail={() => onNavigate('detail', { article: item })}
                  onAddToCart={() => { addToCart(item); openCart(); }}
                  onCommander={() => { closeCart(); addToCart(item); onNavigate('checkout'); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
