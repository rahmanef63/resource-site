import React from 'react';
import { cn } from '@/lib/utils';

export interface FlexWidgetProps {
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
}

const directionClasses: Record<string, string> = {
    'row': 'flex-row',
    'column': 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse',
};

const justifyClasses: Record<string, string> = {
    'start': 'justify-start',
    'center': 'justify-center',
    'end': 'justify-end',
    'between': 'justify-between',
    'around': 'justify-around',
    'evenly': 'justify-evenly',
};

const alignClasses: Record<string, string> = {
    'start': 'items-start',
    'center': 'items-center',
    'end': 'items-end',
    'stretch': 'items-stretch',
    'baseline': 'items-baseline',
};

const wrapClasses: Record<string, string> = {
    'nowrap': 'flex-nowrap',
    'wrap': 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
};

const gapClasses: Record<string, string> = {
    'none': 'gap-0',
    'sm': 'gap-2',
    'md': 'gap-4',
    'lg': 'gap-6',
    'xl': 'gap-8',
};

export const FlexWidget: React.FC<FlexWidgetProps> = ({
    direction = 'row',
    justify = 'start',
    align = 'stretch',
    wrap = 'nowrap',
    gap = 'md',
    className,
    children,
    ...rest
}) => {
    const dirClass = directionClasses[direction] || directionClasses['row'];
    const justClass = justifyClasses[justify] || justifyClasses['start'];
    const alignClass = alignClasses[align] || alignClasses['stretch'];
    const wrapClass = wrapClasses[wrap] || wrapClasses['nowrap'];
    const gapClass = gapClasses[gap] || gapClasses['md'];

    // Demo content when no children
    const demoContent = !children && (
        <>
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="bg-muted/50 rounded-lg p-4 min-w-16 min-h-16 flex items-center justify-center"
                >
                    <span className="text-muted-foreground text-sm">Item {i}</span>
                </div>
            ))}
        </>
    );

    return (
        <div
            {...rest}
            className={cn(
                'flex w-full min-h-16',
                dirClass,
                justClass,
                alignClass,
                wrapClass,
                gapClass,
                className
            )}
        >
            {children || demoContent}
        </div>
    );
};
