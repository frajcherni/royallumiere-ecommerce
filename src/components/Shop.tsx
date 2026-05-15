import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, LayoutGrid, List, Tag, X, Star, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { fetchWebsiteArticles, fetchWebsiteCategories, Article, Category } from '../api';
import Loader from './Loader';

interface ShopProps {
  onNavigate: (id: string, props?: any) => void;
  initialCategory?: string | number;
}

const Shop: React.FC<ShopProps> = ({ onNavigate, initialCategory = 'all' }) => {
  useScrollReveal();
  const [category, setCategory] = useState<string | number>(initialCategory);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobFilterOpen, setIsMobFilterOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['categories', 'price']);

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          fetchWebsiteArticles(),
          fetchWebsiteCategories()
        ]);
        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading shop data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCatClick = (id: string | number) => {
    setCategory(id);
  };

  const toggleSection = (s: string) => {
    setOpenSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80&fit=crop";
    if (imagePath.startsWith('http')) return imagePath;
    return `${IMAGE_URL}/${imagePath.replace(/\\/g, '/')}`;
  };

  const getArticleImage = (item: Article) => {
    if (item.image) return getImageUrl(item.image);
    if (item.website_images && item.website_images.length > 0) {
      return getImageUrl(item.website_images[0]);
    }
    return getImageUrl(null);
  };

  const filteredArticles = articles.filter(a => {
    if (category === 'all') return true;
    return a.categorie?.id === Number(category);
  });

  const currentCategoryName = category === 'all' ? 'All Items' : categories.find(c => c.id === Number(category))?.nom || 'Products';

  const SidebarContent = () => (
    <>
      <div className="sb-sec">
        <div className={`sb-tit ${openSections.includes('categories') ? 'open' : ''}`} onClick={() => toggleSection('categories')}>
          Categories <ChevronDown size={14} />
        </div>
        {openSections.includes('categories') && (
          <div className="sb-cats">
            <div 
              className={`sb-cat ${category === 'all' ? 'on' : ''}`}
              onClick={() => handleCatClick('all')}
            >
              All Items <span>{articles.length}</span>
            </div>
            {categories.map((cat) => (
              <div 
                key={cat.id}
                className={`sb-cat ${category === cat.id ? 'on' : ''}`}
                onClick={() => handleCatClick(cat.id)}
              >
                {cat.nom} <span>{articles.filter(a => a.categorie?.id === cat.id).length}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sb-sec">
        <div className={`sb-tit ${openSections.includes('price') ? 'open' : ''}`} onClick={() => toggleSection('price')}>
          Price Range <ChevronDown size={14} />
        </div>
        {openSections.includes('price') && (
          <div className="price-range">
            <div className="pr-vals"><span>Min</span><span>Max</span></div>
            <input type="range" className="pr-slider" min="0" max="5000" defaultValue="5000" />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="page on">
      <div className="br-hero">
        <div className="br-hero-b">
          <div className="br-hero-tag">Store</div>
          <h1>{category === 'all' ? <>Our <em>Full</em> Collection</> : <>Modern <em>{currentCategoryName}</em></>}</h1>
          <p>Discover our curated selection of premium {currentCategoryName.toLowerCase()}.</p>
        </div>
      </div>

      <div className="mx" style={{ padding: '1.5rem clamp(1rem,3vw,2.5rem) .5rem' }}>
        <div className="flex-between">
          <div style={{ fontSize: '.82rem', color: 'var(--g4)' }}>Showing <strong>{filteredArticles.length}</strong> products</div>
          <button className="btn btn-ol mob-filter-btn" onClick={() => setIsMobFilterOpen(!isMobFilterOpen)}>
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className={`mx br-sidebar-mob ${isMobFilterOpen ? 'open' : ''}`}>
        <div style={{ background:'var(--ow)', border:'1px solid var(--g2)', borderRadius:'var(--rx)', padding:'1.5rem', marginTop:'1rem' }}>
          <SidebarContent />
        </div>
      </div>

      <div className="br-layout mx">
        <aside className="br-sidebar" id="brSide">
          <SidebarContent />
        </aside>

        <div>
          <div className="br-toolbar">
            <div className="br-count">Showing <strong>{filteredArticles.length}</strong> products in <strong>{currentCategoryName}</strong></div>
            <div className="br-view-btns">
              <button className={`vbtn ${viewMode === 'grid' ? 'on' : ''}`} onClick={() => setViewMode('grid')}><LayoutGrid size={16} /></button>
              <button className={`vbtn ${viewMode === 'list' ? 'on' : ''}`} onClick={() => setViewMode('list')}><List size={16} /></button>
            </div>
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><Loader /></div>
          ) : (
            <div className="pgrid" style={viewMode === 'list' ? { gridTemplateColumns: '1fr' } : {}}>
              {filteredArticles.map(item => (
                <ProductCard 
                  key={item.id}
                  category={item.categorie?.nom || "Premium"} 
                  name={item.designation} 
                  price={String(item.puv_ttc)} 
                  img={getArticleImage(item)} 
                  badge={item.is_new_arrival ? { text: 'NEW', type: 'new' } : item.is_top_seller ? { text: 'BEST', type: 'best' } : undefined} 
                  onDetail={() => onNavigate('detail', { article: item })} 
                />
              ))}
            </div>
          )}

          {filteredArticles.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <Tag size={48} color="var(--g3)" style={{ marginBottom: '1rem' }} />
              <h3>No products found</h3>
              <p>Try selecting another category or clearing your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
