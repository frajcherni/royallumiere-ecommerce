import React, { useState } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Aspect ratio for the placeholder box, e.g. "1 / 1" or "4 / 5". */
  ratio?: string;
  wrapperClassName?: string;
}

/**
 * Image that reserves its space and shimmers until the file has decoded,
 * so grids never reflow and no broken-image icon is ever shown.
 */
const SmartImage: React.FC<SmartImageProps> = ({
  src, alt, ratio, wrapperClassName = '', className = '', style, ...rest
}) => {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  return (
    <span
      className={`simg ${wrapperClassName} ${state === 'loading' ? 'simg-loading' : ''}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`${className} simg-el ${state === 'ready' ? 'is-ready' : ''}`}
        style={style}
        onLoad={() => setState('ready')}
        onError={() => setState('error')}
        {...rest}
      />
      {state === 'error' && <span className="simg-fallback" aria-hidden="true" />}
    </span>
  );
};

export default SmartImage;
