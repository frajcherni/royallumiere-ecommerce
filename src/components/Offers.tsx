import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, Tag } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { fetchPromos, Promo, getImageUrl } from '../api';
import SmartImage from './SmartImage';
import { SkeletonProductGrid } from './Skeleton';

interface OffersProps {
  onNavigate: (id: string, props?: any) => void;
}

const Offers: React.FC<OffersProps> = ({ onNavigate }) => {
  useScrollReveal();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setPromos(await fetchPromos());
      } catch (e) {
        console.error('Error loading promos:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goToProduct = (promo: Promo) => {
    onNavigate('detail', { article: promo.product });
  };

  return (
    <div className="page on">
      <div className="of-hero">
        <div className="of-hero-in">
          <div className="of-ey"><Zap size={13} fill="var(--se)" color="var(--se)" /> Promotions</div>
          <h1>Nos <strong>Offres</strong></h1>
        </div>
      </div>

      {loading ? (
        <SkeletonProductGrid count={6} className="of-grid" />
      ) : promos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--g3)' }}>
          <Tag size={48} style={{ marginBottom: '1rem' }} />
          <h3>Aucune promotion en cours</h3>
          <p>Revenez bientôt pour découvrir nos offres exclusives.</p>
        </div>
      ) : (
        <div className="of-grid">
          {promos.map((promo, i) => (
            <div key={promo.id} className={`ofc rv d${i % 3}`} onClick={() => goToProduct(promo)}>
              <div className="ofc-img">
                <SmartImage
                  src={getImageUrl(promo.product?.image)}
                  alt={promo.product?.designation || promo.title}
                  ratio="4 / 3"
                />
                <div className="ofc-promo-tag">PROMO</div>
              </div>
              <div className="ofc-b">
                <div className="ofc-nm">{promo.title}</div>
                {promo.description && <div className="ofc-ds">{promo.description}</div>}
                <div className="ofc-ft">
                  <div className="ofc-ps">
                    <span className="np">{Number(promo.product?.puv_ttc).toFixed(3)} DT</span>
                  </div>
                  <button
                    className="btn btn-pr"
                    style={{ padding: '.5rem 1.1rem', fontSize: '.76rem' }}
                    onClick={(e) => { e.stopPropagation(); goToProduct(promo); }}
                  >
                    Voir le produit <ArrowRight size={14} style={{ marginLeft: 6 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
