/**
 * Board Card Component
 * 
 * Draggable card component for kanban board.
 * Displays property values in a compact, visually appealing format.
 */

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PropertyRowData, PropertyColumnConfig } from "./table-columns";
import { getPropertyConfig } from "./table-columns";

export interface BoardCardProps {
  /** Card data */
  data: PropertyRowData;

  /** Properties to display on card */
  properties: PropertyColumnConfig[];

  /** Group property key */
  groupBy: string;

  /** Callback when card is clicked */
  onClick?: (id: string) => void;

  /** Callback when card is deleted */
  onDelete?: (id: string) => void;

  /** Whether drag is disabled */
  disableDrag?: boolean;

  /** Custom CSS class */
  className?: string;
}

/**
 * Board Card Component
 */
export function BoardCard({
  data,
  properties,
  groupBy,
  onClick,
  onDelete,
  disableDrag = false,
  className,
}: BoardCardProps) {
  // Find title property (usually the first one or named "title")
  const titleProp = properties.find((p) => p.key === "title" || p.type === "title") || properties[0];
  const titleValue = titleProp ? data.properties[titleProp.key] : data.id;

  // Get other visible properties (exclude group property)
  const visibleProps = properties.filter(
    (p) => p.key !== groupBy && p.visible !== false && p.key !== titleProp?.key
  );

  return (
    <div
      className={cn(
        "group cursor-pointer",
        className
      )}
      onClick={() => onClick?.(data.id)}
      onPointerUp={() => onClick?.(data.id)}
    >
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-shadow",
          "border-border bg-card"
        )}
      >
        <CardHeader className="pb-3 pt-3 px-3 space-y-0">
          <div className="flex items-start justify-between gap-2">
            {/* Drag handle */}
            {!disableDrag && (
              <div
                className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity -ml-1"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium leading-tight truncate">
                {typeof titleValue === "string" ? titleValue : String(titleValue)}
              </h4>
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button aria-label="More options"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onClick?.(data.id);
                }}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(data.id);
                }}>
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(data.id);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="px-3 pb-3 space-y-2">
          {/* Render visible properties */}
          {visibleProps.map((propConfig) => {
            const value = data.properties[propConfig.key];
            const propertyConfig = getPropertyConfig(propConfig.type);

            if (!propertyConfig || value === null || value === undefined) {
              return null;
            }

            const { Renderer } = propertyConfig;

            // Create minimal property object for renderer
            const property = {
              key: propConfig.key,
              name: propConfig.name,
              type: propConfig.type,
            };

            return (
              <div key={propConfig.key} className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground min-w-[60px] flex-shrink-0">
                  {propConfig.name}:
                </span>
                <div className="flex-1 min-w-0 text-xs">
                  <Renderer value={value} property={property} />
                </div>
              </div>
            );
          })}

          {/* Show badges for multi_select or tags */}
          {visibleProps
            .filter((p) => p.type === "multi_select" && data.properties[p.key])
            .map((propConfig) => {
              const tags = data.properties[propConfig.key];
              if (!Array.isArray(tags) || tags.length === 0) return null;

              return (
                <div key={propConfig.key} className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tags.length - 3}
                    </Badge>
                  )}
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}

export default BoardCard;
