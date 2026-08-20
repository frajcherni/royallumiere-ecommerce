import React from 'react';
import { Plus, ShoppingCart, CreditCard } from 'lucide-react';

interface ProductCardProps {
  category: string;
  name: string;
  price: string | number;
  oldPrice?: string | number;
  img: string;
  badge?: { text: string; type: 'new' | 'hot' | 'sale' | 'best' };
  rating?: string;
  reviews?: number | string;
  onDetail: () => void;
  onAddToCart?: () => void;
  onCommander?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  category,
  name,
  price,
  oldPrice,
  img,
  badge,
  rating = '★★★★★',
  reviews = 120,
  onDetail,
  onAddToCart,
  onCommander,
}) => {
  const badgeClass = badge ? `pb-${badge.type.charAt(0)}` : '';

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  const handleAddToCart = (e: React.MouseEvent) => {
    stopProp(e);
    onAddToCart?.();
  };

  const handleCommander = (e: React.MouseEvent) => {
    stopProp(e);
    onCommander?.();
  };

  return (
    <div className="pc rv vis" onClick={onDetail}>
      <div className="pc-img">
        <img src={img} alt={name} loading="lazy" />
        <div className="pc-ov"></div>
        {badge && <span className={`pbadge ${badgeClass}`}>{badge.text}</span>}
        <button className="pc-qa" onClick={handleAddToCart}>
          <ShoppingCart size={13} style={{ marginRight: 5 }} />
          Ajouter
        </button>
      </div>
      <div className="pcb">
        <div className="pcat">{category}</div>
        <div className="pnm">{name}</div>
        <div className="prt">
          <span className="st">{rating}</span>
          <span>({reviews})</span>
        </div>
        <div className="pft">
          <div className="ppr">
            {Number(price).toFixed(3)} DT
            {oldPrice && <s>{Number(oldPrice).toFixed(3)} DT</s>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="padd padd-outline"
              onClick={handleCommander}
              title="Commander"
            >
              <CreditCard size={13} />
            </button>
            <button className="padd padd-primary" onClick={handleAddToCart} title="Ajouter au panier">
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
