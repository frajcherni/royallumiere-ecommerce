import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchBrands, Brand, getImageUrl } from '../api';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface BrandsProps {
  onNavigate?: (id: string, props?: any) => void;
}

const Brands: React.FC<BrandsProps> = () => {
  useScrollReveal();
  const [brands, setBrands] = useState<Brand[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBrands()
      .then((data) => {
        setBrands(data);
        // Trigger scroll-reveal for the freshly rendered elements
        requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')));
      })
      .catch(() => {});
  }, []);

  const scroll = (dir: number) => {
    if (trackRef.current) {
      const amount = trackRef.current.offsetWidth * 0.6;
      trackRef.current.scrollBy({ left: dir * amount, behavior: 'smooth' });
    }
  };

  if (brands.length === 0) return null;

  const handleClick = (b: Brand) => {
    if (b.link) window.open(b.link, '_blank', 'noopener');
  };

  return (
    <section className="brands-sec">
      <div className="mx">
        <div className="shd c rv" style={{ marginBottom: 'clamp(2rem,4vw,3.5rem)' }}>
          <h2 className="stit">Marques les plus <em>populaires</em></h2>
        </div>

        <div className="brands-wrap rv">
          <button className="icr-btn lft" onClick={() => scroll(-1)} aria-label="Précédent">
            <ChevronLeft size={18} />
          </button>

          <div className="brands-track" ref={trackRef}>
            {brands.map((b) => (
              <div
                key={b.id}
                className={`brand-item${b.link ? ' clickable' : ''}`}
                onClick={() => handleClick(b)}
                title={b.name}
              >
                <img src={getImageUrl(b.image)} alt={b.name} loading="lazy" />
              </div>
            ))}
          </div>

          <button className="icr-btn rgt" onClick={() => scroll(1)} aria-label="Suivant">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Brands;
