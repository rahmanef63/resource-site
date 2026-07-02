/**
 * Workspace Template Card Component
 * 
 * Displays a single workspace template with hover effects and actions
 */

"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WorkspaceTemplate } from "@/lib/utils/workspace-store"
import { formatWorkspaceFeatureLabel } from "@/frontend/shared/foundation/workspaces/lib/formatFeatureLabel"

export interface WorkspaceTemplateCardProps {
    template: WorkspaceTemplate
    onUseTemplate: (template: WorkspaceTemplate) => void
    className?: string
}

export function WorkspaceTemplateCard({
    template,
    onUseTemplate,
    className
}: WorkspaceTemplateCardProps) {
    return (
        <Card
            className={cn(
                "hover:bg-muted/50 transition-all duration-300 cursor-pointer group",
                "hover:shadow-md hover:-translate-y-1 hover:border-primary/20",
                "relative overflow-hidden",
                className
            )}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                        {template.features.length} features
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 4).map((f: string) => (
                        <Badge key={f} variant="outline" className="text-[10px]">
                            {formatWorkspaceFeatureLabel(f)}
                        </Badge>
                    ))}
                    {template.features.length > 4 && (
                        <Badge variant="outline" className="text-[10px]">
                            +{template.features.length - 4}
                        </Badge>
                    )}
                </div>
                <Button
                    size="sm"
                    className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                    onClick={(e) => {
                        e.stopPropagation()
                        onUseTemplate(template)
                    }}
                >
                    Use Template
                </Button>
            </CardContent>
        </Card>
    )
}
