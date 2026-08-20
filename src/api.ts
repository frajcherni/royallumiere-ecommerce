const API_URL = import.meta.env.VITE_API_URL;
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "https://royallumiere.tn";

/**
 * Standardized image URL helper for the ecommerce website.
 * Prepend the VITE_IMAGE_URL to relative paths from the backend.
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80&fit=crop";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // Strip domain if it accidentally was included by the backend
  const cleanPath = imagePath.replace(/^.*uploads\//i, "uploads/");
  const clean = cleanPath.replace(/^\/+/, "");
  return `${IMAGE_URL}/${clean}`;
};

export interface Category {
  id: number;
  nom: string;
  description: string;
  image: string;
  on_website: boolean;
  website_order: number;
  parent_id?: number | null;
}

export interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  tag_color: string;
  title_color: string;
  description_color: string;
  btn1_text_color: string;
  btn2_text_color: string;
  link: string;
  btn_label: string;
  btn_color: string;
  btn2_label: string;
  btn2_link: string;
  btn2_color: string;
  show_text: boolean;
  show_btn1: boolean;
  show_btn2: boolean;
  order: number;
  active: boolean;
}

export interface Article {
  id: number;
  reference: string;
  designation: string;
  nom: string;
  puv_ttc: number;
  puv_ht: number;
  tva: number;
  image: string;
  website_images: string[];
  is_top_seller: boolean;
  is_new_arrival: boolean;
  is_offre: boolean;
  website_description: string;
  on_website: boolean;
  categorie?: Category;
}

export interface WebsiteOrderPayload {
  clientWebsiteInfo: {
    nomPrenom: string;
    telephone: string;
    adresse: string;
    email?: string;
    ville?: string;
    code_postal?: string;
  };
  articles: Array<{
    article_id: number;
    designation: string;
    quantite: number;
    quantiteLivree: number;
    prix_unitaire: number;
    prix_ttc: number;
    tva: number;
  }>;
  numeroCommande: string;
  dateCommande: string;
  taxMode: 'TTC';
  totalTTC: number;
  totalHT: number;
  totalTVA: number;
  totalTTCAfterRemise: number;
}

export const getNextOrderNumber = async (): Promise<string> => {
  const response = await fetch(`${API_URL}/bons-commande-client/getnumbercommande`);
  if (!response.ok) throw new Error('Failed to get order number');
  const data = await response.json();
  return data.numeroCommande;
};

export const createWebsiteOrder = async (payload: WebsiteOrderPayload): Promise<any> => {
  const response = await fetch(`${API_URL}/bons-commande-client/addBonCommandeClient`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create order');
  }
  return response.json();
};

export const fetchWebsiteArticles = async (): Promise<Article[]> => {
  const response = await fetch(`${API_URL}/articles/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      onWebsite: true,
      limit: 1000 // Get all website articles for now, or implement pagination
    })
  });
  if (!response.ok) throw new Error('Failed to fetch articles');
  const data = await response.json();
  return data.articles || [];
};

export const fetchWebsiteCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/categories/getcategorie?onWebsite=true`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  const data = await response.json();
  // Sort by order on frontend as order is specific to website
  return data.sort((a: Category, b: Category) => (a.website_order || 0) - (b.website_order || 0));
};

export const fetchCarouselSlides = async (): Promise<CarouselSlide[]> => {
  const response = await fetch(`${API_URL}/carousel`);
  if (!response.ok) throw new Error('Failed to fetch carousel slides');
  const data = await response.json();
  return data.filter((s: CarouselSlide) => s.active);
};

export interface Promo {
  id: number;
  title: string;
  description?: string | null;
  status: 'actif' | 'inactive';
  date_start?: string | null;
  date_end?: string | null;
  order: number;
  product: Article;
}

export const fetchPromos = async (): Promise<Promo[]> => {
  const response = await fetch(`${API_URL}/promos/active`);
  if (!response.ok) throw new Error('Failed to fetch promos');
  return response.json();
};

export interface Brand {
  id: number;
  name: string;
  image: string;
  link?: string | null;
  order: number;
  active: boolean;
}

export const fetchBrands = async (): Promise<Brand[]> => {
  const response = await fetch(`${API_URL}/brands`);
  if (!response.ok) throw new Error('Failed to fetch brands');
  const data = await response.json();
  return data.filter((b: Brand) => b.active);
};

export interface Testimonial {
  id: number;
  image: string;
  name?: string | null;
  order: number;
  active: boolean;
}

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  const response = await fetch(`${API_URL}/testimonials`);
  if (!response.ok) throw new Error('Failed to fetch testimonials');
  const data = await response.json();
  return data.filter((t: Testimonial) => t.active);
};

/* ═══════════════════════════════════════════════════════════════
   REQUEST CACHE — de-duplicates in-flight calls so that several
   components mounting at once never trigger the same GET twice.
   ═══════════════════════════════════════════════════════════════ */

