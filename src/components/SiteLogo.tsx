import React from 'react';
import { getImageUrl } from '../api';
import { useCatalog } from '../context/CatalogContext';

interface SiteLogoProps {
  /** Wrapper class, so each surface keeps its own typography. */
  className?: string;
  /** Overrides the height configured in the ERP (footer/splash are sized differently). */
  height?: number;
  onClick?: () => void;
}

/**
 * The brand mark chosen by the shop owner in the ERP (Site Web → Gestion Logo).
 *
 * Renders the uploaded image when there is one, otherwise the text wordmark —
 * so the site never shows a broken image while the settings are still loading
 * or when no logo has been picked yet.
 */
const SiteLogo: React.FC<SiteLogoProps> = ({ className, height, onClick }) => {
  const { settings } = useCatalog();
  const { logo, brand_name, show_name, logo_height } = settings;

  // A trailing ®/™/© is rendered as a superscript, matching the original mark.
  const match = /^(.*?)([®™©])$/.exec((brand_name || '').trim());
  const nameText = match ? match[1].trim() : (brand_name || '').trim();
  const nameSymbol = match ? match[2] : null;

  const showWordmark = !logo || show_name;

  return (
    <a className={className} onClick={onClick}>
      {logo && (
        <img
          className="site-logo-img"
          src={getImageUrl(logo)}
          alt={nameText || 'Logo'}
          style={{ height: height ?? logo_height ?? 34 }}
        />
      )}
      {showWordmark && (
        <span className="site-logo-name">
          {nameText}
          {nameSymbol && <sup>{nameSymbol}</sup>}
        </span>
      )}
    </a>
  );
};

export default SiteLogo;
