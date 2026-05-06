import React from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DialogWidgetProps {
    triggerText?: string;
    title?: string;
    description?: string;
    showCloseButton?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const DialogWidget: React.FC<DialogWidgetProps> = ({
    triggerText = 'Open Dialog',
    title = 'Dialog Title',
    description = 'Dialog description goes here.',
    showCloseButton = true,
    className,
    children,
}) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{triggerText}</Button>
            </DialogTrigger>
            <DialogContent className={cn('sm:max-w-[425px]', className)}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {children || (
                        <p className="text-muted-foreground text-sm">
                            Dialog content goes here. Add your content as children.
                        </p>
                    )}
                </div>
                {showCloseButton && (
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};
