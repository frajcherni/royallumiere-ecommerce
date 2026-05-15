import React from 'react';
import { Heart, Plus } from 'lucide-react';

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
  onDetail 
}) => {
  const badgeClass = badge ? `pb-${badge.type.charAt(0)}` : '';

  const stopProp = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="pc rv vis" onClick={onDetail}>
      <div className="pc-img">
        <img src={img} alt={name} loading="lazy" />
        <div className="pc-ov"></div>
        {badge && <span className={`pbadge ${badgeClass}`}>{badge.text}</span>}
        <button className="pc-w" onClick={stopProp}>
          <Heart size={16} />
        </button>
        <button className="pc-qa" onClick={stopProp}>Quick Add</button>
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
            ${price}
            {oldPrice && <s>${oldPrice}</s>}
          </div>
          <button className="padd" onClick={stopProp}>
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
