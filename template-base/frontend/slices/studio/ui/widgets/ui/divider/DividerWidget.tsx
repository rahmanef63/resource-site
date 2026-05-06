import React from 'react';
import { Separator } from '@/components/ui/separator';

/**
 * DividerWidget - A horizontal or vertical separator line
 * 
 * Dynamic properties controlled via inspector:
 * - orientation: horizontal | vertical
 * - spacing: amount of margin around the divider
 * - decorative: whether this is purely decorative (accessibility)
 */
interface DividerWidgetProps {
    orientation?: 'horizontal' | 'vertical';
    spacing?: 'none' | 'sm' | 'md' | 'lg';
    decorative?: boolean;
    className?: string;
}

// SSOT: Spacing values map
const SPACING_MAP = {
    none: '',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-8',
} as const;

const VERTICAL_SPACING_MAP = {
    none: '',
    sm: 'mx-2',
    md: 'mx-4',
    lg: 'mx-8',
} as const;

export const DividerWidget: React.FC<DividerWidgetProps> = ({
    orientation = 'horizontal',
    spacing = 'md',
    decorative = true,
    className = '',
}) => {
    const spacingClass = orientation === 'horizontal'
        ? SPACING_MAP[spacing]
        : VERTICAL_SPACING_MAP[spacing];

    return (
        <Separator
            orientation={orientation}
            decorative={decorative}
            className={`${spacingClass} ${className}`}
        />
    );
};
