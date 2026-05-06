"use client";

import {
  DndContext,
  type DragEndEvent,
  rectIntersection,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type { DragEndEvent } from "@dnd-kit/core";

export type ListStatus = {
  id: string;
  name: string;
  color: string;
};

export type ListFeature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: ListStatus;
};

export type ListItemsProps<T = any> = {
  className?: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
};

export const ListItems = <T,>({
  className,
  items,
  renderItem,
}: ListItemsProps<T>) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
};

export type ListGroupProps = HTMLAttributes<HTMLDivElement> & {
  id: string;
  status?: ListStatus;
  count?: number;
};

export const ListGroup = ({
  id,
  className,
  status,
  count,
  children,
  ...props
}: ListGroupProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "space-y-2 rounded-lg transition-colors p-2",
        isOver && "bg-muted/50",
        className
      )}
      {...props}
    >
      {status && (
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <span className="font-medium text-sm">{status.name}</span>
            <span className="text-xs text-muted-foreground">{count}</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export type ListItemProps = HTMLAttributes<HTMLDivElement> & {
  id: string;
  disabled?: boolean;
};

export const ListItem = ({
  className,
  id,
  children,
  disabled,
  ...props
}: ListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex cursor-grab items-center gap-2 rounded-md border bg-background p-2 shadow-sm touch-none",
        isDragging && "cursor-grabbing opacity-50 z-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export type ListProviderProps = {
  children: ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  className?: string;
};

export const ListProvider = ({
  children,
  onDragEnd,
  className,
}: ListProviderProps) => (
  <DndContext
    collisionDetection={rectIntersection}
    modifiers={[restrictToVerticalAxis]}
    onDragEnd={onDragEnd}
  >
    <div className={cn("flex size-full flex-col", className)}>{children}</div>
  </DndContext>
);
