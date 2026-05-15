import React, { useState, useRef, useEffect } from 'react';
import { Heart, ShoppingBag, Plus, Minus, Truck, RefreshCcw, Shield, Clock, Gift, CreditCard, Star, ChevronLeft, ChevronRight, ZoomIn, Tag } from 'lucide-react';
import ProductCard from './ProductCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Article } from '../api';

interface DetailProps {
  onNavigate: (id: string, props?: any) => void;
  article?: Article;
}

const Detail: React.FC<DetailProps> = ({ onNavigate, article }) => {
  useScrollReveal();
  const [qty, setQty] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const relRef = useRef<HTMLDivElement>(null);

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=85&fit=crop";
    if (imagePath.startsWith('http')) return imagePath;
    return `${IMAGE_URL}/${imagePath.replace(/\\/g, '/')}`;
  };

  const images = article?.website_images && article.website_images.length > 0 
    ? article.website_images.map(img => getImageUrl(img))
    : [article?.image ? getImageUrl(article.image) : "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=85&fit=crop"];

  const [activeImg, setActiveImg] = useState(images[0]);

  useEffect(() => {
    if (images[0]) setActiveImg(images[0]);
  }, [article]);

  const scrollRel = (dir: number) => {
    if (relRef.current) {
      relRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (!article) {
    return (
      <div className="page on flex-center" style={{ minHeight: '60vh', flexDirection: 'column' }}>
        <h2>Product Not Found</h2>
        <button className="btn btn-pr" onClick={() => onNavigate('shop')}>Back to Shop</button>
      </div>
    );
  }

  return (
    <div className="page on">
      <div className="dt-w mx">
        <div className="brc">
          <a onClick={() => onNavigate('home')}>Home</a>
          <ChevronRight size={13} />
          <a onClick={() => onNavigate('shop')}>Shop</a>
          <ChevronRight size={13} />
          {article.categorie && (
            <>
               <a onClick={() => onNavigate('shop', { category: article.categorie?.id })}>{article.categorie.nom}</a>
               <ChevronRight size={13} />
            </>
          )}
          <span className="brc-c">{article.designation}</span>
        </div>

        <div className="dt-g">
          <div className="dt-imgs">
            <div className="dt-mi">
              <img src={activeImg} alt={article.nom} />
              <div className="dt-zm"><ZoomIn size={15} /></div>
            </div>
            <div className="dt-ths">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  className={`dth ${activeImg === img ? 'on' : ''}`}
                  onClick={() => setActiveImg(img)}
                >
                  <img src={img} alt={`Thumb ${i}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="dt-info">
            <div className="dt-cat"><Tag size={12} /> {article.categorie?.nom || 'Premium Collection'}</div>
            <h1 className="dt-tit">{article.designation}</h1>
            
            <div className="dt-rat">
              <span className="st" style={{ fontSize: '1rem', letterSpacing: 2 }}>★★★★★</span>
              <span className="rtx">4.9 (Customer favorite)</span>
              <span className="inst">In Stock</span>
            </div>

            <div className="dt-pr">
              <span className="cu">${Number(article.puv_ttc).toFixed(2)}</span>
            </div>

            <p className="dt-desc">
              {article.website_description || 'No detailed description available for this premium item yet.'}
            </p>

            <div className="og">
              <div className="og-l"><span>Options available soon</span></div>
            </div>

            <div className="qty-r" style={{ marginTop: '2rem' }}>
              <div className="qty-c">
                <button className="qty-b" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
                <span className="qty-v">{qty}</span>
                <button className="qty-b" onClick={() => setQty(qty + 1)}><Plus size={14} /></button>
              </div>
            </div>

            <div className="dt-acts">
              <button 
                className="btn btn-pr" 
                style={{ flex: 1, justifyContent: 'center', background: isAdded ? '#16a34a' : '' }}
                onClick={handleAddToCart}
              >
                {isAdded ? 'Added to Cart!' : <><ShoppingBag size={16} /> Add to Cart</>}
              </button>
              <button 
                className={`btn btn-ol ${isLiked ? 'liked' : ''}`} 
                style={{ padding: '1rem 1.1rem', color: isLiked ? '#f43f5e' : '', borderColor: isLiked ? '#f43f5e' : '' }}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart size={16} fill={isLiked ? '#f43f5e' : 'none'} />
              </button>
            </div>

            <div className="dt-fts">
              <div className="dt-ft"><Truck size={14} /> Free express shipping</div>
              <div className="dt-ft"><RefreshCcw size={14} /> 30-day easy returns</div>
              <div className="dt-ft"><Shield size={14} /> 2-year warranty</div>
              <div className="dt-ft"><Clock size={14} /> Ships within 24h</div>
              <div className="dt-ft"><Gift size={14} /> Gift wrapping available</div>
              <div className="dt-ft"><CreditCard size={14} /> Buy now, pay later</div>
            </div>
          </div>
        </div>

        {/* RELATED CAROUSEL */}
        <div style={{ marginTop: '5rem', paddingBottom:'5rem' }}>
          <div className="shd rv" style={{ marginBottom: '2rem' }}>
            <div className="stag">You May Also Like</div>
            <h2 className="stit">Complete the <em>Look</em></h2>
          </div>
          
          <div className="icr-wrap rv">
            <button className="icr-btn lft" onClick={() => scrollRel(-1)}><ChevronLeft size={18} /></button>
            <div className="icr-outer">
              <div className="icr-track" ref={relRef} style={{ overflowX:'hidden', scrollBehavior:'smooth' }}>
                <ProductCard category="Jewelry" name="Gold Chain Necklace" price="195" img="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80&fit=crop" onDetail={() => onNavigate('detail')} />
                <ProductCard category="Eyewear" name="Cat Eye Luxe Frames" price="89" img="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80&fit=crop" onDetail={() => onNavigate('detail')} />
                <ProductCard category="Beauty" name="Hydra Glow Mist" price="52" img="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80&fit=crop" onDetail={() => onNavigate('detail')} />
                <ProductCard category="Watches" name="Slim Dress Watch" price="345" img="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&fit=crop" onDetail={() => onNavigate('detail')} />
                <ProductCard category="Bags" name="Leather Wallet" price="75" img="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop" onDetail={() => onNavigate('detail')} />
              </div>
            </div>
            <button className="icr-btn rgt" onClick={() => scrollRel(1)}><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
