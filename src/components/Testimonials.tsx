import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchTestimonials, Testimonial, getImageUrl } from '../api';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Testimonials: React.FC = () => {
  useScrollReveal();
  const [items, setItems] = useState<Testimonial[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTestimonials()
      .then((data) => {
        setItems(data);
        // Trigger scroll-reveal for the freshly rendered elements
        requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')));
      })
      .catch(() => {});
  }, []);

  const scroll = (dir: number) => {
    if (trackRef.current) {
      const amount = trackRef.current.offsetWidth * 0.7;
      trackRef.current.scrollBy({ left: dir * amount, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="testi-sec">
      <div className="mx">
        <div className="shd c rv">
          <div className="stag">Avis</div>
          <h2 className="stit">Ce que disent nos <em>clients</em></h2>
        </div>

        <div className="testi-wrap rv">
          <button className="icr-btn lft" onClick={() => scroll(-1)} aria-label="Précédent">
            <ChevronLeft size={18} />
          </button>

          <div className="testi-track" ref={trackRef}>
            {items.map((t) => (
              <figure key={t.id} className="tc-img-card">
                <img src={getImageUrl(t.image)} alt={t.name || 'Avis client'} loading="lazy" />
                {t.name && <figcaption className="tc-img-name">{t.name}</figcaption>}
              </figure>
            ))}
          </div>

          <button className="icr-btn rgt" onClick={() => scroll(1)} aria-label="Suivant">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
