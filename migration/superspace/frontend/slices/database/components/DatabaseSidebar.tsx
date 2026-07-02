"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SecondarySidebarLayout,
  type SecondarySidebarItem,
} from "@/frontend/shared/ui";
import { SearchBox } from "@/frontend/shared/ui";
import { getIconComponent, getColorValue } from "@/frontend/shared/ui";
import { parseTableData } from "../utils/table-parser";
import {
  Copy,
  Layers,
  MoreHorizontal,
  Pencil,
  Plus,
  Table2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DatabaseTable } from "../types";
import { useDatabaseSearch } from "../hooks/useDatabase";

export interface DatabaseSidebarProps {
  workspaceId: Id<"workspaces">;
  tables: DatabaseTable[];
  selectedTableId?: Id<"dbTables"> | null;
  onSelectTable: (tableId: Id<"dbTables">) => void;
  onCreateTable: () => void;
  isLoading?: boolean;
  onRenameTable?: (table: DatabaseTable) => void;
  onCopyTableId?: (table: DatabaseTable) => void;
  onDuplicateTable?: (table: DatabaseTable) => void;
  onDeleteTable?: (table: DatabaseTable) => void;
}

export function DatabaseSidebar({
  workspaceId,
  tables,
  selectedTableId,
  onSelectTable,
  onCreateTable,
  isLoading,
  onRenameTable,
  onCopyTableId,
  onDuplicateTable,
  onDeleteTable,
}: DatabaseSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { results } = useDatabaseSearch(workspaceId, searchTerm);

  const hasActions =
    onRenameTable || onCopyTableId || onDuplicateTable || onDeleteTable;

  const buildItem = (table: DatabaseTable): SecondarySidebarItem => {
    const active = String(table._id) === (selectedTableId ? String(selectedTableId) : "");

    const handleAction =
      (action?: (table: DatabaseTable) => void) =>
      (event: React.MouseEvent | React.KeyboardEvent) => {
        event.stopPropagation();
        action?.(table);
      };

    // Parse table data (name and icon) using DRY utility
    const {
      name: tableName,
      icon: { iconName, iconColor },
    } = parseTableData(table);

    const IconComponent = getIconComponent(iconName) ?? Table2;
    const colorValue = getColorValue(iconColor);

    return {
      id: String(table._id),
      label: tableName,
      description: table.description ?? undefined,
      active,
      icon: () => (
        <IconComponent
          className="size-4"
          style={{
            color: colorValue === "default" ? "currentColor" : colorValue,
          }}
        />
      ),
      onClick: () => onSelectTable(table._id as Id<"dbTables">),
      trailing: hasActions ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <span
              role="button"
              tabIndex={0}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition",
                "hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
              )}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.stopPropagation();
                }
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-48"
            onClick={(event) => event.stopPropagation()}
          >
            {onRenameTable ? (
              <DropdownMenuItem onClick={(event) => handleAction(onRenameTable)(event)}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
            ) : null}
            {onCopyTableId ? (
              <DropdownMenuItem onClick={(event) => handleAction(onCopyTableId)(event)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
            ) : null}
            {onDuplicateTable ? (
              <DropdownMenuItem
                onClick={(event) => handleAction(onDuplicateTable)(event)}
              >
                <Layers className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
            ) : null}
            {onDeleteTable ? (
              <>
                {(onRenameTable || onCopyTableId || onDuplicateTable) ? (
                  <DropdownMenuSeparator />
                ) : null}
                <DropdownMenuItem
                  onClick={(event) => handleAction(onDeleteTable)(event)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : undefined,
    };
  };

  const visibleTables = searchTerm ? results : tables;

  return (
    <SecondarySidebarLayout.Sidebar
      header={
        <div className="flex flex-col gap-3 border-b bg-background p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground">
              Databases
            </h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={onCreateTable}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
          <SearchBox
            placeholder="Search databases"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
      }
      sections={[
        {
          id: "tables",
          items: visibleTables.map((table) => buildItem(table)),
          content: !visibleTables.length ? (
            <div className="p-4 text-sm text-muted-foreground">
              {searchTerm
                ? "No databases matched your search."
                : isLoading
                  ? "Loading databases…"
                  : "Create a database to get started."}
            </div>
          ) : undefined,
        },
      ]}
    />
  );
}
