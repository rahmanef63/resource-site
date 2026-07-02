import type { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Copy, Share, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "../types";
import { getFeatureType, getOriginalFeatureType, canRestoreFeatureType } from "../lib";
import { FEATURE_TYPES } from "../constants";

interface MenuItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  isUpdating: boolean;
  onSelect: (id: Id<"menuItems">) => void;
  onEdit: (id: Id<"menuItems">) => void;
  onRename: (item: MenuItem) => void;
  onDuplicate: (item: MenuItem) => void;
  onShare: (item: MenuItem) => void;
  onDelete: (id: Id<"menuItems">) => void;
  onRestrictToSystem: (item: MenuItem) => void;
  onRestoreVisibility: (item: MenuItem) => void;
}

export function MenuItemCard({
  item,
  isSelected,
  isUpdating,
  onSelect,
  onEdit,
  onRename,
  onDuplicate,
  onShare,
  onDelete,
  onRestrictToSystem,
  onRestoreVisibility,
}: MenuItemCardProps) {
  const featureType = getFeatureType(item);
  const canRestore = canRestoreFeatureType(item);
  const { label: featureLabel, variant: featureVariant } = FEATURE_TYPES[featureType];

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => onSelect(item._id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {item.name}
            {featureType !== "custom" && (
              <Badge
                variant={featureVariant}
                className="text-[10px] uppercase tracking-wide"
              >
                {featureLabel}
              </Badge>
            )}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button aria-label="More options" variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item._id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRename(item)}>
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(item)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(item)}>
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              {featureType !== "system" && (
                <DropdownMenuItem
                  onClick={() => onRestrictToSystem(item)}
                  disabled={isUpdating}
                >
                  Restrict to system roles
                </DropdownMenuItem>
              )}
              {canRestore && (
                <DropdownMenuItem
                  onClick={() => onRestoreVisibility(item)}
                  disabled={isUpdating}
                >
                  Restore original visibility
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item._id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {item.type}
            </Badge>
            {item.metadata?.version && (
              <Badge variant="outline" className="text-xs">
                v{item.metadata.version}
              </Badge>
            )}
            {item.metadata?.category && (
              <Badge variant="default" className="text-xs capitalize">
                {item.metadata.category}
              </Badge>
            )}
          </div>
          {item.metadata?.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.metadata.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
