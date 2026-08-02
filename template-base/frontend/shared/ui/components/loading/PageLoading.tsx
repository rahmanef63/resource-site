"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
    className?: string;
    message?: string;
}

export function PageLoading({ className, message = "Loading page..." }: PageLoadingProps) {
    return (
        <div className={cn("flex h-full w-full items-center justify-center bg-background", className)}>
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
            </div>
        </div>
    );
}
