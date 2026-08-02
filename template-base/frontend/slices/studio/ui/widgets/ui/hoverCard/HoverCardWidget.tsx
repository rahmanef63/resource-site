import React from 'react';
import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

export interface HoverCardWidgetProps {
    triggerText?: string;
    title?: string;
    description?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    openDelay?: number;
    className?: string;
    children?: React.ReactNode;
}

export const HoverCardWidget: React.FC<HoverCardWidgetProps> = ({
    triggerText = 'Hover me',
    title = 'Hover Card Title',
    description = 'This is the hover card content that appears when you hover over the trigger.',
    side = 'bottom',
    openDelay = 200,
    className,
    children,
}) => {
    return (
        <HoverCard openDelay={openDelay}>
            <HoverCardTrigger asChild>
                <span className="inline-block px-3 py-1.5 bg-muted rounded-md cursor-pointer text-sm underline underline-offset-2">
                    {triggerText}
                </span>
            </HoverCardTrigger>
            <HoverCardContent side={side} className={cn('w-80', className)}>
                {children || (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{title}</h4>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                )}
            </HoverCardContent>
        </HoverCard>
    );
};
