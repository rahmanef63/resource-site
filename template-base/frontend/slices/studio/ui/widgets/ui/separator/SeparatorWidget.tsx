import React from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface SeparatorWidgetProps {
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
    margin?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
}

const marginClasses: Record<string, string> = {
    'none': '',
    'sm': 'my-2',
    'md': 'my-4',
    'lg': 'my-6',
};

const verticalMarginClasses: Record<string, string> = {
    'none': '',
    'sm': 'mx-2',
    'md': 'mx-4',
    'lg': 'mx-6',
};

export const SeparatorWidget: React.FC<SeparatorWidgetProps> = ({
    orientation = 'horizontal',
    decorative = true,
    margin = 'md',
    className,
}) => {
    const marginClass = orientation === 'horizontal'
        ? marginClasses[margin]
        : verticalMarginClasses[margin];

    return (
        <Separator
            orientation={orientation}
            decorative={decorative}
            className={cn(
                marginClass,
                orientation === 'vertical' && 'h-8',
                className
            )}
        />
    );
};
