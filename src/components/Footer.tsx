import React from 'react';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import SiteLogo from './SiteLogo';

interface FooterProps {
  onNavigate: (id: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer>
      <div className="ft-w">
        <div className="ft-top">
          <div className="ft-brand">
            <SiteLogo className="logo" height={40} onClick={() => onNavigate('home')} />
            <p>Redéfinir le luxe par un savoir-faire choisi avec soin et un design intemporel. Rejoignez notre quête de l'excellence.</p>
            <div className="socials">
              <a href="#" className="soc" aria-label="Instagram"><Instagram size={15} /></a>
              <a href="#" className="soc" aria-label="Twitter"><Twitter size={15} /></a>
              <a href="#" className="soc" aria-label="LinkedIn"><Linkedin size={15} /></a>
              <a href="#" className="soc" aria-label="YouTube"><Youtube size={15} /></a>
            </div>
          </div>

          <div className="ft-col">
            <h4>Liens rapides</h4>
            <a onClick={() => onNavigate('home')}>Accueil</a>
            <a onClick={() => onNavigate('shop')}>Boutique</a>
            <a onClick={() => onNavigate('offers')}>Offres spéciales</a>
            <a onClick={() => onNavigate('about')}>Notre histoire</a>
            <a onClick={() => onNavigate('contact')}>Nous contacter</a>
          </div>

          <div className="ft-col">
            <h4>Collections</h4>
            <a onClick={() => onNavigate('shop')}>Chaussures</a>
            <a onClick={() => onNavigate('shop')}>Sacs et cabas</a>
            <a onClick={() => onNavigate('shop')}>Montres</a>
            <a onClick={() => onNavigate('shop')}>Bijoux fins</a>
            <a onClick={() => onNavigate('shop')}>Beauté et soins</a>
          </div>

          <div className="ft-col">
            <h4>Service client</h4>
            <a href="#">Suivre ma commande</a>
            <a href="#">Politique de livraison</a>
            <a href="#">Retours et remboursements</a>
            <a href="#">Guide des tailles</a>
            <a href="#">FAQ / Aide</a>
          </div>
        </div>

        <div className="ft-bot">
          <p>© 2025 LUMIÈRE Premium Store. Tous droits réservés.</p>
          <div className="ft-links">
            <a href="#">Politique de confidentialité</a>
            <a href="#">Conditions d'utilisation</a>
            <a href="#">Cookies</a>
          </div>
          <div className="ft-pays">
            <span className="pay">Visa</span>
            <span className="pay">Mastercard</span>
            <span className="pay">Amex</span>
            <span className="pay">PayPal</span>
            <span className="pay">Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
