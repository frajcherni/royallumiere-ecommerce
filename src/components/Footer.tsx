import React from 'react';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

interface FooterProps {
  onNavigate: (id: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer>
      <div className="ft-w">
        <div className="ft-top">
          <div className="ft-brand">
            <a className="logo" onClick={() => onNavigate('home')}>
              LUM<em>IÈ</em>RE<sup>®</sup>
            </a>
            <p>Redefining luxury through curated craftsmanship and timeless design. Join our journey to excellence.</p>
            <div className="socials">
              <a href="#" className="soc"><Instagram size={15} /></a>
              <a href="#" className="soc"><Twitter size={15} /></a>
              <a href="#" className="soc"><Linkedin size={15} /></a>
              <a href="#" className="soc"><Youtube size={15} /></a>
            </div>
          </div>

          <div className="ft-col">
            <h4>Quick Links</h4>
            <a onClick={() => onNavigate('home')}>Home</a>
            <a onClick={() => onNavigate('shop')}>Shop</a>
            <a onClick={() => onNavigate('offers')}>Special Offers</a>
            <a onClick={() => onNavigate('about')}>Our Story</a>
            <a onClick={() => onNavigate('contact')}>Contact Us</a>
          </div>

          <div className="ft-col">
            <h4>Collections</h4>
            <a onClick={() => onNavigate('shop')}>Footwear</a>
            <a onClick={() => onNavigate('shop')}>Bags & Totes</a>
            <a onClick={() => onNavigate('shop')}>Timepieces</a>
            <a onClick={() => onNavigate('shop')}>Fine Jewelry</a>
            <a onClick={() => onNavigate('shop')}>Beauty & Care</a>
          </div>

          <div className="ft-col">
            <h4>Customer Care</h4>
            <a href="#">Track Order</a>
            <a href="#">Shipping Policy</a>
            <a href="#">Returns & Refunds</a>
            <a href="#">Size Guide</a>
            <a href="#">FAQ / Help</a>
          </div>
        </div>

        <div className="ft-bot">
          <p>© 2025 LUMIÈRE Premium Store. All rights reserved.</p>
          <div className="ft-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
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
