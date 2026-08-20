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
          <div className="ab-tag">Depuis 2015</div>
          <h1 className="ab-tit">Nous croyons en une beauté<br />qui <em>dure</em></h1>
        </div>
      </div>

      <div className="ab-stats">
        {[
          { n: '12K+', l: 'Clients satisfaits' },
          { n: '500+', l: 'Produits sélectionnés' },
          { n: '48', l: 'Pays livrés' },
          { n: '4.9★', l: 'Note moyenne' }
        ].map((s, i) => (
          <div key={i} className={`ab-st rv d${i}`}>
            <div className="ab-sn">{s.n}</div>
            <div className="ab-sl">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="ab-story">
        <div className="ab-si rv">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&fit=crop" alt="Boutique" loading="lazy" />
        </div>
        <div>
          <div className="stag"><Heart size={11} /> Notre philosophie</div>
          <h2 className="stit" style={{ textAlign: 'left' }}>Conçu avec <em>intention</em></h2>
          <p style={{ color: 'var(--g4)', marginTop: '.9rem', lineHeight: 1.88, fontSize: '.9rem', fontWeight: 300 }}>
            Chez LUMIÈRE, nous ne sélectionnons pas seulement des produits — nous créons des expériences. Chaque article est choisi à la main selon un processus rigoureux qui prend en compte la qualité, la durabilité et une esthétique intemporelle.
          </p>
          <div className="ab-vals">
            <div className="ab-v rv">
              <div className="ab-vi"><Leaf size={19} /></div>
              <div>
                <h4>La durabilité avant tout</h4>
                <p>Nous travaillons exclusivement avec des marques qui partagent notre engagement pour un approvisionnement éthique et responsable.</p>
              </div>
            </div>
            <div className="ab-v rv d1">
              <div className="ab-vi"><Gem size={19} /></div>
              <div>
                <h4>Une qualité sans compromis</h4>
                <p>Chaque produit passe notre contrôle qualité en 27 points avant d'arriver chez vous.</p>
              </div>
            </div>
            <div className="ab-v rv d2">
              <div className="ab-vi"><Users size={19} /></div>
              <div>
                <h4>Le client d'abord, toujours</h4>
                <p>Votre satisfaction est notre obsession. Nous ne sommes satisfaits que lorsque vous l'êtes — garanti, sans exception.</p>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '2.2rem' }}>
            <button className="btn btn-pr" onClick={() => onNavigate('shop')}>
              Découvrir notre collection <ArrowRight size={15} className="arr" />
            </button>
          </div>
        </div>
      </div>

      <div className="team-sec">
        <div className="mx shd c">
          <div className="stag">Les personnes</div>
          <h2 className="stit">Notre <em>équipe</em></h2>
        </div>
        <div className="tgd mx">
          {[
            { n: 'Élise Fontaine', r: 'Directrice générale & fondatrice', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&fit=crop&crop=face' },
            { n: 'Marco Vitale', r: 'Directeur artistique', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face' },
            { n: 'Yuki Tanaka', r: 'Responsable de la sélection', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&fit=crop&crop=face' },
            { n: 'Omar Hassan', r: 'Responsable des opérations', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&fit=crop&crop=face' }
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
