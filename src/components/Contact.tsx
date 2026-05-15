import React from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Contact: React.FC = () => {
  useScrollReveal();
  
  return (
    <div className="page on">
      <div className="ct-hero">
        <div className="ct-ey">Get In Touch</div>
        <h1>We'd Love to <em>Hear</em><br />From You</h1>
        <p>Questions, collaborations, or just want to say hello — our team is always ready.</p>
      </div>

      <div className="ct-grid">
        <div className="ct-info">
          <h2>
            Let's Start a<br /><em>Conversation</em>
          </h2>
          <p>
            Whether you have a question about products, shipping, or anything else — our dedicated team is here to make your experience exceptional.
          </p>
          <div className="ct-its">
            <div className="ct-it rv">
              <div className="ct-ic"><Phone size={19} /></div>
              <div>
                <h4>Phone</h4>
                <p>+1 (800) 555-LUMIERE<br />Mon–Fri, 9am–6pm EST</p>
              </div>
            </div>
            <div className="ct-it rv d1">
              <div className="ct-ic"><Mail size={19} /></div>
              <div>
                <h4>Email</h4>
                <p>hello@lumiere.store<br />Reply within 2 business hours</p>
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
                <h4>Live Chat</h4>
                <p>Available 24/7 — avg. 3 min response</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ct-form rv">
          <h3>Send Us a Message</h3>
          <div className="frow">
            <div className="fg"><label>First Name</label><input type="text" placeholder="Élise" /></div>
            <div className="fg"><label>Last Name</label><input type="text" placeholder="Fontaine" /></div>
          </div>
          <div className="fg"><label>Email Address</label><input type="email" placeholder="hello@example.com" /></div>
          <div className="fg">
            <label>Subject</label>
            <select>
              <option>General Inquiry</option>
              <option>Order Support</option>
              <option>Returns & Refunds</option>
              <option>Partnerships</option>
              <option>Press</option>
            </select>
          </div>
          <div className="fg">
            <label>Message</label>
            <textarea placeholder="Tell us how we can help you today…"></textarea>
          </div>
          <button className="btn btn-pr" style={{ width: '100%', justifyContent: 'center', padding: '.95rem' }}>
            Send Message <Send size={16} style={{ marginLeft: 8 }} />
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
