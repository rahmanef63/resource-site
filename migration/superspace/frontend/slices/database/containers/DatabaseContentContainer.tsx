"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useDatabaseRecord } from "../hooks/useDatabase";
import { useDatabaseViewState } from "../hooks";
import { DatabaseToolbar, DatabaseViewRenderer } from "../components";
import { DatabaseHeaderSection } from "../sections";
import { findActiveDbView } from "../utils";
import type { DatabaseViewType } from "../types";
import type { Filter as UIFilter } from "@/components/ui/filters";
import type { ConvexQueryFilter } from "../filters";
import { convertFieldsToProperties } from "../lib/field-converter";

interface DatabaseContentContainerProps {
  workspaceId: Id<"workspaces">;
  tableId: Id<"dbTables">;
  handlers: any; // Pass all handlers from parent
}

/**
 * Suspense-wrapped content container that fetches and displays database content
 * This component can be wrapped in Suspense to enable partial rendering
 */
export function DatabaseContentContainer({
  workspaceId,
  tableId,
  handlers,
}: DatabaseContentContainerProps) {
  const pathname = usePathname();
  const trackEvent = useMutation(api.features.analytics.mutations.trackEvent as any);
  const { record, viewModel, mapping, isLoading } = useDatabaseRecord(tableId);

  const { activeView, defaultViewType } = useDatabaseViewState({
    record,
    selectedTableId: tableId,
  });

  // Filter state
  const [filters, setFilters] = useState<UIFilter[]>([]);
  const [filterQuery, setFilterQuery] = useState<ConvexQueryFilter | null>(null);
  const hadFiltersRef = useRef(false);

  const activeDbView = useMemo(() => {
    if (!record) return null;
    return findActiveDbView(record.views, activeView);
  }, [record, activeView]);
  
  // Convert fields to properties
  const properties = useMemo(() => {
    if (!record?.fields) return [];
    return convertFieldsToProperties(record.fields);
  }, [record?.fields]);
  
  // Handle filter changes
  const handleFiltersChange = (newFilters: UIFilter[], query: ConvexQueryFilter) => {
    setFilters(newFilters);
    setFilterQuery(query);

    const hasFilters = newFilters.length > 0;
    if (hasFilters && !hadFiltersRef.current) {
      hadFiltersRef.current = true;
      void trackEvent({
        workspaceId,
        eventType: "database",
        eventName: "database.filter_applied",
        properties: {
          tableId,
          view: activeView,
          filterCount: newFilters.length,
        },
        metadata: {
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          referrer: typeof document !== "undefined" ? document.referrer : undefined,
          path: pathname ?? undefined,
        },
      }).catch((trackError: any) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[Database] analytics trackEvent failed", trackError);
        }
      });
    } else if (!hasFilters) {
      hadFiltersRef.current = false;
    }
  };

  if (isLoading || !viewModel || !record) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <DatabaseHeaderSection record={record} />
        <DatabaseToolbar
          activeView={activeView}
          onViewChange={handlers.handleViewChange}
          views={record.views}
          defaultViewType={defaultViewType}
          onMakeDefaultView={handlers.handleMakeDefaultView}
          onManageViews={handlers.handleManageViews}
          onCopyData={handlers.handleCopyData}
          onGetLink={handlers.handleGetLink}
          onExport={handlers.handleExport}
          onImport={handlers.handleImport}
          properties={properties}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>
      <DatabaseViewRenderer
        activeView={activeView}
        record={record}
        viewModel={viewModel}
        mapping={mapping}
        activeDbView={activeDbView}
        tableId={record.table._id}
        filterQuery={filterQuery}
        onAddRow={handlers.handleAddRow}
        onUpdateCell={handlers.handleUpdateCell}
        onDeleteRow={handlers.handleDeleteRow}
        onReorderRows={handlers.handleReorderRows}
        onAddProperty={handlers.handleAddProperty}
        onRenameField={handlers.handleRenameField}
        onToggleFieldRequired={handlers.handleToggleFieldRequired}
        onDeleteField={handlers.handleDeleteField}
        onUpdateFieldOptions={handlers.handleUpdateFieldOptions}
        onToggleFieldVisibility={handlers.handleToggleFieldVisibility}
        onReorderFields={handlers.handleReorderFields}
        onColumnSizingChange={handlers.handleColumnSizingChange}
        onStatusChange={handlers.handleStatusChange}
        onMoveDates={handlers.handleMoveDates}
      />
    </>
  );
}
