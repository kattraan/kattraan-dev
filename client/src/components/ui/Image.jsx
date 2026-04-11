import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Reusable image with lazy loading and optional placeholder.
 * Use for below-the-fold or non-critical images to improve performance.
 */
function Image({
  src,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
  placeholderClassName,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <span className={twMerge('relative block overflow-hidden', placeholderClassName)}>
      {!loaded && !error && (
        <span
          className="absolute inset-0 bg-white/5 animate-pulse"
          aria-hidden
        />
      )}
      <img
        src={src}
        alt={alt ?? ''}
        loading={loading}
        decoding={decoding}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={twMerge(
          'max-w-full h-auto',
          !loaded && !error && 'opacity-0',
          loaded && 'opacity-100 transition-opacity duration-300',
          error && 'opacity-50',
          className
        )}
        {...props}
      />
    </span>
  );
}

export default Image;
