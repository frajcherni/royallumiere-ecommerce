import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Tag, ArrowRight, ArrowLeft, Search } from 'lucide-react';

interface Category {
    id: string | number;
    nom: string;
    image: string;
}

interface CategoryStripProps {
    categories: Category[];
    onNavigate: (page: string, params?: { category?: string }) => void;
    getImageUrl: (image: string) => string;
}

const CARD_W = 188;
const GAP = 20;

export default function CategoryStrip({ categories, onNavigate, getImageUrl }: CategoryStripProps) {
    const stripRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const animFrameRef = useRef<number>(0);
    const posRef = useRef(0);
    const pausedRef = useRef(false);
    const lastTimeRef = useRef<number>(0);

    const [needsScroll, setNeedsScroll] = useState(false);
    const [reps, setReps] = useState(2);
    const [showArrows, setShowArrows] = useState(false);

    const allCats: Category[] = [
        { id: 'all', nom: 'All Items', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&q=80&fit=crop' },
        ...categories,
    ];

    const singleSetW = allCats.length * (CARD_W + GAP);
    const PX_PER_SEC = 45;

    const measure = useCallback(() => {
        if (!wrapRef.current) return;
        const viewW = wrapRef.current.clientWidth;
        const scrollNeeded = singleSetW > viewW;
        setNeedsScroll(scrollNeeded);
        if (scrollNeeded) {
            const needed = Math.ceil((viewW * 3) / singleSetW) + 1;
            setReps(Math.max(needed, 2));
        }
    }, [singleSetW]);

    useEffect(() => {
        measure();
        const ro = new ResizeObserver(measure);
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [measure]);

    // RAF-based animation loop — smooth infinite scroll
    useEffect(() => {
        if (!needsScroll || !stripRef.current) return;
        posRef.current = 0;
        lastTimeRef.current = 0;

        const tick = (now: number) => {
            if (!pausedRef.current) {
                if (lastTimeRef.current) {
                    const delta = (now - lastTimeRef.current) / 1000;
                    posRef.current += PX_PER_SEC * delta;
                    if (posRef.current >= singleSetW) posRef.current -= singleSetW;
                }
                lastTimeRef.current = now;
                if (stripRef.current) {
                    stripRef.current.style.transform = `translateX(-${posRef.current}px)`;
                }
            } else {
                lastTimeRef.current = 0;
            }
            animFrameRef.current = requestAnimationFrame(tick);
        };

        animFrameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [needsScroll, singleSetW]);

    const pause = () => { pausedRef.current = true; };
    const resume = () => { pausedRef.current = false; };

    const scrollBy = (dir: 'left' | 'right') => {
        pause();
        const step = (CARD_W + GAP) * 2;
        posRef.current = dir === 'right'
            ? (posRef.current + step) % singleSetW
            : (posRef.current - step + singleSetW) % singleSetW;
        if (stripRef.current) {
            stripRef.current.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1)';
            stripRef.current.style.transform = `translateX(-${posRef.current}px)`;
            setTimeout(() => {
                if (stripRef.current) stripRef.current.style.transition = '';
                resume();
            }, 420);
        }
    };

    const renderedCats = needsScroll
        ? Array.from({ length: reps }, () => allCats).flat()
        : allCats;

    return (
        <section id="pg-cat" className="cat-section">
            <div className="cat-section-head rv">
                <div className="flex-between">
                    <div>
                        <div className="stag"><Tag size={11} /> Browse</div>
                        <h2 className="stit">Shop by <em>Category</em></h2>
                        <p className="ssub" style={{ marginTop: '.5rem' }}>
                            Tap any category to discover curated collections.
                        </p>
                    </div>
                    <button className="btn btn-ol" onClick={() => onNavigate('shop')}>
                        View All Categories <ArrowRight size={15} style={{ marginLeft: 8 }} />
                    </button>
                </div>
            </div>

            <div
                className={`cat-strip-outer${showArrows ? ' arrows-visible' : ''}`}
                onMouseEnter={() => setShowArrows(true)}
                onMouseLeave={() => { setShowArrows(false); resume(); }}
            >
                {needsScroll && (
                    <button
                        className="cat-arrow left"
                        onMouseEnter={pause}
                        onMouseLeave={resume}
                        onClick={() => scrollBy('left')}
                        aria-label="Scroll left"
                    >
                        <ArrowLeft size={16} />
                    </button>
                )}

                <div
                    ref={wrapRef}
                    className={`cat-strip-wrap${needsScroll ? '' : ' no-scroll'}`}
                >
                    <div
                        ref={stripRef}
                        className={`cat-strip${needsScroll ? '' : ' centered'}`}
                        onMouseEnter={needsScroll ? pause : undefined}
                        onMouseLeave={needsScroll ? resume : undefined}
                    >
                        {renderedCats.map((cat, i) => (
                            <div
                                key={`${cat.id}-${i}`}
                                className="cat-card"
                                onClick={() => onNavigate('shop', { category: cat.id })}
                            >
                                <div className="cc-img">
                                    <img
                                        src={cat.id === 'all' ? cat.image : getImageUrl(cat.image)}
                                        alt={cat.nom}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="cc-body">
                                    <div className="cc-nm">{cat.nom}</div>
                                    <div className="cc-cnt">
                                        <Search size={10} />
                                        Explore
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {needsScroll && (
                    <button
                        className="cat-arrow right"
                        onMouseEnter={pause}
                        onMouseLeave={resume}
                        onClick={() => scrollBy('right')}
                        aria-label="Scroll right"
                    >
                        <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </section>
    );
}