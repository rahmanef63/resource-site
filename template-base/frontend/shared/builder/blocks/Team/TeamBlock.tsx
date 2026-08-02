/**
 * Team Block
 * 
 * Display team composition by role.
 */

"use client"

import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { BlockCard, getRoleColor } from "../shared"

// ============================================================================
// Types
// ============================================================================

export interface TeamBlockProps {
    roles: Record<string, number>
    title?: string
    description?: string
    loading?: boolean
    className?: string
}

// ============================================================================
// Team Block
// ============================================================================

export function TeamBlock({
    roles,
    title = "Team Composition",
    description = "Members by role",
    loading = false,
    className,
}: TeamBlockProps) {
    const hasRoles = roles && Object.keys(roles).length > 0

    return (
        <BlockCard
            header={{
                title,
                description,
                icon: Users,
            }}
            loading={loading}
            isEmpty={!hasRoles}
            emptyState={{
                icon: Users,
                title: "No team members",
                description: "Invite team members to get started.",
            }}
            className={className}
        >
            <div className="space-y-4">
                {Object.entries(roles).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "w-2 h-2 rounded-full",
                                    getRoleColor(role)
                                )}
                            />
                            <span className="capitalize">{role}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                    </div>
                ))}
            </div>
        </BlockCard>
    )
}

export default TeamBlock
