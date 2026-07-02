/**
 * Board Column Component
 * 
 * Droppable column for kanban board.
 * Displays cards grouped by a property value.
 */

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BoardCard } from "./board-card";
import type { PropertyRowData, PropertyColumnConfig } from "./table-columns";

export interface BoardColumnProps {
  /** Column ID (group value) */
  id: string;

  /** Column title */
  title: string;

  /** Column color (for status/select) */
  color?: string;

  /** Cards in this column */
  cards: PropertyRowData[];

  /** Properties to display on cards */
  properties: PropertyColumnConfig[];

  /** Group property key */
  groupBy: string;

  /** Callback when card is clicked */
  onCardClick?: (cardId: string) => void;

  /** Callback when card is deleted */
  onCardDelete?: (cardId: string) => void;

  /** Callback when add card is clicked */
  onAddCard?: (columnId: string) => void;

  /** Whether drag is disabled */
  disableDrag?: boolean;

  /** Custom CSS class */
  className?: string;
}

/**
 * Board Column Component
 */
export function BoardColumn({
  id,
  title,
  color,
  cards,
  properties,
  groupBy,
  onCardClick,
  onCardDelete,
  onAddCard,
  disableDrag = false,
  className,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // Extract hex color if it's a full color object
  const bgColor = color?.startsWith("#") ? color : undefined;

  return (
    <div className={cn("flex flex-col h-full min-w-[280px] max-w-[320px]", className)}>
      <Card className="flex flex-col h-full">
        {/* Column header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {bgColor && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: bgColor }}
                />
              )}
              <CardTitle className="text-sm font-semibold truncate">
                {title}
              </CardTitle>
              <Badge variant="secondary" className="ml-auto flex-shrink-0">
                {cards.length}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Column content - scrollable */}
        <CardContent
          ref={setNodeRef}
          className={cn(
            "flex-1 overflow-y-auto space-y-2 min-h-[200px]",
            isOver && "bg-accent/50 ring-2 ring-primary ring-inset"
          )}
        >
          <SortableContext
            items={cards.map((card) => card.id)}
            strategy={verticalListSortingStrategy}
          >
            {cards.map((card) => (
              <BoardCard
                key={card.id}
                data={card}
                properties={properties}
                groupBy={groupBy}
                onClick={onCardClick}
                onDelete={onCardDelete}
                disableDrag={disableDrag}
              />
            ))}
          </SortableContext>

          {/* Empty state */}
          {cards.length === 0 && (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No items
            </div>
          )}
        </CardContent>

        {/* Add card button */}
        {onAddCard && (
          <div className="p-3 pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => onAddCard(id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add card
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default BoardColumn;
