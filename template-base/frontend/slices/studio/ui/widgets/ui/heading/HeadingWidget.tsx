import React from 'react';

/**
 * HeadingWidget - Semantic heading component
 * 
 * Dynamic properties:
 * - level: h1-h6 semantic level
 * - content: the text content
 * - align: text alignment
 * - size: visual size (can differ from semantic level)
 * 
 * SSOT: Size and alignment maps centralized
 */
interface HeadingWidgetProps {
    level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    content?: string;
    align?: 'left' | 'center' | 'right';
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    className?: string;
}

// SSOT: Text size classes
const SIZE_MAP = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
} as const;

// SSOT: Alignment classes
const ALIGN_MAP = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
} as const;

// SSOT: Weight classes
const WEIGHT_MAP = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
} as const;

// SSOT: Default size per heading level
const LEVEL_DEFAULT_SIZE = {
    h1: '3xl',
    h2: '2xl',
    h3: 'xl',
    h4: 'lg',
    h5: 'base',
    h6: 'sm',
} as const;

export const HeadingWidget: React.FC<HeadingWidgetProps> = ({
    level = 'h2',
    content = 'Heading',
    align = 'left',
    size,
    weight = 'bold',
    className = '',
}) => {
    const Tag = level;
    const actualSize = size || LEVEL_DEFAULT_SIZE[level];
    const classes = `${SIZE_MAP[actualSize]} ${ALIGN_MAP[align]} ${WEIGHT_MAP[weight]} ${className}`;

    return (
        <Tag className={classes}>
            {content}
        </Tag>
    );
};
