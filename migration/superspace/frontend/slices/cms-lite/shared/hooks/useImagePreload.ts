import { useEffect, useState } from 'react';

export function useImagePreload(src: string): boolean {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsLoaded(false);
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return isLoaded;
}

export function useMultipleImagePreload(sources: string[]): boolean {
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (sources.length === 0) return;

    let mounted = true;
    let loaded = 0;

    sources.forEach((src) => {
      const img = new Image();
      
      img.onload = () => {
        if (mounted) {
          loaded++;
          setLoadedCount(loaded);
        }
      };
      
      img.onerror = () => {
        if (mounted) {
          loaded++;
          setLoadedCount(loaded);
        }
      };
      
      img.src = src;
    });

    return () => {
      mounted = false;
    };
  }, [sources]);

  return loadedCount === sources.length;
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export async function preloadImages(sources: string[]): Promise<void> {
  await Promise.all(sources.map(src => preloadImage(src)));
}

export function usePrefetchImages(sources: string[], enabled = true) {
  useEffect(() => {
    if (!enabled || sources.length === 0) return;

    const controller = new AbortController();

    sources.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = src;
      link.as = 'image';
      document.head.appendChild(link);
    });

    return () => {
      controller.abort();
    };
  }, [sources, enabled]);
}
