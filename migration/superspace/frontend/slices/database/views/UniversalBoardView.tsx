/**
 * Universal Board View
 *
 * Refactored to use the shared Kanban component.
 */

import React, { useMemo } from "react";
import {
  KanbanProvider,
  KanbanBoard,
  // KanbanColumn removed as it doesn't exist
  KanbanCard,
  KanbanCards,
  KanbanHeader,
} from "@/frontend/shared/ui/components/data-views/board";
import type { DragEndEvent } from "@/frontend/shared/ui/components/data-views/board";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewToolbar } from '@/frontend/shared/ui/layout/header';
import type { PropertyRowData, PropertyColumnConfig } from "./table-columns";
import { BoardCard } from "./board-card";
import { matchesRecordSearch } from "./search-utils";

export interface BoardGroup {
  id: string;
  title: string;
  color?: string;
}

export interface UniversalBoardViewProps {
  /** Board data rows */
  data: PropertyRowData[];

  /** Property column configurations */
  properties: PropertyColumnConfig[];

  /** Property key to group by */
  groupBy: string;

  /** Custom groups (for select/status properties) */
  groups?: BoardGroup[];

  /** Callback when card is moved to different group */
  onCardMove?: (cardId: string, newGroupId: string) => Promise<void>;

  /** Callback when card is clicked */
  onCardClick?: (cardId: string) => void;

  /** Callback when card is deleted */
  onCardDelete?: (cardId: string) => Promise<void>;

  /** Callback when add card is clicked */
  onCardAdd?: (groupId: string) => Promise<void>;

  /** Whether to show empty groups */
  showEmptyGroups?: boolean;

  /** Whether drag is disabled */
  disableDrag?: boolean;

  /** Custom CSS class */
  className?: string;

  /** Callback when groupBy property changes */
  onGroupByChange?: (propertyKey: string) => void;
}

type BoardItem = {
  id: string;
  name: string;
  column: string;
  originalData: PropertyRowData;
}

type BoardColumnType = {
  id: string;
  name: string;
  color?: string;
}