const inflight = new Map<string, Promise<any>>();

const dedupe = <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  const hit = inflight.get(key);
  if (hit) return hit as Promise<T>;
  const p = fn().finally(() => {
    // keep the entry only while the request is in flight
    inflight.delete(key);
  });
  inflight.set(key, p);
  return p;
};

export const dedupedCategories = () => dedupe('categories', fetchWebsiteCategories);
export const dedupedArticles = () => dedupe('articles', fetchWebsiteArticles);

/* ═══════════════════════════════════════════════════════════════
   CATEGORY TREE — categories may have sub-categories via parent_id.
   ═══════════════════════════════════════════════════════════════ */

export interface CategoryNode extends Category {
  children: CategoryNode[];
  depth: number;
}

/**
 * Turns the flat category list into a tree.
 * A category whose parent is missing from the list (e.g. the parent is not
 * flagged on_website) is promoted to a root instead of being dropped.
 */
export const buildCategoryTree = (categories: Category[]): CategoryNode[] => {
  const byId = new Map<number, CategoryNode>();
  categories.forEach(c => byId.set(Number(c.id), { ...c, children: [], depth: 0 }));

  const roots: CategoryNode[] = [];

  byId.forEach(node => {
    const parentId = node.parent_id != null ? Number(node.parent_id) : null;
    const parent = parentId != null ? byId.get(parentId) : undefined;
    // self-reference or unknown parent → treat as a root
    if (!parent || parent.id === node.id) roots.push(node);
    else parent.children.push(node);
  });

  // guard against parent_id cycles: anything unreachable from a root is re-rooted
  const seen = new Set<number>();
  const stamp = (nodes: CategoryNode[], depth: number) => {
    nodes.forEach(n => {
      if (seen.has(Number(n.id))) return;
      seen.add(Number(n.id));
      n.depth = depth;
      stamp(n.children, depth + 1);
    });
  };
  stamp(roots, 0);
  byId.forEach(n => {
    if (!seen.has(Number(n.id))) {
      seen.add(Number(n.id));
      n.depth = 0;
      n.children = [];
      roots.push(n);
    }
  });

  const byOrder = (a: Category, b: Category) =>
    (a.website_order || 0) - (b.website_order || 0) || a.nom.localeCompare(b.nom);

  const sortRec = (nodes: CategoryNode[]) => {
    nodes.sort(byOrder);
    nodes.forEach(n => sortRec(n.children));
  };
  sortRec(roots);

  return roots;
};

/** The id of a category plus every id beneath it. */
export const collectCategoryIds = (node: CategoryNode): number[] => [
  Number(node.id),
  ...node.children.flatMap(collectCategoryIds),
];

/** Depth-first walk of the whole tree, parents before children. */
export const flattenTree = (nodes: CategoryNode[]): CategoryNode[] =>
  nodes.flatMap(n => [n, ...flattenTree(n.children)]);

/** Finds a node anywhere in the tree. */
export const findCategoryNode = (
  nodes: CategoryNode[],
  id: string | number,
): CategoryNode | undefined =>
  flattenTree(nodes).find(n => String(n.id) === String(id));

/** Root → … → node, used for breadcrumbs. */
export const categoryPath = (
  nodes: CategoryNode[],
  id: string | number,
): CategoryNode[] => {
  const walk = (list: CategoryNode[], trail: CategoryNode[]): CategoryNode[] | null => {
    for (const n of list) {
      const next = [...trail, n];
      if (String(n.id) === String(id)) return next;
      const found = walk(n.children, next);
      if (found) return found;
    }
    return null;
  };
  return walk(nodes, []) || [];
};

