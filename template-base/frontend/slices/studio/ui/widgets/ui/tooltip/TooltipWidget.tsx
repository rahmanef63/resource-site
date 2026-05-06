import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface TooltipWidgetProps {
    content?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    triggerText?: string;
    className?: string;
    children?: React.ReactNode;
}

export const TooltipWidget: React.FC<TooltipWidgetProps> = ({
    content = 'Tooltip content',
    side = 'top',
    triggerText = 'Hover me',
    className,
    children,
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span
                    className={cn(
                        'inline-block px-3 py-1.5 bg-muted rounded-md cursor-help text-sm',
                        className
                    )}
                >
                    {children || triggerText}
                </span>
            </TooltipTrigger>
            <TooltipContent side={side}>
                {content}
            </TooltipContent>
        </Tooltip>
    );
};
