import React, { useState } from 'react';
import { CheckCircle, AlertCircle, ShoppingBag, ChevronRight, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl, getNextOrderNumber, createWebsiteOrder } from '../api';

interface CheckoutPageProps {
  onNavigate: (id: string, props?: any) => void;
}

interface FormData {
  nomPrenom: string;
  telephone: string;
  adresse: string;
  email: string;
  ville: string;
  code_postal: string;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, totalAmount, totalItems, clearCart, updateQty, removeFromCart } = useCart();
  const [form, setForm] = useState<FormData>({
    nomPrenom: '', telephone: '', adresse: '',
    email: '', ville: '', code_postal: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.nomPrenom.trim()) e.nomPrenom = 'Nom requis';
    if (!form.telephone.trim()) e.telephone = 'Téléphone requis';
    if (!form.adresse.trim()) e.adresse = 'Adresse requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    try {
      const numeroCommande = await getNextOrderNumber();
      const dateCommande = new Date().toISOString();
      const totalHT = items.reduce((s, i) => s + i.prix_ht * i.quantite, 0);
      const totalTVA = totalAmount - totalHT;

      await createWebsiteOrder({
        numeroCommande,
        dateCommande,
        taxMode: 'TTC',
        totalTTC: totalAmount,
        totalHT,
        totalTVA,
        totalTTCAfterRemise: totalAmount,
        clientWebsiteInfo: {
          nomPrenom: form.nomPrenom.trim(),
          telephone: form.telephone.trim(),
          adresse: form.adresse.trim(),
          email: form.email.trim() || undefined,
          ville: form.ville.trim() || undefined,
          code_postal: form.code_postal.trim() || undefined,
        },
        articles: items.map(i => ({
          article_id: i.article_id,
          designation: i.designation,
          quantite: i.quantite,
          quantiteLivree: 0,
          prix_unitaire: i.prix_ttc,
          prix_ttc: i.prix_ttc,
          tva: i.tva,
        })),
      });

      setOrderNumber(numeroCommande);
      setStatus('success');
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="page on">
        <style>{ckStyles}</style>
        <div className="ck-page-max">
          <div className="ck-success-card">
            <div className="ck-success-icon"><CheckCircle size={64} color="#22c55e" strokeWidth={1.5} /></div>
            <h2>Commande confirmée !</h2>
            <p>Merci pour votre achat. Notre équipe vous contactera bientôt.</p>
            <div className="ck-order-badge">{orderNumber}</div>
            <div className="ck-actions">
              <button className="btn btn-pr" onClick={() => onNavigate('shop')}>Continuer les achats</button>
              <button className="btn btn-ol" onClick={() => onNavigate('home')}>Accueil</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page on">
      <style>{ckStyles}</style>
      <div className="ck-page-max">
        <div className="ck-breadcrumb">
          <a onClick={() => onNavigate('home')}>Accueil</a>
          <ChevronRight size={13} />
          <a onClick={() => onNavigate('shop')}>Boutique</a>
          <ChevronRight size={13} />
          <span>Commander</span>
        </div>

        <h1 className="ck-title">Finaliser votre commande</h1>

        {items.length === 0 ? (
          <div className="ck-empty-state">
            <ShoppingBag size={48} strokeWidth={1} />
            <p>Votre panier est vide</p>
            <button className="btn btn-pr" onClick={() => onNavigate('shop')}>Retour à la boutique</button>
          </div>
        ) : (
          <>
            {/* CART SECTION */}
            <div className="ck-cart-section">
              <h2 className="ck-section-title"><ShoppingBag size={16} /> Panier ({totalItems} article{totalItems > 1 ? 's' : ''})</h2>

              <div className="ck-cart-items">
                <div className="ck-cart-header">
                  <span>Produit</span>
                  <span>Qty</span>
                  <span>Sous-total</span>
                  <span></span>
                </div>
                {items.map(item => (
                  <div key={item.article_id} className="ck-cart-item">
                    <div className="ck-item-product-col">
                      <img src={getImageUrl(item.image)} alt={item.designation} />
                      <span className="ck-item-title">{item.designation}</span>
                    </div>
                    <div className="ck-item-qty-ctrl">
                      <button onClick={() => updateQty(item.article_id, item.quantite - 1)}><Minus size={12} /></button>
                      <span>{item.quantite}</span>
                      <button onClick={() => updateQty(item.article_id, item.quantite + 1)}><Plus size={12} /></button>
                    </div>
                    <span className="ck-item-subtotal">{(item.prix_ttc * item.quantite).toFixed(3)} DT</span>
                    <button className="ck-remove-icon" onClick={() => removeFromCart(item.article_id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="ck-cart-total">
                <span>Total</span>
                <span className="ck-total-amount">{totalAmount.toFixed(3)} DT</span>
              </div>
            </div>

            {/* FORM SECTION */}
            <div className="ck-form-section">
              <h2 className="ck-section-title">Vos informations</h2>

              {status === 'error' && (
                <div className="ck-error-alert">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Row 1: Nom & Téléphone */}
                <div className="ck-form-row">
                  <div className="ck-form-col">
                    <label className="ck-label">Nom & Prénom <span>*</span></label>
                    <input
                      className={`ck-input ${errors.nomPrenom ? 'has-error' : ''}`}
                      placeholder="Ahmed Ben Ali"
                      value={form.nomPrenom}
                      onChange={handleChange('nomPrenom')}
                    />
                    {errors.nomPrenom && <span className="ck-error">{errors.nomPrenom}</span>}
                  </div>
                  <div className="ck-form-col">
                    <label className="ck-label">Téléphone <span>*</span></label>
                    <input
                      className={`ck-input ${errors.telephone ? 'has-error' : ''}`}
                      placeholder="20 123 456"
                      value={form.telephone}
                      onChange={handleChange('telephone')}
                      type="tel"
                    />
                    {errors.telephone && <span className="ck-error">{errors.telephone}</span>}
                  </div>
                </div>

                {/* Row 2: Adresse */}
                <div className="ck-form-row">
                  <div className="ck-form-col">
                    <label className="ck-label">Adresse <span>*</span></label>
                    <input
                      className={`ck-input ${errors.adresse ? 'has-error' : ''}`}
                      placeholder="12 Rue de la Paix, Tunis"
                      value={form.adresse}
                      onChange={handleChange('adresse')}
                    />
                    {errors.adresse && <span className="ck-error">{errors.adresse}</span>}
                  </div>
                </div>

                {/* Row 3: Ville & Code Postal */}
                <div className="ck-form-row">
                  <div className="ck-form-col">
                    <label className="ck-label">Ville</label>
                    <input
                      className="ck-input"
                      placeholder="Tunis"
                      value={form.ville}
                      onChange={handleChange('ville')}
                    />
                  </div>
                  <div className="ck-form-col">
                    <label className="ck-label">Code Postal</label>
                    <input
                      className="ck-input"
                      placeholder="1000"
                      value={form.code_postal}
                      onChange={handleChange('code_postal')}
                    />
                  </div>
                </div>

                {/* Row 4: Email */}
                <div className="ck-form-row">
                  <div className="ck-form-col">
                    <label className="ck-label">E-mail</label>
                    <input
                      className="ck-input"
                      placeholder="exemple@email.com"
                      value={form.email}
                      onChange={handleChange('email')}
                      type="email"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="ck-form-actions">
                  <div className="ck-total-summary">
                    <span>{totalItems} article(s)</span>
                    <span className="ck-total-amount">{totalAmount.toFixed(3)} DT</span>
                  </div>

                  <div className="ck-buttons">
                    <button type="submit" className="ck-submit" disabled={status === 'loading'}>
                      {status === 'loading' ? (
                        <>
                          <div className="ck-spinner"></div>
                          Traitement...
                        </>
                      ) : (
                        'Confirmer la commande'
                      )}
                    </button>
                    <button type="button" className="ck-back" onClick={() => onNavigate('shop')}>
                      <ArrowLeft size={14} /> Retour
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ckStyles = `
  .ck-page-max {
    max-width: 1100px;
    margin: 0 auto;
    padding: calc(var(--nav, 72px) + 2rem) clamp(1rem, 3vw, 2.5rem) 4rem;
  }

  .ck-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: #a0a098;
    margin-bottom: 2rem;
  }
  .ck-breadcrumb a { cursor: pointer; color: var(--pr, #00adee); }
  .ck-breadcrumb a:hover { text-decoration: underline; }

  .ck-title {
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    font-weight: 700;
    color: #03111f;
    margin-bottom: 2.5rem;
    font-family: var(--font, 'Montserrat'), sans-serif;
  }

  .ck-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #03111f;
    margin-bottom: 1.5rem;
  }

  /* CART SECTION */
  .ck-cart-section {
    background: #fafaf8;
    border-radius: 14px;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .ck-cart-items {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .ck-cart-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 0.5fr;
    gap: 1rem;
    align-items: center;
    padding-bottom: 0.75rem;
    margin-bottom: 0.5rem;
    border-bottom: 2px solid #e6e6e0;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #a0a098;
    letter-spacing: 0.05em;
  }

  .ck-cart-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 0.5fr;
    gap: 1rem;
    align-items: center;
    padding: 0;
    border-bottom: 1px solid #e6e6e0;
  }
  .ck-cart-item:last-child { border-bottom: none; }

  .ck-item-product-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    min-width: 0;
  }
  .ck-item-product-col img {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }
  .ck-item-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #03111f;
    line-height: 1.3;
    max-width: 120px;
  }

  .ck-item-qty-ctrl {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
  }
  .ck-item-qty-ctrl button {
    background: #fff;
    border: 1px solid #e6e6e0;
    width: 24px;
    height: 24px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #03111f;
    transition: all 0.15s;
  }
  .ck-item-qty-ctrl button:hover { background: #f0f0ec; }
  .ck-item-qty-ctrl span {
    min-width: 24px;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .ck-item-subtotal {
    font-size: 0.8rem;
    font-weight: 700;
    color: #03111f;
    text-align: right;
  }

  .ck-remove-icon {
    background: none;
    border: none;
    cursor: pointer;
    color: #a0a098;
    padding: 0;
    transition: color 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ck-remove-icon:hover { color: #f43f5e; }

  .ck-cart-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    padding-top: 0.75rem;
    border-top: 2px solid #e6e6e0;
    font-size: 0.9rem;
    font-weight: 700;
    color: #03111f;
  }
  .ck-total-amount {
    font-size: 1.2rem;
    color: var(--pr, #00adee);
  }

  @media (max-width: 768px) {
    .ck-cart-header,
    .ck-cart-item {
      grid-template-columns: 1.5fr 1fr 1fr 0.5fr;
      gap: 0.75rem;
      font-size: 0.7rem;
    }
    .ck-item-product-col { gap: 0.5rem; }
    .ck-item-product-col img { width: 90px; height: 90px; }
    .ck-item-title { max-width: 90px; }
  }

  /* FORM SECTION */
  .ck-form-section {
    background: #fff;
    border: 1px solid #f0f0ec;
    border-radius: 14px;
    padding: 2rem;
  }

  .ck-form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .ck-form-col { display: flex; flex-direction: column; }

  .ck-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #03111f;
    margin-bottom: 0.6rem;
    letter-spacing: 0.05em;
  }
  .ck-label span { color: #f43f5e; }

  .ck-input {
    padding: 0.8rem 1rem;
    border: 1.5px solid #e6e6e0;
    border-radius: 8px;
    font-size: 0.875rem;
    color: #03111f;
    background: #fff;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
  }
  .ck-input:focus { border-color: var(--pr, #00adee); }
  .ck-input.has-error { border-color: #f43f5e; }
  .ck-error { font-size: 0.7rem; color: #f43f5e; margin-top: 0.35rem; }

  .ck-error-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 0.875rem 1rem;
    font-size: 0.8rem;
    color: #dc2626;
    margin-bottom: 1.5rem;
  }

  .ck-form-actions {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #f0f0ec;
  }

  .ck-total-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: #606058;
    margin-bottom: 1.5rem;
  }
  .ck-total-summary .ck-total-amount {
    font-size: 1rem;
    font-weight: 700;
    color: var(--pr, #00adee);
  }

  .ck-buttons {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
  }

  .ck-submit {
    padding: 1rem;
    background: var(--pr, #00adee);
    color: #fff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.2s;
  }
  .ck-submit:hover:not(:disabled) { background: #008fca; }
  .ck-submit:disabled { background: #a0a098; cursor: not-allowed; }

  .ck-back {
    padding: 1rem 1.5rem;
    background: #f4f4f0;
    color: #03111f;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.2s;
    white-space: nowrap;
  }
  .ck-back:hover { background: #e6e6e0; }

  .ck-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ckSpin 0.7s linear infinite;
  }
  @keyframes ckSpin { to { transform: rotate(360deg); } }

  /* EMPTY STATE */
  .ck-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 4rem 2rem;
    text-align: center;
    color: #a0a098;
  }

  /* SUCCESS */
  .ck-success-card {
    background: #fff;
    border: 1px solid #f0f0ec;
    border-radius: 16px;
    padding: 3rem 2rem;
    text-align: center;
    max-width: 500px;
    margin: 3rem auto;
  }
  .ck-success-icon { margin-bottom: 1rem; }
  .ck-success-card h2 { font-size: 1.5rem; font-weight: 700; color: #03111f; margin-bottom: 0.75rem; }
  .ck-success-card p { font-size: 0.9rem; color: #606058; line-height: 1.6; margin-bottom: 1.5rem; }
  .ck-order-badge {
    background: #f0f9ff;
    border: 1.5px solid #bae6fd;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--pr, #00adee);
    letter-spacing: 0.05em;
    margin-bottom: 2rem;
  }
  .ck-actions {
    display: flex;
    gap: 0.75rem;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    .ck-buttons { grid-template-columns: 1fr; }
    .ck-form-row { grid-template-columns: 1fr; }
  }
`;

export default CheckoutPage;
