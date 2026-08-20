import React, { useMemo, useState } from 'react';
import { LayoutGrid, ArrowRight, Search, ChevronRight, PackageOpen } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCatalog } from '../context/CatalogContext';
import { getImageUrl, CategoryNode } from '../api';
import SmartImage from './SmartImage';
import { SkeletonCategoryCards } from './Skeleton';

interface CategoriesProps {
  onNavigate: (id: string, props?: any) => void;
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80&fit=crop';

/**
 * "Shop by Category" browse page — every root category as a large card with
 * its sub-categories listed underneath, so a shopper can drill straight down
 * to what they want without going through the product grid first.
 */
const Categories: React.FC<CategoriesProps> = ({ onNavigate }) => {
  useScrollReveal();
  const { tree, loading, countInCategory, articles } = useCatalog();
  const [query, setQuery] = useState('');

  const goToCategory = (id: string | number) => onNavigate('shop', { category: id });

  /** Filters the tree by name — a parent is kept if any of its children match. */
  const visible = useMemo<CategoryNode[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tree;
    const match = (n: CategoryNode): CategoryNode | null => {
      const kids = n.children.map(match).filter(Boolean) as CategoryNode[];
      if (n.nom.toLowerCase().includes(q) || kids.length > 0) {
        return { ...n, children: kids.length > 0 ? kids : n.children };
      }
      return null;
    };
    return tree.map(match).filter(Boolean) as CategoryNode[];
  }, [tree, query]);

  const totalSubs = useMemo(
    () => tree.reduce((sum, c) => sum + c.children.length, 0),
    [tree],
  );

  return (
    <div className="page on">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="cbz-hero">
        <div className="cbz-hero-in">
          <div className="cbz-ey"><LayoutGrid size={13} /> Rayons</div>
          <h1>Acheter par <em>Catégorie</em></h1>
          <p>
            Parcourez tous nos rayons et leurs sous-catégories pour trouver
            exactement ce que vous cherchez.
          </p>

          <div className="cbz-search">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher une catégorie…"
              aria-label="Rechercher une catégorie"
            />
          </div>

          {!loading && (
            <div className="cbz-stats">
              <span><strong>{tree.length}</strong> rayons</span>
              <span><strong>{totalSubs}</strong> sous-catégories</span>
              <span><strong>{articles.length}</strong> produits</span>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────── */}
      <section className="sec cbz-sec">
        {loading ? (
          <SkeletonCategoryCards count={6} />
        ) : visible.length === 0 ? (
          <div className="cbz-empty">
            <PackageOpen size={46} />
            <h3>Aucune catégorie trouvée</h3>
            <p>Essayez un autre mot-clé{query ? <> pour « {query} »</> : null}.</p>
            {query && (
              <button className="btn btn-ol" onClick={() => setQuery('')}>
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Shortcut to the full catalogue */}
            <button className="cbz-all rv" onClick={() => goToCategory('all')}>
              <div>
                <div className="cbz-all-ey">Tout le catalogue</div>
                <div className="cbz-all-tit">Voir tous les produits</div>
              </div>
              <span className="cbz-all-cta">
                {articles.length} produits <ArrowRight size={16} />
              </span>
            </button>

            <div className="cbz-grid">
              {visible.map((cat, i) => (
                <article
                  className={`cbz-card rv d${i % 3}`}
                  key={cat.id}
                >
                  <button
                    className="cbz-card-img"
                    onClick={() => goToCategory(cat.id)}
                    aria-label={`Voir ${cat.nom}`}
                  >
                    <SmartImage
                      src={cat.image ? getImageUrl(cat.image) : FALLBACK_IMG}
                      alt={cat.nom}
                      ratio="4 / 3"
                    />
                    <span className="cbz-card-count">{countInCategory(cat.id)}</span>
                  </button>

                  <div className="cbz-card-b">
                    <button className="cbz-card-tit" onClick={() => goToCategory(cat.id)}>
                      {cat.nom}
                      <ChevronRight size={16} />
                    </button>

                    {cat.description && (
                      <p className="cbz-card-desc">{cat.description}</p>
                    )}

                    {cat.children.length > 0 ? (
                      <>
                        <div className="cbz-card-sublabel">
                          {cat.children.length} sous-catégorie{cat.children.length > 1 ? 's' : ''}
                        </div>
                        <div className="cbz-chips">
                          {cat.children.slice(0, 8).map(sub => (
                            <button
                              key={sub.id}
                              className="cbz-chip"
                              onClick={() => goToCategory(sub.id)}
                            >
                              {sub.nom}
                              <span>{countInCategory(sub.id)}</span>
                            </button>
                          ))}
                          {cat.children.length > 8 && (
                            <button className="cbz-chip cbz-chip-more" onClick={() => goToCategory(cat.id)}>
                              +{cat.children.length - 8}
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="cbz-card-sublabel muted">Collection directe</div>
                    )}

                    <button className="cbz-card-cta" onClick={() => goToCategory(cat.id)}>
                      Explorer le rayon <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Categories;
