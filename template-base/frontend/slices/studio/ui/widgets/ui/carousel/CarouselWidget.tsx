import React from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

export interface CarouselWidgetProps {
    items?: string;
    orientation?: 'horizontal' | 'vertical';
    showArrows?: boolean;
    loop?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const CarouselWidget: React.FC<CarouselWidgetProps> = ({
    items = 'Slide 1,Slide 2,Slide 3',
    orientation = 'horizontal',
    showArrows = true,
    loop = false,
    className,
    children,
}) => {
    const slideList = Array.isArray(items)
        ? (items as unknown[]).map(String).filter(Boolean)
        : typeof items === 'string'
        ? items.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    return (
        <Carousel
            opts={{ loop }}
            orientation={orientation}
            className={cn('w-full max-w-sm mx-auto', className)}
        >
            <CarouselContent className={orientation === 'vertical' ? '-mt-4 h-[200px]' : ''}>
                {slideList.map((slide, i) => (
                    <CarouselItem key={i} className={orientation === 'vertical' ? 'pt-4' : ''}>
                        <div className="p-1">
                            <div className="flex aspect-square items-center justify-center rounded-lg bg-muted/50 p-6">
                                <span className="text-xl font-semibold">{slide}</span>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {showArrows && (
                <>
                    <CarouselPrevious />
                    <CarouselNext />
                </>
            )}
        </Carousel>
    );
};
