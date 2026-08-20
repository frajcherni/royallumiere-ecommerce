import React, {
  createContext, useContext, useState, useEffect, useCallback, useMemo,
} from 'react';
import {
  dedupedArticles, dedupedCategories, dedupedSiteSettings, DEFAULT_SITE_SETTINGS,
  buildCategoryTree, collectCategoryIds, findCategoryNode, categoryPath,
  Article, Category, CategoryNode, SiteSettings,
} from '../api';

interface CatalogContextType {
  articles: Article[];
  categories: Category[];
  /** Root categories, each with its sub-categories nested in `children`. */
  tree: CategoryNode[];
  /** True until the first successful (or failed) load completes. */
  loading: boolean;
  /** True while a background refresh is running — data is already usable. */
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** Logo / wordmark chosen by the shop owner in the ERP. Never null — it
   *  falls back to the built-in wordmark while loading or on failure. */
  settings: SiteSettings;

  /* ── derived helpers ───────────────────────────────────────── */
  /** Products of a category *and all of its sub-categories*. */
  articlesInCategory: (id: string | number) => Article[];
  /** Same, but only the count — memoised per category id. */
  countInCategory: (id: string | number) => number;
  findCategory: (id: string | number) => CategoryNode | undefined;
  pathTo: (id: string | number) => CategoryNode[];
}

const CatalogContext = createContext<CatalogContextType | null>(null);

/**
 * Loads the catalogue once for the whole app.
 *
 * Before this existed, Header, Home and Shop each fetched categories and
 * articles on mount, so navigating re-hit the API and the category strip /
 * nav flickered empty on every page change.
 */
export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const [cats, arts] = await Promise.all([
        dedupedCategories(),
        dedupedArticles(),
      ]);
      setCategories(cats);
      setArticles(arts);
    } catch (e: any) {
      console.error('Catalog load failed:', e);
      setError(e?.message || 'Impossible de charger le catalogue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Fetched on its own rather than inside `load`, so a missing or failing
     settings endpoint never takes the whole catalogue — and the splash —
     down with it: the header simply keeps the built-in wordmark. */
  useEffect(() => {
    let alive = true;
    dedupedSiteSettings()
      .then(s => { if (alive) setSettings(s); })
      .catch(e => console.warn('Site settings unavailable, using defaults:', e));
    return () => { alive = false; };
  }, []);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  /** id → every id in its subtree, so a parent shows its children's products. */
  const subtreeIds = useMemo(() => {
    const map = new Map<string, Set<number>>();
    const walk = (nodes: CategoryNode[]) => {
      nodes.forEach(n => {
        map.set(String(n.id), new Set(collectCategoryIds(n)));
        walk(n.children);
      });
    };
    walk(tree);
    return map;
  }, [tree]);

  const articlesInCategory = useCallback((id: string | number) => {
    if (id === 'all' || id == null) return articles;
    const ids = subtreeIds.get(String(id));
    if (!ids) return [];
    return articles.filter(a => a.categorie?.id != null && ids.has(Number(a.categorie.id)));
  }, [articles, subtreeIds]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    subtreeIds.forEach((ids, key) => {
      map.set(key, articles.filter(a => a.categorie?.id != null && ids.has(Number(a.categorie.id))).length);
    });
    map.set('all', articles.length);
    return map;
  }, [articles, subtreeIds]);

  const countInCategory = useCallback(
    (id: string | number) => counts.get(String(id)) ?? 0,
    [counts],
  );

  const findCategory = useCallback(
    (id: string | number) => findCategoryNode(tree, id),
    [tree],
  );

  const pathTo = useCallback(
    (id: string | number) => categoryPath(tree, id),
    [tree],
  );

  const value = useMemo<CatalogContextType>(() => ({
    articles, categories, tree, loading, refreshing, error, settings,
    refresh: () => load(true),
    articlesInCategory, countInCategory, findCategory, pathTo,
  }), [
    articles, categories, tree, loading, refreshing, error, settings, load,
    articlesInCategory, countInCategory, findCategory, pathTo,
  ]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = (): CatalogContextType => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within a CatalogProvider');
  return ctx;
};
