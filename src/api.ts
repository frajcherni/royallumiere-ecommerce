const API_URL = import.meta.env.VITE_API_URL;

export interface Category {
  id: number;
  nom: string;
  description: string;
  image: string;
  on_website: boolean;
  website_order: number;
}

export interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  link: string;
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
  image: string;
  website_images: string[];
  is_top_seller: boolean;
  is_new_arrival: boolean;
  is_offre: boolean;
  website_description: string;
  on_website: boolean;
  categorie?: Category;
}

export const fetchWebsiteArticles = async (): Promise<Article[]> => {
  const response = await fetch(`${API_URL}/articles/getarticle`);
  if (!response.ok) throw new Error('Failed to fetch articles');
  const data = await response.json();
  // Filter only those that should be on website
  return data.filter((a: Article) => a.on_website);
};

export const fetchWebsiteCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/categories/getcategorie`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  const data = await response.json();
  // Filter only those that should be on website and sort by order
  return data
    .filter((c: Category) => c.on_website)
    .sort((a: Category, b: Category) => (a.website_order || 0) - (b.website_order || 0));
};

export const fetchCarouselSlides = async (): Promise<CarouselSlide[]> => {
  const response = await fetch(`${API_URL}/carousel`);
  if (!response.ok) throw new Error('Failed to fetch carousel slides');
  const data = await response.json();
  return data.filter((s: CarouselSlide) => s.active);
};
