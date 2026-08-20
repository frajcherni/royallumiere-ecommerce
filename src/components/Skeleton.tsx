import React from 'react';

/* ═══════════════════════════════════════════════════════════════
   SKELETONS — placeholders that mirror the real layout so the page
   never jumps when the data arrives. All shimmer styling lives in
   GlobalStyles.css under the `.sk*` classes.
   ═══════════════════════════════════════════════════════════════ */

interface SkeletonProps {
  w?: string | number;
  h?: string | number;
  r?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

/** One shimmering block. */
export const Skeleton: React.FC<SkeletonProps> = ({ w = '100%', h = 16, r = 6, className = '', style }) => (
  <span
    className={`sk ${className}`}
    style={{ width: w, height: h, borderRadius: r, ...style }}
    aria-hidden="true"
  />
);

/** A few text lines, the last one shorter like real copy. */
export const SkeletonText: React.FC<{ lines?: number; w?: string }> = ({ lines = 3, w = '100%' }) => (
  <span className="sk-lines" style={{ width: w }} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} h={11} w={i === lines - 1 ? '62%' : '100%'} />
    ))}
  </span>
);

/** Matches the ProductCard footprint exactly. */
export const SkeletonProductCard: React.FC = () => (
  <div className="sk-card" aria-hidden="true">
    <Skeleton className="sk-card-img" h="auto" r={0} />
    <div className="sk-card-b">
      <Skeleton h={9} w="38%" />
      <Skeleton h={15} w="86%" />
      <Skeleton h={9} w="52%" />
      <div className="sk-card-ft">
        <Skeleton h={18} w="42%" />
        <div className="sk-card-btns">
          <Skeleton h={30} w={30} r={999} />
          <Skeleton h={30} w={30} r={999} />
        </div>
      </div>
    </div>
  </div>
);

/** A grid of product skeletons, same grid as `.pgrid`. */
export const SkeletonProductGrid: React.FC<{ count?: number; className?: string }> = ({
  count = 8,
  className = 'pgrid',
}) => (
  <div className={className} aria-busy="true" aria-label="Chargement des produits">
    {Array.from({ length: count }).map((_, i) => <SkeletonProductCard key={i} />)}
  </div>
);

/** Matches the round category tiles of the home strip. */
export const SkeletonCategoryStrip: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="sk-catstrip" aria-busy="true" aria-label="Chargement des catégories">
    {Array.from({ length: count }).map((_, i) => (
      <div className="sk-catcard" key={i}>
        <Skeleton className="sk-catcard-img" h="auto" r={0} />
        <div className="sk-catcard-b">
          <Skeleton h={13} w="70%" />
          <Skeleton h={9} w="45%" />
        </div>
      </div>
    ))}
  </div>
);

/** Matches the Shop filter sidebar. */
export const SkeletonSidebar: React.FC = () => (
  <div className="sk-side" aria-busy="true" aria-label="Chargement des filtres">
    <Skeleton h={10} w="45%" />
    <div className="sk-side-list">
      {Array.from({ length: 7 }).map((_, i) => (
        <div className="sk-side-row" key={i}>
          <Skeleton h={12} w={`${52 + ((i * 13) % 34)}%`} />
          <Skeleton h={10} w={22} />
        </div>
      ))}
    </div>
  </div>
);

/** Matches the big category cards on the browse page. */
export const SkeletonCategoryCards: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="cbz-grid" aria-busy="true" aria-label="Chargement des catégories">
    {Array.from({ length: count }).map((_, i) => (
      <div className="sk-cbz" key={i}>
        <Skeleton className="sk-cbz-img" h="auto" r={0} />
        <div className="sk-cbz-b">
          <Skeleton h={18} w="58%" />
          <Skeleton h={10} w="34%" />
          <div className="sk-cbz-chips">
            <Skeleton h={26} w={74} r={999} />
            <Skeleton h={26} w={92} r={999} />
            <Skeleton h={26} w={64} r={999} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/** Placeholder for a page hero band. */
export const SkeletonHero: React.FC<{ h?: number | string }> = ({ h = 320 }) => (
  <Skeleton className="sk-hero" h={h} r={0} />
);

export default Skeleton;
