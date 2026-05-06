"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type GalleryCardSize = "small" | "medium" | "large";
export type GalleryLayout = "grid" | "masonry";

export type GalleryItemProps = {
    id: string;
    name: string;
};

type GalleryContextProps<T extends GalleryItemProps = GalleryItemProps> = {
    data: T[];
    cardSize: GalleryCardSize;
    layout: GalleryLayout;
};

const GalleryContext = createContext<GalleryContextProps>({
    data: [],
    cardSize: "medium",
    layout: "grid",
});

// ============================================================================
// Provider
// ============================================================================

export type GalleryProviderProps<T extends GalleryItemProps = GalleryItemProps> = {
    children: ReactNode;
    data: T[];
    cardSize?: GalleryCardSize;
    layout?: GalleryLayout;
    className?: string;
};

export function GalleryProvider<T extends GalleryItemProps = GalleryItemProps>({
    children,
    data,
    cardSize = "medium",
    layout = "grid",
    className,
}: GalleryProviderProps<T>) {
    return (
        <GalleryContext.Provider value={{ data, cardSize, layout }}>
            <div className={cn("flex flex-col h-full", className)}>{children}</div>
        </GalleryContext.Provider>
    );
}

// ============================================================================
// Header
// ============================================================================

export type GalleryHeaderProps = HTMLAttributes<HTMLDivElement>;

export const GalleryHeader = ({ className, ...props }: GalleryHeaderProps) => (
    <div
        className={cn("flex items-center justify-between gap-4 p-4 border-b", className)}
        {...props}
    />
);

// ============================================================================
// Grid
// ============================================================================

export type GalleryGridProps<T extends GalleryItemProps = GalleryItemProps> =
    Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
        children: (item: T) => ReactNode;
    };

export function GalleryGrid<T extends GalleryItemProps = GalleryItemProps>({
    children,
    className,
    ...props
}: GalleryGridProps<T>) {
    const { data, cardSize, layout } = useContext(GalleryContext) as GalleryContextProps<T>;

    const gridColumns = useMemo(() => {
        switch (cardSize) {
            case "small":
                return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
            case "medium":
                return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
            case "large":
                return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3";
        }
    }, [cardSize]);

    return (
        <ScrollArea className="flex-1">
            <div
                className={cn(
                    "grid gap-4 p-4",
                    layout === "grid" && gridColumns,
                    layout === "masonry" && "columns-1 sm:columns-2 md:columns-3 lg:columns-4",
                    className
                )}
                {...props}
            >
                {data.map((item) => children(item))}
            </div>
            <ScrollBar orientation="vertical" />
        </ScrollArea>
    );
}

// ============================================================================
// Card
// ============================================================================

export type GalleryCardProps = {
    id: string;
    name: string;
    coverImage?: string;
    aspectRatio?: "square" | "video" | "portrait";
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
};

export const GalleryCard = ({
    id,
    name,
    coverImage,
    aspectRatio = "video",
    children,
    className,
    onClick,
}: GalleryCardProps) => {
    const aspectClass = useMemo(() => {
        switch (aspectRatio) {
            case "square":
                return "aspect-square";
            case "video":
                return "aspect-video";
            case "portrait":
                return "aspect-[3/4]";
        }
    }, [aspectRatio]);

    return (
        <Card
            className={cn(
                "overflow-hidden cursor-pointer transition-shadow hover:shadow-lg",
                className
            )}
            onClick={onClick}
        >
            {/* Cover Image */}
            <div className={cn("relative bg-muted", aspectClass)}>
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                            className="h-12 w-12 text-muted-foreground/30"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Content */}
            <CardContent className="p-3">
                {children ?? <p className="font-medium text-sm truncate">{name}</p>}
            </CardContent>
        </Card>
    );
};

// ============================================================================
// Empty State
// ============================================================================

export type GalleryEmptyProps = HTMLAttributes<HTMLDivElement>;

export const GalleryEmpty = ({ className, children, ...props }: GalleryEmptyProps) => (
    <div
        className={cn(
            "flex flex-1 items-center justify-center p-8 text-center text-muted-foreground",
            className
        )}
        {...props}
    >
        {children ?? <p>No items to display</p>}
    </div>
);

// ============================================================================
// Hook
// ============================================================================

export function useGallery<T extends GalleryItemProps = GalleryItemProps>() {
    return useContext(GalleryContext) as GalleryContextProps<T>;
}
