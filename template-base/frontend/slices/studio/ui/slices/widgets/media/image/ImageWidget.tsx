import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Domains whitelisted in next.config.mjs remotePatterns — these use optimized Next Image
const OPTIMIZED_DOMAINS = [
  'images.unsplash.com',
  'plus.unsplash.com',
  'source.unsplash.com',
  'picsum.photos',
];

function isOptimizedDomain(src: string): boolean {
  try {
    const { hostname } = new URL(src);
    return OPTIMIZED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

interface ImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
  objectFit?: string;
  [key: string]: any;
}

export const ImageWidget: React.FC<ImageProps> = ({
  src = 'https://picsum.photos/640/420',
  alt = 'placeholder',
  width = '640',
  height = '420',
  rounded = true,
  className = 'w-full h-auto',
  objectFit = 'cover',
  ...rest
}) => {
  const numericWidth = Number(width) || 640;
  const numericHeight = Number(height) || 420;
  const imgClass = cn(className, rounded && 'rounded-2xl', `object-${objectFit}`);
  const isExternal = src.startsWith('http://') || src.startsWith('https://');

  if (!isExternal) {
    // Relative or data URLs — native img, no Next.js Image optimization needed
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} src={src} alt={alt} width={numericWidth} height={numericHeight} className={imgClass} />;
  }

  // Whitelisted domains use full Next.js image optimization; others are unoptimized to avoid 400 errors
  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      width={numericWidth}
      height={numericHeight}
      unoptimized={!isOptimizedDomain(src)}
      className={imgClass}
    />
  );
};
