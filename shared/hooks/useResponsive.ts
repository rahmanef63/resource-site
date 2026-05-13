import { useState, useEffect } from 'react';

interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive(breakpoints: Partial<BreakpointConfig> = {}) {
  const bp = { ...defaultBreakpoints, ...breakpoints };
  
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < bp.md;
  const isTablet = windowSize.width >= bp.md && windowSize.width < bp.lg;
  const isDesktop = windowSize.width >= bp.lg;
  const isLarge = windowSize.width >= bp.xl;
  const isExtraLarge = windowSize.width >= bp['2xl'];

  const breakpoint = 
    windowSize.width >= bp['2xl'] ? '2xl' :
    windowSize.width >= bp.xl ? 'xl' :
    windowSize.width >= bp.lg ? 'lg' :
    windowSize.width >= bp.md ? 'md' :
    'sm';

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    isExtraLarge,
    breakpoint,
    breakpoints: bp,
  };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
