import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getNextOrderNumber, createWebsiteOrder } from '../api';

interface FormData {
  nomPrenom: string;
  telephone: string;
  adresse: string;
  email: string;
  ville: string;
  code_postal: string;
}

const CheckoutModal: React.FC = () => {
  const { items, totalAmount, clearCart, isCheckoutOpen, closeCheckout } = useCart();

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
    if (!form.nomPrenom.trim()) e.nomPrenom = 'Le nom est obligatoire';
    if (!form.telephone.trim()) e.telephone = 'Le téléphone est obligatoire';
    if (!form.adresse.trim()) e.adresse = "L'adresse est obligatoire";
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
      setErrorMsg(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      setStatus('error');
    }
  };

  const handleClose = () => {
    if (status === 'loading') return;
    closeCheckout();
    if (status === 'success' || status === 'error') {
      setStatus('idle');
      setForm({ nomPrenom: '', telephone: '', adresse: '', email: '', ville: '', code_postal: '' });
      setErrors({});
      setErrorMsg('');
      setOrderNumber('');
    }
  };

  if (!isCheckoutOpen) return null;

  return (
    <>
      <style>{`
        .ck-backdrop {
          position: fixed; inset: 0; z-index: 3000;
          background: rgba(3,17,31,0.5); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .ck-modal {
          background: #fff; border-radius: 18px;
          width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto;
          position: relative;
          box-shadow: 0 24px 80px rgba(0,0,0,0.2);
          animation: ckSlideIn 0.3s ease;
        }
        @keyframes ckSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ck-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f0f0ec;
        }
        .ck-head h2 {
          font-size: 1rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #03111f;
        }
        .ck-close {
          background: #f4f4f0; border: none; cursor: pointer;
          color: #03111f; width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .ck-close:hover { background: #e6e6e0; }
        .ck-body { padding: 1.75rem 2rem; }

        .ck-summary {
          background: #f8fafb; border-radius: 12px; padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          font-size: 0.8rem; color: #606058;
        }
        .ck-summary-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.2rem 0;
        }
        .ck-summary-total {
          font-size: 0.95rem; font-weight: 700; color: #03111f;
          border-top: 1px solid #e6e6e0; margin-top: 0.5rem;
          padding-top: 0.5rem;
        }
        .ck-summary-total span:last-child { color: var(--pr, #00adee); }

        .ck-section-title {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em;
          text-transform: uppercase; color: #a0a098;
          margin-bottom: 1rem;
        }
        .ck-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
        .ck-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.875rem; }
        .ck-field label {
          font-size: 0.75rem; font-weight: 600; color: #03111f;
          letter-spacing: 0.05em;
        }
        .ck-field label span { color: #f43f5e; margin-left: 2px; }
        .ck-input {
          padding: 0.7rem 0.9rem;
          border: 1.5px solid #e6e6e0; border-radius: 8px;
          font-size: 0.85rem; color: #03111f;
          background: #fff; outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .ck-input:focus { border-color: var(--pr, #00adee); }
        .ck-input.err { border-color: #f43f5e; }
        .ck-err-msg { font-size: 0.72rem; color: #f43f5e; }

        .ck-submit {
          width: 100%; padding: 1rem;
          background: var(--pr, #00adee); color: #fff;
          border: none; border-radius: 10px; cursor: pointer;
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: background 0.2s, transform 0.15s;
          margin-top: 0.5rem;
        }
        .ck-submit:hover:not(:disabled) { background: #008fca; transform: translateY(-1px); }
        .ck-submit:disabled { background: #a0a098; cursor: not-allowed; }

        .ck-spinner {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ck-success, .ck-error-state {
          padding: 2.5rem 2rem; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .ck-success h3 { font-size: 1.15rem; font-weight: 700; color: #03111f; }
        .ck-success p { font-size: 0.85rem; color: #606058; line-height: 1.6; }
        .ck-order-num {
          background: #f0f9ff; border: 1px solid #bae6fd;
          border-radius: 8px; padding: 0.6rem 1.25rem;
          font-size: 0.8rem; font-weight: 700;
          color: var(--pr, #00adee); letter-spacing: 0.05em;
        }
        .ck-done-btn {
          background: var(--pr, #00adee); color: #fff;
          border: none; border-radius: 8px; cursor: pointer;
          padding: 0.8rem 2rem; font-size: 0.82rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          transition: background 0.2s;
        }
        .ck-done-btn:hover { background: #008fca; }
        .ck-error-state h3 { font-size: 1rem; font-weight: 700; color: #03111f; }
        .ck-error-state p { font-size: 0.85rem; color: #606058; }
        .ck-retry-btn {
          background: #f4f4f0; color: #03111f;
          border: none; border-radius: 8px; cursor: pointer;
          padding: 0.8rem 2rem; font-size: 0.82rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          transition: background 0.2s;
        }
        .ck-retry-btn:hover { background: #e6e6e0; }

        @media (max-width: 480px) {
          .ck-row { grid-template-columns: 1fr; }
          .ck-body { padding: 1.25rem; }
          .ck-head { padding: 1.25rem; }
        }
      `}</style>

      <div className="ck-backdrop" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
        <div className="ck-modal">
          <div className="ck-head">
            <h2>Finaliser la commande</h2>
            <button className="ck-close" onClick={handleClose}><X size={16} /></button>
          </div>

          {status === 'success' ? (
            <div className="ck-success">
              <CheckCircle size={56} color="#22c55e" strokeWidth={1.5} />
              <h3>Commande confirmée !</h3>
              <p>Votre commande a été enregistrée avec succès.<br />Notre équipe vous contactera sous peu pour confirmer la livraison.</p>
              <div className="ck-order-num">{orderNumber}</div>
              <button className="ck-done-btn" onClick={handleClose}>Continuer les achats</button>
            </div>
          ) : status === 'error' ? (
            <div className="ck-error-state">
              <AlertCircle size={48} color="#f43f5e" strokeWidth={1.5} />
              <h3>Une erreur est survenue</h3>
              <p>{errorMsg}</p>
              <button className="ck-retry-btn" onClick={() => setStatus('idle')}>Réessayer</button>
            </div>
          ) : (
            <div className="ck-body">
              {/* Order summary */}
              <div className="ck-summary">
                {items.map(i => (
                  <div key={i.article_id} className="ck-summary-row">
                    <span>{i.designation} × {i.quantite}</span>
                    <span>{(i.prix_ttc * i.quantite).toFixed(3)} DT</span>
                  </div>
                ))}
                <div className="ck-summary-row ck-summary-total">
                  <span>Total TTC</span>
                  <span>{totalAmount.toFixed(3)} DT</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="ck-section-title">Vos informations</div>

                <div className="ck-field">
                  <label>Nom & Prénom <span>*</span></label>
                  <input
                    className={`ck-input${errors.nomPrenom ? ' err' : ''}`}
                    placeholder="Ex: Ahmed Ben Ali"
                    value={form.nomPrenom}
                    onChange={handleChange('nomPrenom')}
                  />
                  {errors.nomPrenom && <span className="ck-err-msg">{errors.nomPrenom}</span>}
                </div>

                <div className="ck-field">
                  <label>Téléphone <span>*</span></label>
                  <input
                    className={`ck-input${errors.telephone ? ' err' : ''}`}
                    placeholder="Ex: 20 123 456"
                    value={form.telephone}
                    onChange={handleChange('telephone')}
                    type="tel"
                  />
                  {errors.telephone && <span className="ck-err-msg">{errors.telephone}</span>}
                </div>

                <div className="ck-field">
                  <label>Adresse <span>*</span></label>
                  <input
                    className={`ck-input${errors.adresse ? ' err' : ''}`}
                    placeholder="Ex: 12 Rue de la Paix, Tunis"
                    value={form.adresse}
                    onChange={handleChange('adresse')}
                  />
                  {errors.adresse && <span className="ck-err-msg">{errors.adresse}</span>}
                </div>

                <div className="ck-row">
                  <div className="ck-field">
                    <label>Ville</label>
                    <input
                      className="ck-input"
                      placeholder="Ex: Tunis"
                      value={form.ville}
                      onChange={handleChange('ville')}
                    />
                  </div>
                  <div className="ck-field">
                    <label>Code Postal</label>
                    <input
                      className="ck-input"
                      placeholder="Ex: 1000"
                      value={form.code_postal}
                      onChange={handleChange('code_postal')}
                    />
                  </div>
                </div>

                <div className="ck-field">
                  <label>E-mail (optionnel)</label>
                  <input
                    className="ck-input"
                    placeholder="Ex: exemple@email.com"
                    value={form.email}
                    onChange={handleChange('email')}
                    type="email"
                  />
                </div>

                <button type="submit" className="ck-submit" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <><div className="ck-spinner" /> Envoi en cours...</>
                  ) : (
                    'Confirmer la commande'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckoutModal;
