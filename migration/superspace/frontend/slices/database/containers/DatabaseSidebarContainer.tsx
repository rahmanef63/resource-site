"use client";

import { useMemo, useCallback } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useDatabaseSidebar } from "../hooks";
import { DatabaseSidebar } from "../components";
import type { DatabaseTable } from "../types";

interface DatabaseSidebarContainerProps {
  workspaceId: Id<"workspaces">;
  selectedTableId: Id<"dbTables"> | null;
  onSelectTable: (id: Id<"dbTables">) => void;
  onCreateTable: () => void;
  onRenameTable: (table: DatabaseTable) => Promise<void>;
  onCopyTableId: (table: DatabaseTable) => Promise<void>;
  onDuplicateTable: (table: DatabaseTable) => Promise<void>;
  onDeleteTable: (table: DatabaseTable) => Promise<void>;
}

/**
 * Suspense-wrapped sidebar container that fetches and displays database list
 * This component can be wrapped in Suspense to enable partial rendering
 */
export function DatabaseSidebarContainer({
  workspaceId,
  selectedTableId,
  onSelectTable,
  onCreateTable,
  onRenameTable,
  onCopyTableId,
  onDuplicateTable,
  onDeleteTable,
}: DatabaseSidebarContainerProps) {
  const { tables, isLoading } = useDatabaseSidebar(workspaceId);

  return (
    <DatabaseSidebar
      workspaceId={workspaceId}
      tables={tables}
      selectedTableId={selectedTableId}
      onSelectTable={onSelectTable}
      onCreateTable={onCreateTable}
      isLoading={isLoading}
      onRenameTable={onRenameTable}
      onCopyTableId={onCopyTableId}
      onDuplicateTable={onDuplicateTable}
      onDeleteTable={onDeleteTable}
    />
  );
}
