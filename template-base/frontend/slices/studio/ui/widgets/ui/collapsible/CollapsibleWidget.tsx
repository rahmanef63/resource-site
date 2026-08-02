import React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CollapsibleWidgetProps {
    triggerText?: string;
    defaultOpen?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const CollapsibleWidget: React.FC<CollapsibleWidgetProps> = ({
    triggerText = 'Toggle content',
    defaultOpen = false,
    className,
    children,
}) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn('w-full', className)}
        >
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                    {triggerText}
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 bg-muted/30 rounded-lg mt-2">
                {children || (
                    <span className="text-muted-foreground text-sm">
                        Collapsible content goes here
                    </span>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
};
