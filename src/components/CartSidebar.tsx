import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

interface CartSidebarProps {
  onNavigate: (id: string) => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ onNavigate }) => {
  const { items, removeFromCart, updateQty, totalItems, totalAmount, isCartOpen, closeCart } = useCart();

  const handleCheckout = () => {
    closeCart();
    onNavigate('checkout');
  };

  return (
    <>
      <style>{`
        .cart-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(3,17,31,0.35); backdrop-filter: blur(4px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .cart-overlay.open { opacity: 1; pointer-events: all; }

        .cart-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(420px, 100vw);
          background: #fff;
          z-index: 2001;
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
        }
        .cart-drawer.open { transform: translateX(0); }

        .cart-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 1.75rem;
          border-bottom: 1px solid #f0f0ec;
          flex-shrink: 0;
        }
        .cart-head-title {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.85rem; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: #03111f;
        }
        .cart-count-pill {
          background: var(--pr, #00adee); color: #fff;
          font-size: 0.65rem; font-weight: 700;
          padding: 2px 7px; border-radius: 20px;
        }
        .cart-close {
          background: #f4f4f0; border: none; cursor: pointer;
          color: #03111f; width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .cart-close:hover { background: #e6e6e0; }

        .cart-body {
          flex: 1; overflow-y: auto; padding: 1.25rem 1.75rem;
          display: flex; flex-direction: column; gap: 1rem;
        }
        .cart-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 1rem;
          color: #a0a098; text-align: center;
          padding: 3rem 1rem;
        }
        .cart-empty p { font-size: 0.9rem; }

        .cart-item {
          display: flex; gap: 1rem; align-items: flex-start;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0f0ec;
        }
        .cart-item:last-child { border-bottom: none; padding-bottom: 0; }
        .cart-item-img {
          width: 72px; height: 72px; border-radius: 8px;
          object-fit: cover; flex-shrink: 0;
          background: #f4f4f0;
        }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-name {
          font-size: 0.82rem; font-weight: 600; color: #03111f;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 0.2rem;
        }
        .cart-item-price {
          font-size: 0.78rem; color: var(--pr, #00adee);
          font-weight: 700; margin-bottom: 0.6rem;
        }
        .cart-item-controls { display: flex; align-items: center; }
        .qty-btn {
          background: #f4f4f0; border: none; cursor: pointer;
          width: 28px; height: 28px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          color: #03111f;
          transition: background 0.15s;
        }
        .qty-btn:hover { background: #e6e6e0; }
        .cart-item-qty {
          font-size: 0.82rem; font-weight: 600; color: #03111f;
          min-width: 30px; text-align: center;
        }
        .cart-item-remove {
          background: none; border: none; cursor: pointer;
          color: #a0a098; padding: 2px;
          transition: color 0.15s;
          margin-left: auto;
        }
        .cart-item-remove:hover { color: #f43f5e; }

        .cart-foot {
          flex-shrink: 0;
          border-top: 1px solid #f0f0ec;
          padding: 1.25rem 1.75rem;
        }
        .cart-subtotal {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.82rem; color: #606058;
          margin-bottom: 0.5rem;
        }
        .cart-total {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 1rem; font-weight: 700; color: #03111f;
          margin-bottom: 1.25rem;
        }
        .cart-total span:last-child { color: var(--pr, #00adee); }
        .cart-checkout-btn {
          width: 100%; padding: 1rem;
          background: var(--pr, #00adee); color: #fff;
          border: none; border-radius: 10px; cursor: pointer;
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: background 0.2s, transform 0.15s;
        }
        .cart-checkout-btn:hover { background: #008fca; transform: translateY(-1px); }
      `}</style>

      <div className={`cart-overlay${isCartOpen ? ' open' : ''}`} onClick={closeCart} />

      <div className={`cart-drawer${isCartOpen ? ' open' : ''}`}>
        <div className="cart-head">
          <div className="cart-head-title">
            <ShoppingBag size={16} />
            Mon Panier
            {totalItems > 0 && <span className="cart-count-pill">{totalItems}</span>}
          </div>
          <button className="cart-close" onClick={closeCart}><X size={18} /></button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.article_id} className="cart-item">
                <img
                  className="cart-item-img"
                  src={getImageUrl(item.image)}
                  alt={item.designation}
                  onError={e => { (e.target as HTMLImageElement).src = getImageUrl(null); }}
                />
                <div className="cart-item-info">
                  <div className="cart-item-name" title={item.designation}>{item.designation}</div>
                  <div className="cart-item-price">{Number(item.prix_ttc).toFixed(3)} DT</div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQty(item.article_id, item.quantite - 1)}>
                      <Minus size={12} />
                    </button>
                    <span className="cart-item-qty">{item.quantite}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.article_id, item.quantite + 1)}>
                      <Plus size={12} />
                    </button>
                    <button className="cart-item-remove" onClick={() => removeFromCart(item.article_id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-foot">
            <div className="cart-subtotal">
              <span>{totalItems} article{totalItems > 1 ? 's' : ''}</span>
              <span>{totalAmount.toFixed(3)} DT</span>
            </div>
            <div className="cart-total">
              <span>Total TTC</span>
              <span>{totalAmount.toFixed(3)} DT</span>
            </div>
            <button className="cart-checkout-btn" onClick={handleCheckout}>
              Passer la commande <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
