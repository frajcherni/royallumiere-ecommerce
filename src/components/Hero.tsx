import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { CarouselSlide } from '../api';

interface HeroProps {
  onNavigate: (id: string) => void;
  slides?: CarouselSlide[];
}

const DEFAULT_CONTENT = [
  {
    tag: 'New Collection · Spring 2025',
    title: <>Timeless<br /><strong>Elegance</strong><br />Redefined</>,
    sub: 'Curated for those who believe beauty lives in every detail. Discover the extraordinary.',
    btnLabel: 'Explore Collection',
    btnAction: 'shop',
    btnClass: 'btn-pr',
    fallbackBg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=85&fit=crop'
  },
  {
    tag: 'Flash Deal · 48 Hours Only',
    title: <>Up to<br /><strong>60% Off</strong><br />Best Sellers</>,
    sub: 'Our biggest sale of the year. Premium items at unmissable prices — limited stocks remain.',
    btnLabel: 'Shop the Sale',
    btnAction: 'offers',
    btnClass: 'btn-se',
    fallbackBg: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1800&q=85&fit=crop'
  },
  {
    tag: 'Premium Timepieces',
    title: <>Crafted for<br />Your<br /><strong>Lifestyle</strong></>,
    sub: "Handpicked from the world's finest ateliers. Quality you can feel, style that endures.",
    btnLabel: 'View Watches',
    btnAction: 'shop',
    btnClass: 'btn-pr',
    fallbackBg: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1800&q=85&fit=crop'
  }
];

const Hero: React.FC<HeroProps> = ({ onNavigate, slides = [] }) => {
  const [index, setIndex] = useState(0);

  // Map the dynamic slides to our curated content
  const activeSlides = slides.length > 0 
    ? slides.map((s, i) => ({
        bg: s.image,
        tag: s.title || DEFAULT_CONTENT[i % DEFAULT_CONTENT.length].tag,
        title: s.subtitle ? <strong>{s.subtitle}</strong> : DEFAULT_CONTENT[i % DEFAULT_CONTENT.length].title,
        sub: DEFAULT_CONTENT[i % DEFAULT_CONTENT.length].sub,
        btnLabel: DEFAULT_CONTENT[i % DEFAULT_CONTENT.length].btnLabel,
        btnAction: s.link || DEFAULT_CONTENT[i % DEFAULT_CONTENT.length].btnAction,
        btnClass: DEFAULT_CONTENT[i % DEFAULT_CONTENT.length].btnClass,
      }))
    : DEFAULT_CONTENT.map(c => ({
        ...c,
        bg: c.fallbackBg
      }));

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const next = () => setIndex((index + 1) % activeSlides.length);
  const prev = () => setIndex((index - 1 + activeSlides.length) % activeSlides.length);

  return (
    <section className="hero">
      <div 
        className="hsl-wrap" 
        style={{ 
          transform: `translateX(-${index * 100}%)`,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {activeSlides.map((slide, i) => (
          <div key={i} className={`hsl ${i === index ? 'active' : ''}`}>
            <div 
              className="hsl-bg" 
              style={{ 
                backgroundImage: `url(${slide.bg})`,
                transform: i === index ? 'scale(1.06)' : 'scale(1)',
                transition: i === index ? 'transform 8s linear' : 'none'
              }} 
            />
            <div className="hsl-cnt">
              <div className="htb">
                <div className="heyb"><span className="dot" /> {slide.tag}</div>
                <h1 className="htit">{slide.title}</h1>
                <p className="hsub">{slide.sub}</p>
                <div className="hbtns">
                  <button className={`btn ${slide.btnClass}`} onClick={() => onNavigate(slide.btnAction)}>
                    {slide.btnLabel} <ArrowRight size={15} className="arr" />
                  </button>
                  <button className="btn btn-ol-w" onClick={() => onNavigate('about')}>Our Story</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-prog">
        <motion.div 
          key={index}
          className="h-prog-fill" 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
        />
      </div>

      <div className="hdots">
        {activeSlides.map((_, i) => (
          <button 
            key={i} 
            className={`hdot ${i === index ? 'on' : ''}`} 
            onClick={() => setIndex(i)} 
          />
        ))}
      </div>

      <button className="harr l" onClick={prev}><ChevronLeft size={24} /></button>
      <button className="harr r" onClick={next}><ChevronRight size={24} /></button>

      <div className="scroll-q">
        <span>Scroll</span>
      </div>
    </section>
  );
};

export default Hero;
