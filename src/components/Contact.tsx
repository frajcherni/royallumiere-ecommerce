import React from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Contact: React.FC = () => {
  useScrollReveal();

  return (
    <div className="page on">
      <div className="ct-hero">
        <div className="ct-ey">Nous contacter</div>
        <h1>Nous serions ravis de<br /><em>vous</em> lire</h1>
        <p>Questions, collaborations, ou simplement envie de dire bonjour — notre équipe est toujours disponible.</p>
      </div>

      <div className="ct-grid">
        <div className="ct-info">
          <h2>
            Démarrons la<br /><em>conversation</em>
          </h2>
          <p>
            Que votre question porte sur un produit, une livraison ou tout autre sujet — notre équipe dédiée est là pour rendre votre expérience exceptionnelle.
          </p>
          <div className="ct-its">
            <div className="ct-it rv">
              <div className="ct-ic"><Phone size={19} /></div>
              <div>
                <h4>Téléphone</h4>
                <p>+216 20 123 456<br />Lun–Ven, 9h–18h</p>
              </div>
            </div>
            <div className="ct-it rv d1">
              <div className="ct-ic"><Mail size={19} /></div>
              <div>
                <h4>E-mail</h4>
                <p>contact@royallumiere.tn<br />Réponse sous 2 heures ouvrées</p>
              </div>
            </div>
            <div className="ct-it rv d2">
              <div className="ct-ic"><MapPin size={19} /></div>
              <div>
                <h4>Showroom</h4>
                <p>15 Rue du Faubourg Saint-Honoré<br />Paris, France 75008</p>
              </div>
            </div>
            <div className="ct-it rv d3">
              <div className="ct-ic"><MessageSquare size={19} /></div>
              <div>
                <h4>Chat en direct</h4>
                <p>Disponible 24h/24 et 7j/7 — réponse en 3 min en moyenne</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ct-form rv">
          <h3>Envoyez-nous un message</h3>
          <div className="frow">
            <div className="fg"><label>Prénom</label><input type="text" placeholder="Élise" /></div>
            <div className="fg"><label>Nom</label><input type="text" placeholder="Fontaine" /></div>
          </div>
          <div className="fg"><label>Adresse e-mail</label><input type="email" placeholder="exemple@email.com" /></div>
          <div className="fg">
            <label>Sujet</label>
            <select>
              <option>Demande générale</option>
              <option>Suivi de commande</option>
              <option>Retours et remboursements</option>
              <option>Partenariats</option>
              <option>Presse</option>
            </select>
          </div>
          <div className="fg">
            <label>Message</label>
            <textarea placeholder="Dites-nous comment nous pouvons vous aider…"></textarea>
          </div>
          <button className="btn btn-pr" style={{ width: '100%', justifyContent: 'center', padding: '.95rem' }}>
            Envoyer le message <Send size={16} style={{ marginLeft: 8 }} />
          </button>
        </div>
      </div>

      <div className="mx rv" style={{ paddingBottom: '4rem' }}>
        <div style={{ background: 'var(--ow)', borderRadius: 'var(--rx)', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '.85rem', border: '1px solid var(--g2)' }}>
          <MapPin size={36} style={{ stroke: 'var(--pr)', fill: 'none', strokeWidth: 1.5 }} />
          <span style={{ fontSize: '.88rem', color: 'var(--g3)', fontWeight: 300 }}>15 Rue du Faubourg Saint-Honoré, Paris, France</span>
        </div>
      </div>
    </div>
  );
};

export default Contact;
