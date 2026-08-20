import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { CarouselSlide, getImageUrl } from '../api';

interface HeroProps {
  onNavigate: (id: string) => void;
  slides?: CarouselSlide[];
  loading?: boolean;
}

const Hero: React.FC<HeroProps> = ({ onNavigate, slides = [], loading = false }) => {
  const [index, setIndex] = useState(0);

  const activeSlides = slides.map(s => ({
    bg:               getImageUrl(s.image),
    tag:              s.title             || '',
    subtitle:         s.subtitle          || '',
    description:      s.description       || '',
    tagColor:         s.tag_color         || '',
    titleColor:       s.title_color       || '',
    descriptionColor: s.description_color || '',
    btn1Label:        s.btn_label         || '',
    btn1Action:       s.link              || '',
    btn1BgColor:      s.btn_color         || '',
    btn1TextColor:    s.btn1_text_color   || '',
    btn2Label:        s.btn2_label        || '',
    btn2Action:       s.btn2_link         || '',
    btn2BgColor:      s.btn2_color        || '',
    btn2TextColor:    s.btn2_text_color   || '',
    showText:         s.show_text         !== false,
    showBtn1:         s.show_btn1         !== false,
    showBtn2:         s.show_btn2         !== false,
  }));

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const next = () => setIndex((index + 1) % activeSlides.length);
  const prev = () => setIndex((index - 1 + activeSlides.length) % activeSlides.length);

  // Shimmering stand-in keeps the fold from being a blank band while the
  // carousel slides are still in flight.
  if (loading && activeSlides.length === 0) {
    return (
      <section className="hero hero-sk" aria-busy="true" aria-label="Chargement">
        <div className="hero-sk-in">
          <span className="sk" style={{ width: 120, height: 12, borderRadius: 999 }} />
          <span className="sk" style={{ width: 'min(560px, 74vw)', height: 46, borderRadius: 10 }} />
          <span className="sk" style={{ width: 'min(420px, 62vw)', height: 46, borderRadius: 10 }} />
          <span className="sk" style={{ width: 'min(340px, 54vw)', height: 14, borderRadius: 6 }} />
          <span className="sk" style={{ width: 170, height: 44, borderRadius: 999, marginTop: '.75rem' }} />
        </div>
      </section>
    );
  }

  if (activeSlides.length === 0) return <section className="hero" />;

  return (
    <section className="hero">
      <div
        className="hsl-wrap"
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {activeSlides.map((slide, i) => (
          <div key={i} className={`hsl ${i === index ? 'active' : ''}`}>
            <div
              className="hsl-bg"
              style={{
                backgroundImage: `url(${slide.bg})`,
                transform: i === index ? 'scale(1.06)' : 'scale(1)',
                transition: i === index ? 'transform 8s linear' : 'none',
              }}
            />
            <div className="hsl-cnt">
              <div className="htb">

                {slide.showText && (
                  <>
                    {slide.tag && (
                      <div className="heyb" style={slide.tagColor ? { color: slide.tagColor } : undefined}>
                        <span className="dot" />
                        {slide.tag}
                      </div>
                    )}
                    {slide.subtitle && (
                      <h1 className="htit">
                        <strong style={slide.titleColor ? { color: slide.titleColor } : undefined}>
                          {slide.subtitle}
                        </strong>
                      </h1>
                    )}
                    {slide.description && (
                      <p className="hsub" style={slide.descriptionColor ? { color: slide.descriptionColor } : undefined}>
                        {slide.description}
                      </p>
                    )}
                  </>
                )}

                {(slide.showBtn1 || slide.showBtn2) && (
                  <div className="hbtns">
                    {slide.showBtn1 && (
                      <button
                        className={`btn${slide.btn1BgColor ? '' : ' btn-pr'}`}
                        style={slide.btn1BgColor ? {
                          background:  slide.btn1BgColor,
                          color:       slide.btn1TextColor || undefined,
                          boxShadow:   `0 4px 18px ${slide.btn1BgColor}55`,
                        } : slide.btn1TextColor ? { color: slide.btn1TextColor } : undefined}
                        onClick={() => onNavigate(slide.btn1Action)}
                      >
                        {slide.btn1Label} <ArrowRight size={15} className="arr" />
                      </button>
                    )}
                    {slide.showBtn2 && (
                      <button
                        className={`btn${slide.btn2BgColor ? '' : ' btn-ol-w'}`}
                        style={slide.btn2BgColor ? {
                          background: slide.btn2BgColor,
                          color:      slide.btn2TextColor || undefined,
                          boxShadow:  `0 4px 18px ${slide.btn2BgColor}55`,
                        } : slide.btn2TextColor ? { color: slide.btn2TextColor } : undefined}
                        onClick={() => onNavigate(slide.btn2Action)}
                      >
                        {slide.btn2Label}
                      </button>
                    )}
                  </div>
                )}

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
          <button key={i} className={`hdot ${i === index ? 'on' : ''}`}
            onClick={() => setIndex(i)} />
        ))}
      </div>

      <button className="harr l" onClick={prev}><ChevronLeft size={24} /></button>
      <button className="harr r" onClick={next}><ChevronRight size={24} /></button>

      <div className="scroll-q"><span>Défiler</span></div>
    </section>
  );
};

export default Hero;
