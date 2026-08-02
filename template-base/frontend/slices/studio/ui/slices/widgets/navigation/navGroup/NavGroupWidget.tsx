import React from 'react';
import { cn } from '@/lib/utils';

interface NavGroupProps {
  title?: string;
  type?: string;
  position?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  alignment?: 'start' | 'center' | 'end' | 'between' | 'around';
  spacing?: string;
  background?: string;
  border?: boolean;
  shadow?: boolean;
  rounded?: boolean;
  padding?: string;
  className?: string;
  children?: React.ReactNode;
}

export const NavGroupWidget: React.FC<NavGroupProps> = ({ 
  title = "Navigation",
  type = "header",
  position = "top",
  layout = "vertical",
  alignment = "start",
  spacing = "2",
  background = "white",
  border = true,
  shadow = false,
  rounded = false,
  padding = "4",
  className = "",
  children 
}) => {
  const getTypeClasses = () => {
    switch (type) {
      case 'header':
        return 'w-full';
      case 'sidebar':
        return 'h-full w-64';
      case 'footer':
        return 'w-full';
      case 'floating':
        return 'fixed z-50';
      default:
        return '';
    }
  };

  const getPositionClasses = () => {
    if (type === 'floating') {
      switch (position) {
        case 'top':
          return 'top-4 left-1/2 -translate-x-1/2';
        case 'bottom':
          return 'bottom-4 left-1/2 -translate-x-1/2';
        case 'left':
          return 'left-4 top-1/2 -translate-y-1/2';
        case 'right':
          return 'right-4 top-1/2 -translate-y-1/2';
        case 'top-left':
          return 'top-4 left-4';
        case 'top-right':
          return 'top-4 right-4';
        case 'bottom-left':
          return 'bottom-4 left-4';
        case 'bottom-right':
          return 'bottom-4 right-4';
        default:
          return 'top-4 left-1/2 -translate-x-1/2';
      }
    }
    return '';
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return `flex flex-row items-${alignment === 'start' ? 'start' : alignment === 'end' ? 'end' : 'center'} gap-${spacing}`;
      case 'grid':
        return `grid grid-cols-2 gap-${spacing}`;
      default:
        return `flex flex-col gap-${spacing}`;
    }
  };

  const getAlignmentClasses = () => {
    if (layout === 'horizontal') {
      switch (alignment) {
        case 'center':
          return 'justify-center';
        case 'end':
          return 'justify-end';
        case 'between':
          return 'justify-between';
        case 'around':
          return 'justify-around';
        default:
          return 'justify-start';
      }
    }
    return '';
  };

  const getBackgroundClasses = () => {
    switch (background) {
      case 'white':
        return 'bg-background';
      case 'gray':
        return 'bg-muted';
      case 'dark':
        return 'bg-foreground text-background';
      case 'transparent':
        return 'bg-transparent';
      case 'blur':
        return 'bg-background/80 backdrop-blur-sm';
      default:
        return 'bg-background';
    }
  };

  const getBorderClasses = () => {
    if (!border) return '';
    
    switch (type) {
      case 'header':
        return 'border-b border-border';
      case 'footer':
        return 'border-t border-border';
      case 'sidebar':
        return 'border-r border-border';
      default:
        return 'border border-border';
    }
  };

  return (
    <nav className={cn(
      getTypeClasses(),
      getPositionClasses(),
      getBackgroundClasses(),
      getBorderClasses(),
      shadow && 'shadow-lg',
      rounded && 'rounded-2xl',
      `p-${padding}`,
      className
    )}>
      {title && (
        <div className={cn(
          "mb-3",
          layout === 'horizontal' ? 'mr-4' : 'border-b border-border pb-2'
        )}>
          <h2 className={cn(
            "font-semibold",
            layout === 'horizontal' ? 'text-base' : 'text-sm',
            background === 'dark' ? 'text-background' : 'text-foreground'
          )}>
            {title}
          </h2>
        </div>
      )}
      
      <div className={cn(
        getLayoutClasses(),
        getAlignmentClasses()
      )}>
        {children}
      </div>
    </nav>
  );
};
