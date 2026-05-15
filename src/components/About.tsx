import React from 'react';
import { Heart, Leaf, Gem, Users, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface AboutProps {
  onNavigate: (id: string) => void;
}

const About: React.FC<AboutProps> = ({ onNavigate }) => {
  useScrollReveal();
  
  return (
    <div className="page on">
      <div className="ab-hero">
        <div className="ab-hero-b">
          <div className="ab-tag">Est. 2015</div>
          <h1 className="ab-tit">We Believe in Beauty<br />That <em>Lasts</em></h1>
        </div>
      </div>

      <div className="ab-stats">
        {[
          { n: '12K+', l: 'Happy Customers' },
          { n: '500+', l: 'Curated Products' },
          { n: '48', l: 'Countries Shipped' },
          { n: '4.9★', l: 'Average Rating' }
        ].map((s, i) => (
          <div key={i} className={`ab-st rv d${i}`}>
            <div className="ab-sn">{s.n}</div>
            <div className="ab-sl">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="ab-story">
        <div className="ab-si rv">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&fit=crop" alt="Store" loading="lazy" />
        </div>
        <div>
          <div className="stag"><Heart size={11} /> Our Philosophy</div>
          <h2 className="stit" style={{ textAlign: 'left' }}>Crafted with <em>Intention</em></h2>
          <p style={{ color: 'var(--g4)', marginTop: '.9rem', lineHeight: 1.88, fontSize: '.9rem', fontWeight: 300 }}>
            At LUMIÈRE, we don't just curate products — we curate experiences. Every item is handpicked through a rigorous process considering quality, sustainability, and timeless aesthetic appeal.
          </p>
          <div className="ab-vals">
            <div className="ab-v rv">
              <div className="ab-vi"><Leaf size={19} /></div>
              <div>
                <h4>Sustainability First</h4>
                <p>We partner exclusively with brands that share our commitment to ethical sourcing and environmental responsibility.</p>
              </div>
            </div>
            <div className="ab-v rv d1">
              <div className="ab-vi"><Gem size={19} /></div>
              <div>
                <h4>Uncompromising Quality</h4>
                <p>Every product undergoes our 27-point quality check before it ever reaches your door.</p>
              </div>
            </div>
            <div className="ab-v rv d2">
              <div className="ab-vi"><Users size={19} /></div>
              <div>
                <h4>Customer-First Always</h4>
                <p>Your satisfaction is our obsession. We're not happy until you are — guaranteed, no exceptions.</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '2.2rem' }}>
            <button className="btn btn-pr" onClick={() => onNavigate('shop')}>
              Discover Our Collection <ArrowRight size={15} className="arr" />
            </button>
          </div>
        </div>
      </div>

      <div className="team-sec">
        <div className="mx shd c">
          <div className="stag">The People</div>
          <h2 className="stit">Meet Our <em>Team</em></h2>
        </div>
        <div className="tgd mx">
          {[
            { n: 'Élise Fontaine', r: 'CEO & Founder', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&fit=crop&crop=face' },
            { n: 'Marco Vitale', r: 'Creative Director', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face' },
            { n: 'Yuki Tanaka', r: 'Head of Curation', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&fit=crop&crop=face' },
            { n: 'Omar Hassan', r: 'Operations Lead', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&fit=crop&crop=face' }
          ].map((m, i) => (
            <div key={i} className={`tmc rv d${i}`}>
              <div className="tmp"><img src={m.img} alt={m.n} loading="lazy" /></div>
              <div className="tmi">
                <div className="tmn">{m.n}</div>
                <div className="tmr">{m.r}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
