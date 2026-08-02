import React from 'react';

/**
 * SpacerWidget - Empty spacing component
 * 
 * Dynamic properties controlled via inspector:
 * - size: predefined or custom pixel value
 * - direction: vertical or horizontal spacing
 * 
 * SSOT: Size values defined in a central map
 */
interface SpacerWidgetProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    direction?: 'vertical' | 'horizontal';
    customSize?: number;
    className?: string;
}

// SSOT: Size value mappings (in pixels)
const SIZE_MAP = {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    '2xl': 64,
} as const;

export const SpacerWidget: React.FC<SpacerWidgetProps> = ({
    size = 'md',
    direction = 'vertical',
    customSize,
    className = '',
}) => {
    const pixels = customSize || SIZE_MAP[size];

    const style: React.CSSProperties = direction === 'vertical'
        ? { height: `${pixels}px`, width: '100%' }
        : { width: `${pixels}px`, height: '100%', display: 'inline-block' };

    return (
        <div
            className={`shrink-0 ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
};
