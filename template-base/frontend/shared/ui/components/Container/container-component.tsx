/**
 * Generic Container Component
 * A truly shared container component with no feature dependencies
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerComponentProps {
  display?: string;
  direction?: string;
  gap?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  position?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ContainerComponent: React.FC<ContainerComponentProps> = ({
  display = "flex",
  direction = "column",
  gap = "4",
  padding = "4",
  margin = "0",
  width = "full",
  height = "auto",
  position = "relative",
  className = "",
  children
}) => {
  const classes = cn(
    // Display
    display === 'flex' && 'flex',
    display === 'grid' && 'grid',
    display === 'block' && 'block',
    display === 'inline-block' && 'inline-block',
    display === 'inline-flex' && 'inline-flex',

    // Flex direction
    display === 'flex' && direction && `flex-${direction}`,

    // Gap
    gap !== '0' && `gap-${gap}`,

    // Padding
    padding !== '0' && `p-${padding}`,

    // Margin
    margin !== '0' && (margin === 'auto' ? 'mx-auto' : `m-${margin}`),

    // Width
    width === 'full' && 'w-full',
    width === 'auto' && 'w-auto',
    width === '1/2' && 'w-1/2',
    width === '1/3' && 'w-1/3',
    width === '2/3' && 'w-2/3',
    width === '1/4' && 'w-1/4',
    width === '3/4' && 'w-3/4',
    width === 'screen' && 'w-screen',

    // Height
    height === 'full' && 'h-full',
    height === 'auto' && 'h-auto',
    height === 'screen' && 'h-screen',
    height === 'min' && 'h-min',
    height === 'max' && 'h-max',
    height === 'fit' && 'h-fit',

    // Position
    position !== 'static' && position,

    // Custom className
    className
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default ContainerComponent;
