/**
 * PageContainer Component
 * 
 * A flexible container for page content with:
 * - Max-width constraints
 * - Padding options
 * - Centering support
 * - Full height mode
 * 
 * @example
 * ```tsx
 * import { PageContainer } from "@/frontend/shared/ui/layout/container"
 * 
 * <PageContainer maxWidth="2xl" padding>
 *   <h1>Page Content</h1>
 * </PageContainer>
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps {
  /** Container content */
  children: React.ReactNode;
  /** Maximum width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  /** Add padding */
  padding?: boolean;
  /** Padding size */
  paddingSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** Full height container */
  fullHeight?: boolean;
  /** Center content vertically and horizontally */
  centered?: boolean;
  /** Additional class names */
  className?: string;
}

const maxWidthClasses: Record<PageContainerProps['maxWidth'] & string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const paddingSizeClasses: Record<NonNullable<PageContainerProps['paddingSize']>, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'full',
  padding = true,
  paddingSize = 'lg',
  fullHeight = false,
  centered = false,
  className,
}) => {
  return (
    <div 
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        padding && paddingSizeClasses[paddingSize],
        fullHeight && "h-full",
        centered && "flex items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  );
};

PageContainer.displayName = "PageContainer";

export default PageContainer;