export function UniversalBoardView({
  data,
  properties,
  groupBy,
  groups: customGroups,
  onCardMove,
  onCardClick,
  onCardDelete,
  onCardAdd,
  showEmptyGroups = true,
  disableDrag = false,
  className,
  onGroupByChange,
}: UniversalBoardViewProps) {
  // Determine groups based on property type
  const groups = useMemo<BoardGroup[]>(() => {
    if (customGroups) {
      return customGroups;
    }

    // Auto-generate groups from data if not provided
    const uniqueValues = new Set<string>();
    data.forEach((row) => {
      const value = row.properties[groupBy];
      if (value !== null && value !== undefined) {
        if (typeof value === "object" && "name" in value) {
          // Status property
          uniqueValues.add(value.name);
        } else if (typeof value === "string") {
          uniqueValues.add(value);
        }
      }
    });

    const generatedGroups = Array.from(uniqueValues).map((value) => ({
      id: value,
      title: value,
    }));

    return generatedGroups;
  }, [customGroups, data, groupBy]);

  // Transform data for KanbanProvider
  const kanbanData = useMemo<BoardItem[]>(() => {
    return data.map((row) => {
      const value = row.properties[groupBy];
      let columnId: string;

      if (value === null || value === undefined) {
        columnId = "__ungrouped__";
      } else if (typeof value === "object" && "name" in value) {
        columnId = value.name;
      } else if (typeof value === "string") {
        columnId = value;
      } else {
        columnId = "__ungrouped__";
      }

      const groupExists = groups.some(g => g.id === columnId);
      if (!groupExists && customGroups) {
        columnId = "__ungrouped__";
      }

      return {
        id: row.id,
        name: row.id,
        column: columnId,
        originalData: row,
      };
    });
  }, [data, groupBy, groups, customGroups]);

  // Prepare columns for KanbanProvider
  const kanbanColumns = useMemo<BoardColumnType[]>(() => {
    const baseColumns = groups.map((g) => ({
      id: g.id,
      name: g.title,
      color: g.color,
    }));

    const visibleColumns = showEmptyGroups
      ? baseColumns
      : baseColumns.filter((column) =>
          kanbanData.some((item) => item.column === column.id)
        );

    const hasUngroupedItems = kanbanData.some(
      (item) => item.column === "__ungrouped__"
    );
    if (hasUngroupedItems || (showEmptyGroups && data.length === 0)) {
      if (!visibleColumns.find((column) => column.id === "__ungrouped__")) {
        visibleColumns.push({
          id: "__ungrouped__",
          name: "No Status",
          color: undefined,
        });
      }
    }

    return visibleColumns;
  }, [groups, kanbanData, showEmptyGroups, data.length]);

  // Get groupable properties
  const groupableProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.type === "select" ||
          p.type === "status" ||
          p.type === "multi_select"
      ),
    [properties]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const cardId = active.id as string;
    const newGroupId = over.id as string;

    let targetColumnId = newGroupId;
    const targetCard = kanbanData.find(c => c.id === newGroupId);
    if (targetCard) {
      targetColumnId = targetCard.column;
    }

    if (onCardMove) {
      onCardMove(cardId, targetColumnId);
    }
  };

  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');

  // Apply search filter
  const filteredKanbanData = useMemo(() => {
    if (!searchQuery.trim()) return kanbanData;

    return kanbanData.filter((item) =>
      matchesRecordSearch(item.originalData, searchQuery)
    );
  }, [kanbanData, searchQuery]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar via ViewToolbar */}
      <ViewToolbar
        // Search
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        enableSearch={true}

        // Sorting disabled for Board, we use groupBy instead
        enableSorting={false}

        // Custom leading actions: Group By
        leadingActions={
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Group by:</span>
            <Select
              value={groupBy}
              onValueChange={onGroupByChange}
              disabled={!onGroupByChange}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groupableProperties.map((prop) => (
                  <SelectItem key={prop.key} value={prop.key}>
                    {prop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground ml-2">
              {data.length} items across {kanbanColumns.length} columns
            </span>
          </div>
        }

        // Add card not in toolbar, it's per-column
        onAddItem={undefined}
        trailingActions={
          <Button variant="ghost" size="sm">
            View settings
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden p-4">
        <KanbanProvider<BoardItem, BoardColumnType>
          columns={kanbanColumns}
          data={filteredKanbanData}
          onDragEnd={handleDragEnd}
        >
          {(column) => (
            <KanbanBoard key={column.id} id={column.id} className="w-[300px] min-w-[300px]">
              <KanbanHeader className="flex items-center justify-between border-b p-3">
                <div className="flex items-center gap-2">
                  {column.color && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: column.color }} />}
                  <span className="font-medium">{column.name}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {filteredKanbanData.filter(d => d.column === column.id).length}
                  </span>
                </div>
                {onCardAdd && (
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" onClick={() => onCardAdd(column.id)}>
                    <Plus className="h-4 w-4" />
                    Add card
                  </Button>
                )}
              </KanbanHeader>
              <KanbanCards<BoardItem> id={column.id}>
                {(item) => (
                  <KanbanCard<BoardItem>
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    column={item.column}
                    originalData={item.originalData}
                    className="p-0 bg-transparent shadow-none hover:shadow-none border-0"
                  >
                    <BoardCard
                      data={item.originalData as PropertyRowData}
                      properties={properties}
                      groupBy={groupBy}
                      disableDrag={disableDrag}
                      onClick={() => onCardClick?.(item.id)}
                      onDelete={(id) => onCardDelete?.(id)}
                    />
                  </KanbanCard>
                )}
              </KanbanCards>
              {filteredKanbanData.filter((item) => item.column === column.id).length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">No items</div>
              )}
            </KanbanBoard>
          )}
        </KanbanProvider>
      </div>
    </div>
  );
}

export default UniversalBoardView;
