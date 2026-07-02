import { useState, useEffect, useRef } from 'react';
import NextImage, { type ImageProps as NextImageProps } from 'next/image';
import { cn } from '@/lib/utils';

const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

interface LazyImageProps
  extends Omit<
    NextImageProps,
    'src' | 'alt' | 'fill' | 'width' | 'height' | 'onLoad' | 'onError'
  > {
  src: string;
  alt: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
}

export function LazyImage({
  src,
  alt,
  placeholderSrc,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  sizes,
  className = '',
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholderSrc || TRANSPARENT_PIXEL);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <span ref={containerRef} className="relative block h-full w-full">
      <NextImage
        {...props}
        src={imageSrc}
        alt={alt}
        fill
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError && 'bg-muted',
          className
        )}
      />
    </span>
  );
}

interface ProgressiveImageProps
  extends Omit<NextImageProps, 'src' | 'alt' | 'fill' | 'width' | 'height'> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  blur?: boolean;
  sizes?: string;
}

export function ProgressiveImage({
  src,
  alt,
  placeholderSrc,
  blur = true,
  sizes,
  className = '',
  ...props
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new window.Image();
    img.src = src;

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <span className="relative block h-full w-full">
      <NextImage
        {...props}
        src={currentSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={cn(
          'transition-all duration-300',
          isLoading && blur ? 'blur-sm scale-105' : 'blur-0 scale-100',
          className
        )}
      />
    </span>
  );
}

interface ResponsiveImageProps
  extends Omit<NextImageProps, 'src' | 'alt' | 'fill' | 'width' | 'height'> {
  src: string;
  alt: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

export function ResponsiveImage({
  src,
  alt,
  sizes,
  loading = 'lazy',
  className = '',
  ...props
}: ResponsiveImageProps) {
  return (
    <span className="relative block h-full w-full">
      <NextImage
        {...props}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={loading}
        className={className}
      />
    </span>
  );
}
