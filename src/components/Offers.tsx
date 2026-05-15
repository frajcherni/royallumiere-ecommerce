import React, { useState, useEffect } from 'react';
import { Tag, Zap, ArrowRight, Clock } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface OffersProps {
  onNavigate: (id: string) => void;
}

const Offers: React.FC<OffersProps> = ({ onNavigate }) => {
  useScrollReveal();
  const [timeLeft, setTimeLeft] = useState(12 * 3600 + 47 * 60 + 9);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev <= 0 ? 12 * 3600 : prev - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') };
  };
  const cd = formatTime(timeLeft);

  return (
    <div className="page on">
      <div className="of-hero">
        <div className="of-hero-in">
          <div className="of-ey"><Zap size={13} fill="var(--se)" color="var(--se)" /> Flash Deals Ending</div>
          <h1>Extraordinary <strong>Deals</strong><br />End Soon</h1>
          <p style={{ color: 'rgba(255,255,255,.68)', margin: '.8rem 0 2rem', fontSize: '.95rem', fontWeight: 300, maxWidth: 380 }}>
            Hand-picked offers updated daily — incredible savings on premium products.
          </p>
          <div className="cdown">
            <div className="cdu"><div className="cdn">{cd.h}</div><div className="cdl">Hours</div></div>
            <span className="cds">:</span>
            <div className="cdu"><div className="cdn">{cd.m}</div><div className="cdl">Mins</div></div>
            <span className="cds">:</span>
            <div className="cdu"><div className="cdn">{cd.s}</div><div className="cdl">Secs</div></div>
          </div>
        </div>
      </div>

      <div className="of-grid">
        {[
          { nm: 'Cloud Runner Sneakers', ds: 'Our most loved sneaker at an unmissable price. Sizes running out fast.', np: '99.00', op: '249.00', disc: '60', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop' },
          { nm: 'Monaco Elite Watch', ds: 'Timeless elegance at a fraction of the price. Only 12 units remaining.', np: '299.00', op: '459.00', disc: '35', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&fit=crop' },
          { nm: 'Velvet Tote Bag', ds: 'Luxurious, spacious, and versatile. Perfect for work and weekend escapes.', np: '161.00', op: '269.00', disc: '40', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop' },
          { nm: 'Botanical Serum Set', ds: 'Complete 3-piece skincare ritual with award-winning botanical formulas.', np: '49.00', op: '98.00', disc: '50', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80&fit=crop' },
          { nm: 'Crystal Ring Bundle', ds: 'Two statement rings for the price of one. Gift-ready in a beautiful box.', np: '109.00', op: '198.00', disc: '45', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80&fit=crop' },
          { nm: 'Cashmere Scarf Duo', ds: 'Pair of ultra-soft cashmere scarves in complementary tones.', np: '115.00', op: '258.00', disc: '55', img: 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=600&q=80&fit=crop' }
        ].map((o, i) => (
          <div key={i} className={`ofc rv d${i % 3}`} onClick={() => onNavigate('detail')}>
            <div className="ofc-img">
              <img src={o.img} alt={o.nm} loading="lazy" />
              <div className="ofc-disc"><span>{o.disc}</span><small>%OFF</small></div>
            </div>
            <div className="ofc-b">
              <div className="ofc-nm">{o.nm}</div>
              <div className="ofc-ds">{o.ds}</div>
              <div className="ofc-ft">
                <div className="ofc-ps"><span className="np">${o.np}</span><span className="op">${o.op}</span></div>
                <button className="btn btn-pr" style={{ padding: '.5rem 1.1rem', fontSize: '.76rem' }}>Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Offers;
