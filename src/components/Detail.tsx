import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, Truck, RefreshCcw, Shield, Clock, Gift, CreditCard, ChevronLeft, ChevronRight, ZoomIn, Tag, ShoppingCart } from 'lucide-react';
import ProductCard from './ProductCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Article, getImageUrl } from '../api';
import { useCart } from '../context/CartContext';

interface DetailProps {
  onNavigate: (id: string, props?: any) => void;
  article?: Article;
}

const Detail: React.FC<DetailProps> = ({ onNavigate, article }) => {
  useScrollReveal();
  const [qty, setQty] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const relRef = useRef<HTMLDivElement>(null);
  const { addToCart, openCart } = useCart();

  const images = article?.website_images && article.website_images.length > 0
    ? article.website_images.map(img => getImageUrl(img))
    : [article?.image ? getImageUrl(article.image) : getImageUrl(null)];

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
    if (!article) return;
    addToCart(article, qty);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
    openCart();
  };

  const handleOrderNow = () => {
    if (!article) return;
    addToCart(article, qty);
    onNavigate('checkout');
  };

  if (!article) {
    return (
      <div className="page on flex-center" style={{ minHeight: '60vh', flexDirection: 'column' }}>
        <h2>Produit introuvable</h2>
        <button className="btn btn-pr" onClick={() => onNavigate('shop')}>Retour à la boutique</button>
      </div>
    );
  }

  return (
    <div className="page on">
      <div className="dt-w mx">
        <div className="brc">
          <a onClick={() => onNavigate('home')}>Accueil</a>
          <ChevronRight size={13} />
          <a onClick={() => onNavigate('shop')}>Boutique</a>
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
                  <img src={img} alt={`Miniature ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="dt-info">
            <div className="dt-cat"><Tag size={12} /> {article.categorie?.nom || 'Collection Premium'}</div>
            <h1 className="dt-tit">{article.designation}</h1>

            <div className="dt-rat">
              <span className="st" style={{ fontSize: '1rem', letterSpacing: 2 }}>★★★★★</span>
              <span className="rtx">4.9 (Favoris clients)</span>
              <span className="inst">En Stock</span>
            </div>

            <div className="dt-pr">
              <span className="cu">{Number(article.puv_ttc).toFixed(3)} DT</span>
            </div>

            <p className="dt-desc">
              {article.website_description || 'Aucune description détaillée disponible pour ce produit premium.'}
            </p>

            <div className="qty-r" style={{ marginTop: '2rem' }}>
              <div className="qty-c">
                <button className="qty-b" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
                <span className="qty-v">{qty}</span>
                <button className="qty-b" onClick={() => setQty(qty + 1)}><Plus size={14} /></button>
              </div>
            </div>

            <div className="dt-acts" style={{ flexDirection: 'row', gap: '0.75rem', alignItems: 'stretch' }}>
              <button
                className="btn btn-pr"
                style={{ flex: 1, justifyContent: 'center', background: addedFeedback ? '#16a34a' : '' }}
                onClick={handleAddToCart}
              >
                {addedFeedback
                  ? 'Ajouté au panier !'
                  : <><ShoppingBag size={16} /> Ajouter au panier</>}
              </button>
              <button
                className="btn btn-pr"
                style={{ flex: 1, justifyContent: 'center', background: '#008fca' }}
                onClick={handleOrderNow}
              >
                <ShoppingCart size={16} /> Commander maintenant
              </button>
            </div>

            <div className="dt-fts">
              <div className="dt-ft"><Truck size={14} /> Livraison express gratuite</div>
              <div className="dt-ft"><RefreshCcw size={14} /> Retours faciles sous 30 jours</div>
              <div className="dt-ft"><Shield size={14} /> Garantie 2 ans</div>
              <div className="dt-ft"><Clock size={14} /> Expédié sous 24h</div>
              <div className="dt-ft"><Gift size={14} /> Emballage cadeau disponible</div>
              <div className="dt-ft"><CreditCard size={14} /> Paiement à la livraison</div>
            </div>
          </div>
        </div>

        {/* RELATED CAROUSEL */}
        <div style={{ marginTop: '5rem', paddingBottom:'5rem' }}>
          <div className="shd rv" style={{ marginBottom: '2rem' }}>
            <div className="stag">Vous aimerez aussi</div>
            <h2 className="stit">Complétez votre <em>look</em></h2>
          </div>

          <div className="icr-wrap rv">
            <button className="icr-btn lft" onClick={() => scrollRel(-1)}><ChevronLeft size={18} /></button>
            <div className="icr-outer">
              <div className="icr-track" ref={relRef} style={{ overflowX:'hidden', scrollBehavior:'smooth' }}>
                <ProductCard category="Bijoux" name="Collier Chaîne Or" price="195" img="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80&fit=crop" onDetail={() => onNavigate('detail')} />
                <ProductCard category="Lunettes" name="Montures Luxe Cat Eye" price="89" img="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80&fit=crop" onDetail={() => onNavigate('detail')} />
                <ProductCard category="Beauté" name="Brume Hydra Glow" price="52" img="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80&fit=crop" onDetail={() => onNavigate('detail')} />
                <ProductCard category="Montres" name="Montre Slim Élégance" price="345" img="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&fit=crop" onDetail={() => onNavigate('detail')} />
                <ProductCard category="Maroquinerie" name="Portefeuille Cuir" price="75" img="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop" onDetail={() => onNavigate('detail')} />
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
