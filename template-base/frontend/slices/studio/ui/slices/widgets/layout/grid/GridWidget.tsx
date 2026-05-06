import React from 'react';
import { cn } from '@/lib/utils';

export interface GridWidgetProps {
    columns?: '1' | '2' | '3' | '4' | '5' | '6' | '12';
    gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    placeItems?: 'start' | 'center' | 'end' | 'stretch';
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
}

const columnClasses: Record<string, string> = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-2',
    '3': 'grid-cols-3',
    '4': 'grid-cols-4',
    '5': 'grid-cols-5',
    '6': 'grid-cols-6',
    '12': 'grid-cols-12',
};

const gapClasses: Record<string, string> = {
    'none': 'gap-0',
    'sm': 'gap-2',
    'md': 'gap-4',
    'lg': 'gap-6',
    'xl': 'gap-8',
};

const placeItemsClasses: Record<string, string> = {
    'start': 'place-items-start',
    'center': 'place-items-center',
    'end': 'place-items-end',
    'stretch': 'place-items-stretch',
};

export const GridWidget: React.FC<GridWidgetProps> = ({
    columns = '3',
    gap = 'md',
    placeItems = 'stretch',
    className,
    children,
    ...rest
}) => {
    const colClass = columnClasses[columns] || columnClasses['3'];
    const gapClass = gapClasses[gap] || gapClasses['md'];
    const placeClass = placeItemsClasses[placeItems] || placeItemsClasses['stretch'];

    // Demo content when no children
    const demoContent = !children && (
        <>
            {Array.from({ length: parseInt(columns) }).map((_, i) => (
                <div
                    key={i}
                    className="bg-muted/50 rounded-lg p-4 min-h-16 flex items-center justify-center"
                >
                    <span className="text-muted-foreground text-sm">Cell {i + 1}</span>
                </div>
            ))}
        </>
    );

    return (
        <div
            {...rest}
            className={cn(
                'grid w-full',
                colClass,
                gapClass,
                placeClass,
                className
            )}
        >
            {children || demoContent}
        </div>
    );
};
