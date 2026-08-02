"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { IconCategory, IconName } from "../types";
import { ICON_CATEGORIES } from "../types";
import { ICONS_BY_CATEGORY } from "../constants";
import { DynamicIcon } from "../dynamic-icon";
import { searchIconsInCategory } from "../search";

export interface IconGridProps {
  /** Currently selected icon */
  selectedIcon?: IconName;
  /** Callback when icon is selected */
  onSelectIcon?: (iconName: IconName) => void;
  /** Number of columns in the grid */
  columns?: number;
  /** Max height of the grid area */
  height?: number | string;
  /** Whether to show search input */
  showSearch?: boolean;
  /** Whether to show category tabs */
  showCategories?: boolean;
  /** Initial category to show */
  defaultCategory?: IconCategory;
  /** Custom class name */
  className?: string;
}

/**
 * IconGrid Component
 *
 * A searchable grid of icons with optional category tabs.
 *
 * @example
 * // Basic usage
 * <IconGrid selectedIcon={icon} onSelectIcon={setIcon} />
 *
 * // With search but no categories
 * <IconGrid
 *   selectedIcon={icon}
 *   onSelectIcon={setIcon}
 *   showSearch={true}
 *   showCategories={false}
 * />
 *
 * // Custom grid settings
 * <IconGrid
 *   columns={8}
 *   height={400}
 *   defaultCategory="common"
 * />
 */
export function IconGrid({
  selectedIcon,
  onSelectIcon,
  columns = 6,
  height = 300,
  showSearch = true,
  showCategories = true,
  defaultCategory = "common",
  className,
}: IconGridProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [category, setCategory] = React.useState<IconCategory>(defaultCategory);

  // Get filtered icons based on search and category
  const displayedIcons = React.useMemo(() => {
    return searchIconsInCategory(searchQuery, category);
  }, [searchQuery, category]);

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      )}

      {showCategories ? (
        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v as IconCategory)}
          className="w-full"
        >
          <ScrollArea className="w-full" type="scroll">
            <TabsList className="w-full justify-evenly h-8">
              {ICON_CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="text-xs capitalize px-2 h-6"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {ICON_CATEGORIES.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-2">
              <ScrollArea
                style={{ height: typeof height === "number" ? `${height}px` : height }}
              >
                <div className="grid gap-1 p-1" style={gridStyle}>
                  {(cat === category ? displayedIcons : ICONS_BY_CATEGORY[cat]).map((iconName) => (
                    <IconButton
                      key={iconName}
                      name={iconName}
                      selected={selectedIcon === iconName}
                      onClick={() => onSelectIcon?.(iconName)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <ScrollArea
          style={{ height: typeof height === "number" ? `${height}px` : height }}
        >
          <div className="grid gap-1 p-1" style={gridStyle}>
            {displayedIcons.map((iconName) => (
              <IconButton
                key={iconName}
                name={iconName}
                selected={selectedIcon === iconName}
                onClick={() => onSelectIcon?.(iconName)}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {displayedIcons.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No icons found for "{searchQuery}"
        </div>
      )}
    </div>
  );
}

interface IconButtonProps {
  name: string;
  selected?: boolean;
  onClick?: () => void;
}

function IconButton({ name, selected, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center p-2 rounded-md transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        selected && "bg-primary text-primary-foreground"
      )}
      onClick={onClick}
      title={name}
    >
      <DynamicIcon name={name} className="h-5 w-5" />
    </button>
  );
}

export default IconGrid;
