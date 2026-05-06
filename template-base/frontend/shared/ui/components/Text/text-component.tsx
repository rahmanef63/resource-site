/**
 * Generic Text Component
 * A truly shared text component with no feature dependencies
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface TextComponentProps {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';
  content?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  decoration?: 'none' | 'underline' | 'overline' | 'line-through';
  spacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  leading?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  family?: 'sans' | 'serif' | 'mono';
  style?: 'normal' | 'italic';
  truncate?: boolean;
  whitespace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap';
  className?: string;
}

export const TextComponent: React.FC<TextComponentProps> = ({
  tag = "p",
  content = "Text content",
  size = "base",
  weight = "normal",
  color = "gray-900",
  align = "left",
  transform = "none",
  decoration = "none",
  spacing = "normal",
  leading = "normal",
  family = "sans",
  style = "normal",
  truncate = false,
  whitespace = "normal",
  className = ""
}) => {
  const Tag = tag as React.ElementType;

  const classes = cn(
    // Size
    size !== 'base' && `text-${size}`,
    // Weight
    weight !== 'normal' && `font-${weight}`,
    // Color
    color !== 'gray-900' && `text-${color}`,
    // Alignment
    align !== 'left' && `text-${align}`,
    // Transform
    transform !== 'none' && transform,
    // Decoration
    decoration !== 'none' && decoration,
    // Letter spacing
    spacing !== 'normal' && `tracking-${spacing}`,
    // Line height
    leading !== 'normal' && `leading-${leading}`,
    // Font family
    family !== 'sans' && `font-${family}`,
    // Font style
    style !== 'normal' && style,
    // Truncate
    truncate && 'truncate',
    // Whitespace
    whitespace !== 'normal' && `whitespace-${whitespace}`,
    // Custom className
    className
  );

  return (
    <Tag className={classes}>
      {content}
    </Tag>
  );
};

export default TextComponent;
