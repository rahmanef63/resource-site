/**
 * Generic Image Component
 * A truly shared image component with no feature dependencies
 */

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ImageComponentProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  objectFit?: string;
  className?: string;
}

export const ImageComponent: React.FC<ImageComponentProps> = ({
  src = "https://picsum.photos/640/420",
  alt = "placeholder",
  width = "640",
  height = "420",
  rounded = true,
  objectFit = "cover",
  className = "w-full h-auto"
}) => {
  const numericWidth = Number(width) || 640;
  const numericHeight = Number(height) || 420;

  return (
    <Image
      src={src}
      alt={alt}
      width={numericWidth}
      height={numericHeight}
      className={cn(
        className,
        rounded && "rounded-xl",
        objectFit && `object-${objectFit}`
      )}
    />
  );
};

export default ImageComponent;
