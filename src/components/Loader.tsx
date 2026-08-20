import React from 'react';

interface LoaderProps {
  /** Optional line shown under the spinner. */
  label?: string;
  size?: number;
  /** Fills the available height and centres itself — good for whole panels. */
  block?: boolean;
}

/** Branded inline spinner, for spots too small to warrant a skeleton. */
const Loader: React.FC<LoaderProps> = ({ label, size = 34, block = false }) => (
  <div className={`lspin-wrap${block ? ' block' : ''}`} role="status" aria-live="polite">
    <span
      className="lspin"
      style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 12)) }}
    />
    {label && <span className="lspin-label">{label}</span>}
    <span className="sr-only">{label || 'Chargement…'}</span>
  </div>
);

export default Loader;
