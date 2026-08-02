/**
 * WorkspaceIcon Component
 * 
 * Displays workspace icon with support for:
 * - Uploaded image logos (from Convex storage)
 * - Lucide icon names
 * - Fallback to first letter
 */

"use client"

import React from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import * as LucideIcons from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface WorkspaceIconProps {
    /** Workspace ID for fetching logo URL */
    workspaceId?: Id<"workspaces">
    /** Direct logo URL (if already fetched) */
    logoUrl?: string | null
    /** Lucide icon name */
    iconName?: string
    /** Workspace name for fallback */
    name?: string
    /** Display color */
    color?: string
    /** Size variant */
    size?: "sm" | "default" | "lg"
    /** Additional className */
    className?: string
}

const sizeMap = {
    sm: "size-6",
    default: "size-8",
    lg: "size-10",
}

const iconSizeMap = {
    sm: "size-3",
    default: "size-4",
    lg: "size-5",
}

export function WorkspaceIcon({
    workspaceId,
    logoUrl: propLogoUrl,
    iconName,
    name = "W",
    color,
    size = "default",
    className,
}: WorkspaceIconProps) {
    // Fetch logo URL from storage if workspaceId is provided and no propLogoUrl
    const storedLogoUrl = useQuery(
        api.workspace.storage.getWorkspaceLogoUrl,
        workspaceId && !propLogoUrl ? { workspaceId } : "skip"
    )

    const logoUrl = propLogoUrl ?? storedLogoUrl

    // Get icon component if iconName is provided
    const IconComponent = iconName
        ? (LucideIcons as any)[iconName] || (LucideIcons as any)[`${iconName}Icon`]
        : null

    // Background color style
    const bgStyle = color
        ? { backgroundColor: color }
        : undefined

    // If we have a logo URL, show image
    if (logoUrl) {
        return (
            <Avatar className={cn(sizeMap[size], "rounded-lg", className)}>
                <AvatarImage src={logoUrl} alt={name} className="object-cover" />
                <AvatarFallback
                    className="rounded-lg text-xs font-medium"
                    style={bgStyle}
                >
                    {name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
        )
    }

    // If we have an icon name, show icon
    if (IconComponent) {
        return (
            <div
                className={cn(
                    sizeMap[size],
                    "flex items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground",
                    className
                )}
                style={bgStyle}
            >
                <IconComponent className={iconSizeMap[size]} />
            </div>
        )
    }

    // Fallback to first letter
    return (
        <div
            className={cn(
                sizeMap[size],
                "flex items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-medium text-sm",
                className
            )}
            style={bgStyle}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    )
}

export default WorkspaceIcon
