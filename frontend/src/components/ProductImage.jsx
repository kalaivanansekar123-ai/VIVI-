import React, { useEffect, useMemo, useState } from 'react';

const FALLBACK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" role="img" aria-label="No image available">
  <rect width="500" height="500" fill="#eef2f7"/>
  <g fill="none" stroke="#c3ccdb" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
    <rect x="165" y="200" width="170" height="130" rx="16"/>
    <path d="M188 200l14-34h96l14 34"/>
    <circle cx="250" cy="262" r="26"/>
  </g>
  <text x="250" y="385" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#94a3b8" text-anchor="middle">No Image</text>
</svg>`;

export const FALLBACK_IMG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(FALLBACK_SVG.trim())}`;

const DEAD_HOST = /(picsum\.photos|loremflickr\.com|via\.placeholder\.com|placehold\.it|placeimg\.com|unsplash\.com)/i;

function resolveSrc(raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return FALLBACK_IMG;
  if (DEAD_HOST.test(value)) return FALLBACK_IMG;
  return value;
}

const ProductImage = ({
  src,
  alt = 'Product',
  className = '',
  imgClassName = '',
  showSpinner = true,
}) => {
  const resolved = useMemo(() => resolveSrc(src), [src]);
  const [current, setCurrent] = useState(resolved);
  const [status, setStatus] = useState(resolved === FALLBACK_IMG ? 'loaded' : 'loading');

  useEffect(() => {
    setCurrent(resolved);
    setStatus(resolved === FALLBACK_IMG ? 'loaded' : 'loading');
  }, [resolved]);

  const handleError = () => {
    if (current !== FALLBACK_IMG) {
      setStatus('loading');
      setCurrent(FALLBACK_IMG);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <img
        src={current}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus('loaded')}
        onError={handleError}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
      />
      {status === 'loading' && showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ProductImage;