/* ═══════════════════════════════════════════════════════════════
   ANNOUNCEMENTS — the scrolling messages in the bar above the header
   ═══════════════════════════════════════════════════════════════ */

/** CSS-drawn glyph shown before each message. */
export type AnnouncementMarker =
  | 'sparkle' | 'diamond' | 'dot' | 'ring' | 'square' | 'bar' | 'plus' | 'slash';

export type AnnouncementAccent = 'gold' | 'blue' | 'white';

export interface Announcement {
  id: number;
  text: string;
  marker: AnnouncementMarker;
  accent: AnnouncementAccent;
  order: number;
  active: boolean;
}

/**
 * Shown when the API is unreachable or the table is still empty, so the bar
 * is never blank. Seed the real ones with POST /announcements/seed-defaults.
 */
export const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  { id: -1, text: 'Livraison gratuite dès 50 DT',      marker: 'sparkle', accent: 'gold',  order: 0, active: true },
  { id: -2, text: 'Nouveautés chaque semaine',          marker: 'diamond', accent: 'blue',  order: 1, active: true },
  { id: -3, text: 'Retours gratuits sous 30 jours',     marker: 'ring',    accent: 'white', order: 2, active: true },
  { id: -4, text: 'Qualité premium garantie',           marker: 'square',  accent: 'gold',  order: 3, active: true },
  { id: -5, text: 'Récompenses membres exclusives',     marker: 'plus',    accent: 'blue',  order: 4, active: true },
  { id: -6, text: 'Support client 24/7',                marker: 'dot',     accent: 'white', order: 5, active: true },
];

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const response = await fetch(`${API_URL}/announcements?active=true`);
  if (!response.ok) throw new Error('Failed to fetch announcements');
  const data = await response.json();
  return (Array.isArray(data) ? data : [])
    .sort((a: Announcement, b: Announcement) => (a.order || 0) - (b.order || 0));
};

/* ═══════════════════════════════════════════════════════════════
   SITE SETTINGS — the logo/wordmark the shop owner picks in the ERP
   (Site Web → Gestion Logo). Everything degrades to the built-in
   wordmark when the endpoint is unreachable or no logo is uploaded.
   ═══════════════════════════════════════════════════════════════ */

export interface SiteSettings {
  id: number;
  /** Relative path of the uploaded logo, or null to use the wordmark. */
  logo: string | null;
  brand_name: string;
  show_name: boolean;
  logo_height: number;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: -1,
  logo: null,
  brand_name: 'LUMIÈRE',
  show_name: true,
  logo_height: 34,
};

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const response = await fetch(`${API_URL}/site-settings`);
  if (!response.ok) throw new Error('Failed to fetch site settings');
  const data = await response.json();
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...data,
    brand_name: data?.brand_name || DEFAULT_SITE_SETTINGS.brand_name,
    logo_height: Number(data?.logo_height) || DEFAULT_SITE_SETTINGS.logo_height,
  };
};

export const dedupedSiteSettings = () => dedupe('site-settings', fetchSiteSettings);

/* ═══════════════════════════════════════════════════════════════
   SEARCH — backed by the ERP's own POST /articles/search, so the
   shop matches on reference, designation, nom, category and brand
   exactly like the back office does.
   ═══════════════════════════════════════════════════════════════ */

export interface SearchOptions {
  limit?: number;
  page?: number;
  signal?: AbortSignal;
}

export const searchArticles = async (
  q: string,
  { limit = 24, page = 1, signal }: SearchOptions = {},
): Promise<{ articles: Article[]; total: number }> => {
  const term = q.trim();
  if (!term) return { articles: [], total: 0 };

  const response = await fetch(`${API_URL}/articles/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: term, onWebsite: true, page, limit }),
    signal,
  });
  if (!response.ok) throw new Error('Failed to search articles');
  const data = await response.json();
  return { articles: data.articles || [], total: data.total ?? 0 };
};
