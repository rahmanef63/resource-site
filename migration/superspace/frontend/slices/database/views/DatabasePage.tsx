"use client";

import React, { Suspense, useEffect, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useSearchParams } from "next/navigation";
import {
  DatabaseShell,
  EmptyState,
  DatabaseSidebarSkeleton,
  DatabaseContentSkeleton,
} from "../components";
import { CreateDatabaseDialog } from "../dialog";
import { Button } from "@/components/ui/button";
import {
  useDatabasePageHandlers,
} from "../hooks";
import {
  DatabaseSidebarContainer,
  DatabaseContentContainer,
} from "../containers";
import {
  DATABASE_STARTER_TEMPLATES,
  type DatabaseStarterTemplateId,
} from "../constants/templates";

export interface DatabasePageProps {
  workspaceId: Id<"workspaces">;
}

export function DatabasePage({ workspaceId }: DatabasePageProps) {
  const searchParams = useSearchParams();
  const [selectedTableId, setSelectedTableId] = useState<Id<"dbTables"> | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTemplateId, setCreateTemplateId] = useState<DatabaseStarterTemplateId>("blank");

  // Handlers - pass null values for now, will be updated by content container
  const handlers = useDatabasePageHandlers({
    record: null,
    activeDbView: null,
    mapping: null,
    viewModel: null,
    selectedTableId,
    activeView: "table",
    setActiveView: () => {},
    setSelectedTableId,
  });

  // Cleanup column sizing timeout on unmount
  useEffect(
    () => () => {
      if (handlers.columnSizingUpdateRef.current) {
        clearTimeout(handlers.columnSizingUpdateRef.current);
      }
    },
    [handlers.columnSizingUpdateRef]
  );

  useEffect(() => {
    const tableIdParam = searchParams.get("tableId");
    if (!tableIdParam) return;
    if (selectedTableId === tableIdParam) return;
    setSelectedTableId(tableIdParam as Id<"dbTables">);
  }, [searchParams, selectedTableId]);

  // Render sidebar with Suspense
  const sidebar = (
    <Suspense fallback={<DatabaseSidebarSkeleton />}>
      <DatabaseSidebarContainer
        workspaceId={workspaceId}
        selectedTableId={selectedTableId}
        onSelectTable={setSelectedTableId}
        onCreateTable={() => setIsCreateOpen(true)}
        onRenameTable={handlers.handleRenameTable}
        onCopyTableId={handlers.handleCopyTableId}
        onDuplicateTable={handlers.handleDuplicateTable}
        onDeleteTable={handlers.handleDeleteTable}
      />
    </Suspense>
  );

  // Render content based on selection
  let content: React.ReactNode = null;

  if (!selectedTableId) {
    const quickTemplates = DATABASE_STARTER_TEMPLATES.filter((t) => t.id !== "blank");
    content = (
      <EmptyState
        title="No databases yet"
        description="Create a database to start capturing and organizing your work."
        actionLabel="Create database"
        onAction={() => {
          setCreateTemplateId("blank");
          setIsCreateOpen(true);
        }}
      >
        {quickTemplates.map((template) => (
          <Button
            key={template.id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setCreateTemplateId(template.id);
              setIsCreateOpen(true);
            }}
          >
            Start with {template.name}
          </Button>
        ))}
      </EmptyState>
    );
  } else {
    content = (
      <Suspense fallback={<DatabaseContentSkeleton />}>
        <DatabaseContentContainer
          workspaceId={workspaceId}
          tableId={selectedTableId}
          handlers={handlers}
        />
      </Suspense>
    );
  }

  const header = !selectedTableId ? (
    <div className="border-b border-dashed px-6 py-4">
      <h1 className="text-xl font-semibold text-muted-foreground">
        Select or create a database
      </h1>
      <p className="text-sm text-muted-foreground">
        Choose a database from the sidebar to explore roadmap views.
      </p>
    </div>
  ) : null;

  return (
    <>
      <DatabaseShell header={header} sidebar={sidebar}>
        {content}
      </DatabaseShell>

      <CreateDatabaseDialog
        workspaceId={workspaceId}
        open={isCreateOpen}
        initialTemplateId={createTemplateId}
        onOpenChange={(next) => {
          setIsCreateOpen(next);
          if (!next) {
            setCreateTemplateId("blank");
          }
        }}
        onCreated={(tableId) => {
          setSelectedTableId(tableId);
          setIsCreateOpen(false);
          setCreateTemplateId("blank");
        }}
      />
    </>
  );
}
