export interface ResponsiveImageSizes {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export function generateResponsiveImageSrcSet(
  baseUrl: string,
  sizes: ResponsiveImageSizes = { sm: 640, md: 1024, lg: 1536, xl: 2048 }
): string {
  const srcSetParts: string[] = [];

  if (sizes.sm) {
    srcSetParts.push(`${baseUrl}?w=${sizes.sm} ${sizes.sm}w`);
  }
  if (sizes.md) {
    srcSetParts.push(`${baseUrl}?w=${sizes.md} ${sizes.md}w`);
  }
  if (sizes.lg) {
    srcSetParts.push(`${baseUrl}?w=${sizes.lg} ${sizes.lg}w`);
  }
  if (sizes.xl) {
    srcSetParts.push(`${baseUrl}?w=${sizes.xl} ${sizes.xl}w`);
  }

  return srcSetParts.join(', ');
}

export function generateImageSizes(
  breakpoints: { [key: string]: string } = {
    sm: '640px',
    md: '1024px',
    lg: '1536px',
  }
): string {
  const sizeParts: string[] = [];

  if (breakpoints.sm) {
    sizeParts.push(`(max-width: ${breakpoints.sm}) 100vw`);
  }
  if (breakpoints.md) {
    sizeParts.push(`(max-width: ${breakpoints.md}) 80vw`);
  }
  if (breakpoints.lg) {
    sizeParts.push(`(max-width: ${breakpoints.lg}) 60vw`);
  }

  sizeParts.push('50vw');

  return sizeParts.join(', ');
}

export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 85
): string {
  if (!url) return url;

  const urlObj = new URL(url, window.location.origin);
  
  if (width) {
    urlObj.searchParams.set('w', String(width));
  }
  if (height) {
    urlObj.searchParams.set('h', String(height));
  }
  if (quality !== 85) {
    urlObj.searchParams.set('q', String(quality));
  }

  return urlObj.toString();
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

export function generateBlurDataUrl(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}
