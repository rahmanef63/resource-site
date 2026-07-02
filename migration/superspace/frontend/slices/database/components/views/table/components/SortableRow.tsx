"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Row } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { flexRender } from "@tanstack/react-table";

interface SortableRowProps<TData> {
  row: Row<TData>;
  className?: string;
}

export function SortableRow<TData>({ row, className }: SortableRowProps<TData>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
        isDragging && "opacity-50",
      )}
      data-state={row.getIsSelected() ? "selected" : undefined}
    >
      {row.getVisibleCells().map((cell) => {
        // Special handling for drag handle cell
        if (cell.column.id === "drag") {
          return (
            <td key={cell.id} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
              <div
                {...attributes}
                {...listeners}
                className="flex h-full items-center justify-center cursor-grab active:cursor-grabbing"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </td>
          );
        }

        return (
          <td key={cell.id} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}
