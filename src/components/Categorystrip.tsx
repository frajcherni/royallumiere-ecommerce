import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Tag, ArrowRight, ArrowLeft, LayoutGrid } from 'lucide-react';
import { CategoryNode } from '../api';
import SmartImage from './SmartImage';
import { SkeletonCategoryStrip } from './Skeleton';

interface CategoryStripProps {
    /** Root categories, each carrying its sub-categories in `children`. */
    categories: CategoryNode[];
    loading?: boolean;
    onNavigate: (page: string, params?: { category?: string | number }) => void;
    getImageUrl: (image: string) => string;
    /** Product count for a category, sub-categories included. */
    countInCategory?: (id: string | number) => number;
}

const CARD_W = 200;
const GAP = 20;
const ALL_IMG = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80&fit=crop';

export default function CategoryStrip({
    categories, loading = false, onNavigate, getImageUrl, countInCategory,
}: CategoryStripProps) {
    const stripRef = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const animFrameRef = useRef<number>(0);
    const posRef = useRef(0);
    const pausedRef = useRef(false);
    const lastTimeRef = useRef<number>(0);

    const [needsScroll, setNeedsScroll] = useState(false);
    const [reps, setReps] = useState(2);
    const [showArrows, setShowArrows] = useState(false);
    /** Which card is showing its sub-category flyout. */
    const [peek, setPeek] = useState<string | null>(null);

    const allCats = [
        { id: 'all' as const, nom: 'Tout le catalogue', image: ALL_IMG, children: [] as CategoryNode[] },
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

    const head = (
        <div className="cat-section-head rv">
            <div className="flex-between">
                <div>
                    <div className="stag"><Tag size={11} /> Parcourir</div>
                    <h2 className="stit">Acheter par <em>Catégorie</em></h2>
                    <p className="ssub" style={{ marginTop: '.5rem' }}>
                        Choisissez un rayon pour découvrir ses collections et sous-catégories.
                    </p>
                </div>
                <button className="btn btn-ol" onClick={() => onNavigate('categories')}>
                    Toutes les catégories <ArrowRight size={15} style={{ marginLeft: 8 }} />
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <section id="pg-cat" className="cat-section">
                {head}
                <SkeletonCategoryStrip count={7} />
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section id="pg-cat" className="cat-section">
            {head}

            <div
                className={`cat-strip-outer${showArrows ? ' arrows-visible' : ''}`}
                onMouseEnter={() => setShowArrows(true)}
                onMouseLeave={() => { setShowArrows(false); setPeek(null); resume(); }}
            >
                {needsScroll && (
                    <button
                        className="cat-arrow left"
                        onMouseEnter={pause}
                        onMouseLeave={resume}
                        onClick={() => scrollBy('left')}
                        aria-label="Défiler à gauche"
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
                        {renderedCats.map((cat, i) => {
                            const key = `${cat.id}-${i}`;
                            const subs = 'children' in cat ? cat.children : [];
                            const count = cat.id === 'all'
                                ? countInCategory?.('all')
                                : countInCategory?.(cat.id);

                            return (
                                <div
                                    key={key}
                                    className={`cat-card${peek === key ? ' peeking' : ''}`}
                                    onMouseEnter={() => setPeek(subs.length > 0 ? key : null)}
                                    onClick={() => onNavigate('shop', { category: cat.id })}
                                >
                                    <div className="cc-img">
                                        <SmartImage
                                            src={cat.id === 'all' ? cat.image : getImageUrl(cat.image)}
                                            alt={cat.nom}
                                            ratio="1 / 1"
                                        />
                                    </div>
                                    <div className="cc-body">
                                        <div className="cc-nm">{cat.nom}</div>
                                        <div className="cc-cnt">
                                            <LayoutGrid size={10} />
                                            {subs.length > 0
                                                ? `${subs.length} sous-cat.`
                                                : count != null ? `${count} produits` : 'Explorer'}
                                        </div>
                                    </div>

                                    {/* Sub-category flyout — lets a shopper jump straight to a
                                        sub-category without loading the parent first. */}
                                    {subs.length > 0 && (
                                        <div className="cc-subs">
                                            {subs.slice(0, 5).map(sub => (
                                                <button
                                                    key={sub.id}
                                                    className="cc-sub"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onNavigate('shop', { category: sub.id });
                                                    }}
                                                >
                                                    {sub.nom}
                                                </button>
                                            ))}
                                            {subs.length > 5 && (
                                                <button
                                                    className="cc-sub cc-sub-more"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onNavigate('shop', { category: cat.id });
                                                    }}
                                                >
                                                    +{subs.length - 5} de plus
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {needsScroll && (
                    <button
                        className="cat-arrow right"
                        onMouseEnter={pause}
                        onMouseLeave={resume}
                        onClick={() => scrollBy('right')}
                        aria-label="Défiler à droite"
                    >
                        <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </section>
    );
}
