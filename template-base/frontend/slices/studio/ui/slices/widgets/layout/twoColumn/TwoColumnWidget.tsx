import React from 'react';
import { cn } from '@/lib/utils';

export interface TwoColumnWidgetProps {
    splitRatio?: '50-50' | '33-67' | '67-33' | '25-75' | '75-25';
    orientation?: 'horizontal' | 'vertical';
    gap?: 'none' | 'sm' | 'md' | 'lg';
    leftLabel?: string;
    rightLabel?: string;
    className?: string;
    children?: React.ReactNode;
}

const ratioClasses: Record<string, { left: string; right: string }> = {
    '50-50': { left: 'w-1/2', right: 'w-1/2' },
    '33-67': { left: 'w-1/3', right: 'w-2/3' },
    '67-33': { left: 'w-2/3', right: 'w-1/3' },
    '25-75': { left: 'w-1/4', right: 'w-3/4' },
    '75-25': { left: 'w-3/4', right: 'w-1/4' },
};

const gapClasses: Record<string, string> = {
    'none': 'gap-0',
    'sm': 'gap-2',
    'md': 'gap-4',
    'lg': 'gap-6',
};

export const TwoColumnWidget: React.FC<TwoColumnWidgetProps> = ({
    splitRatio = '50-50',
    orientation = 'horizontal',
    gap = 'md',
    leftLabel = 'Left',
    rightLabel = 'Right',
    className,
    children,
}) => {
    const ratio = ratioClasses[splitRatio] || ratioClasses['50-50'];
    const gapClass = gapClasses[gap] || gapClasses['md'];

    const isVertical = orientation === 'vertical';

    return (
        <div
            className={cn(
                'flex min-h-32',
                isVertical ? 'flex-col' : 'flex-row',
                gapClass,
                className
            )}
        >
            <div
                className={cn(
                    'bg-muted/30 rounded-lg p-4 flex items-center justify-center',
                    isVertical ? 'w-full h-1/2' : ratio.left
                )}
            >
                <span className="text-muted-foreground text-sm">{leftLabel}</span>
            </div>
            <div
                className={cn(
                    'bg-muted/30 rounded-lg p-4 flex items-center justify-center',
                    isVertical ? 'w-full h-1/2' : ratio.right
                )}
            >
                {children || <span className="text-muted-foreground text-sm">{rightLabel}</span>}
            </div>
        </div>
    );
};
