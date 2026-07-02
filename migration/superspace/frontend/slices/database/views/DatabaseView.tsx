"use client";

import { useCallback, useState, useEffect, useMemo, Suspense } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import {
    Database,
    Plus,
    Info,
    Sparkles,
    ArrowUpDown,
    Table2,
    Calendar,
    Columns3,
    List,
    GanttChart,
} from "lucide-react";

// Layout & Shared UI
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column";
import { StandardFeatureHeader } from "@/frontend/shared/ui/layout/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeatureExportImport } from "@/frontend/shared/foundation/utils/data";
import { FeatureAIAssistant } from "@/frontend/shared/ui/ai-assistant/FeatureAIAssistant";
import { FeatureSkeletons } from "@/frontend/shared/ui/components/loading/FeatureSkeletons";
import { cn } from "@/lib/utils";

// Database Components
import { DatabaseTree } from "./DatabaseTree";
import { DatabaseRightPanel } from "./DatabaseRightPanel";
import { DatabaseViewRenderer, DatabaseToolbar } from "../components";
import { CreateDatabaseDialog } from "../dialog";

// Hooks
import { useDatabaseSidebar, useDatabaseRecord } from "../hooks/useDatabase";
import { useDatabaseViewState, useDatabasePageHandlers } from "../hooks";
import { convertFieldsToProperties } from "../lib/field-converter";
import { findActiveDbView } from "../utils";

// Types
import type { DatabaseTable, DatabaseViewType, DatabaseFeature } from "../types";
import type { Filter as UIFilter } from "@/components/ui/filters";
import type { ConvexQueryFilter } from "../filters";

// View icons
const VIEW_ICONS = {
    table: Table2,
    calendar: Calendar,
    kanban: Columns3,
    list: List,
    gantt: GanttChart,
} as const;

export interface DatabaseFeatureViewProps {
    workspaceId: Id<"workspaces">;
    initialTableId?: Id<"dbTables"> | null;
    storageKey?: string;
}

export function DatabaseFeatureView({
    workspaceId,
    initialTableId = null,
    storageKey = "database-layout",
}: DatabaseFeatureViewProps) {
    const [isMounted, setIsMounted] = useState(false);

    // Selection state
    const [selectedTableId, setSelectedTableId] = useState<Id<"dbTables"> | null>(initialTableId);
    const [selectedRowId, setSelectedRowId] = useState<Id<"dbRows"> | null>(null);

    // Layout State
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true);
    const [rightPanelMode, setRightPanelMode] = useState<"inspector" | "ai">("inspector");

    // Dialog State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Filter state
    const [filters, setFilters] = useState<UIFilter[]>([]);
    const [filterQuery, setFilterQuery] = useState<ConvexQueryFilter | null>(null);

    // Fetch tables list
    const { tables, isLoading } = useDatabaseSidebar(workspaceId);

    // Fetch selected table record
    const { record, viewModel, mapping, isLoading: isRecordLoading } = useDatabaseRecord(
        selectedTableId
    );

    // View state
    const { activeView, setActiveView, defaultViewType } = useDatabaseViewState({
        record,
        selectedTableId,
    });

    // Active view document
    const activeDbView = useMemo(() => {
        if (!record) return null;
        return findActiveDbView(record.views, activeView);
    }, [record, activeView]);

    // Properties for filters
    const properties = useMemo(() => {
        if (!record?.fields) return [];
        return convertFieldsToProperties(record.fields);
    }, [record?.fields]);

    // Handlers
    const handlers = useDatabasePageHandlers({
        record,
        activeDbView,
        mapping,
        viewModel,
        selectedTableId,
        activeView,
        setActiveView,
        setSelectedTableId,
    });

    // Filter tables by search
    const filteredTables = useMemo(() => {
        if (!tables) return [];
        if (!search.trim()) return tables;
        return tables.filter((table) =>
            table.name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [tables, search]);

    // Set isMounted on client (used by DatabaseRightPanel for SSR safety)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Handle filter changes
    const handleFiltersChange = (newFilters: UIFilter[], query: ConvexQueryFilter) => {
        setFilters(newFilters);
        setFilterQuery(query);
    };

    // Handle row selection
    const handleRowClick = useCallback((row: DatabaseFeature) => {
        setSelectedRowId(row.id as Id<"dbRows">);
        setRightPanelCollapsed(false);
        setRightPanelMode("inspector");
    }, []);

    // Get selected row data
    const selectedRow = useMemo(() => {
        if (!selectedRowId || !viewModel?.features) return null;
        return viewModel.features.find((f) => f.id === selectedRowId) ?? null;
    }, [selectedRowId, viewModel?.features]);

    // ============================================================================
    // Header Components
    // ============================================================================

    // View toggles
    const headerToggles = useMemo(
        () => (
            <div className="flex bg-muted/50 p-1 rounded-lg border h-8 items-center shrink-0">
                {(["table", "calendar", "kanban", "list", "gantt"] as const).map((view) => {
                    const Icon = VIEW_ICONS[view];
                    return (
                        <button
                            key={view}
                            onClick={() => setActiveView(view)}
                            className={cn(
                                "px-2 py-0.5 text-xs font-medium rounded-md transition-all h-6 flex items-center gap-1",
                                activeView === view
                                    ? "bg-background text-foreground shadow-sm border border-border/50"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                            title={view.charAt(0).toUpperCase() + view.slice(1)}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </span>
                        </button>
                    );
                })}
            </div>
        ),
        [activeView, setActiveView]
    );

    // Actions
    const headerActions = useMemo(
        () => (
            <div className="flex items-center gap-2">
                {/* Export/Import */}
                <FeatureExportImport
                    featureId="database"
                    variant="dropdown"
                    className="h-8 w-8"
                    buttonVariant="ghost"
                    triggerIcon={<ArrowUpDown className="h-4 w-4" />}
                />

                {/* AI Assistant */}
                <Button
                    variant={rightPanelMode === "ai" && !rightPanelCollapsed ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                        setRightPanelMode("ai");
                        setRightPanelCollapsed(false);
                    }}
                    title="AI Assistant"
                >
                    <Sparkles className="h-4 w-4" />
                </Button>

                {/* New Database */}
                <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2 h-8 shrink-0">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Database</span>
                    <span className="sm:hidden">New</span>
                </Button>
            </div>
        ),
        [rightPanelMode, rightPanelCollapsed, selectedRow]
    );

    // Search config
    const searchConfig = useMemo(
        () => ({
            value: search,
            onChange: setSearch,
            placeholder: "Search databases...",
        }),
        [search]
    );

    // ============================================================================
    // Sidebar Content
    // ============================================================================

    const sidebarContent = useMemo(() => {
        if (isLoading) {
            return (
                <div className="flex h-32 items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            );
        }
        if (filteredTables.length === 0) {
            return (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    {tables?.length === 0 ? (
                        <div className="space-y-3">
                            <p>No databases yet.</p>
                            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Database
                            </Button>
                        </div>
                    ) : (
                        <p>No databases match your search.</p>
                    )}
                </div>
            );
        }
        return (
            <DatabaseTree
                tables={filteredTables}
                selectedId={selectedTableId}
                onSelect={setSelectedTableId}
                onRename={handlers.handleRenameTableInline}
                onUpdateIcon={handlers.handleUpdateTableIcon}
                onDuplicate={handlers.handleDuplicateTable}
                onDelete={handlers.handleDeleteTable}
            />
        );
    }, [
        isLoading,
        filteredTables,
        tables,
        selectedTableId,
        handlers,
    ]);

    // ============================================================================
    // Main Content
    // ============================================================================

    const mainContent = useMemo(() => {
        if (!selectedTableId) {
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center space-y-4 px-4">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                            <Database className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                No database selected
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Select a database from the sidebar or create a new one
                            </p>
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Database
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (isRecordLoading || !record || !viewModel) {
            return (
                <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            );
        }

        return (
            <div className="flex flex-col h-full">
                {/* View-specific toolbar */}
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

                {/* View content */}
                <div className="flex-1 min-h-0 overflow-auto">
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
                </div>
            </div>
        );
    }, [
        selectedTableId,
        isRecordLoading,
        record,
        viewModel,
        activeView,
        activeDbView,
        mapping,
        properties,
        filters,
        filterQuery,
        defaultViewType,
        handlers,
    ]);

    // ============================================================================
    // Inspector Content
    // ============================================================================

    const inspector = (
        <DatabaseRightPanel
            selectedRow={selectedRow}
            fields={record?.fields ?? []}
            isMounted={isMounted}
            onClose={() => setRightPanelCollapsed(true)}
            mode={rightPanelMode}
            onModeChange={setRightPanelMode}
            onUpdateRow={handlers.handleUpdateCell}
        />
    );

    // ============================================================================
    // Render
    // ============================================================================

    // Common Header
    const commonHeader = (
        <StandardFeatureHeader
            title="Database"
            search={searchConfig}
            toggles={headerToggles}
            actions={headerActions}
            className="border-b"
        />
    );

    // Three-column layout handles mobile automatically via stackAt (feature preset = 480px)
    return (
        <div className="flex h-full flex-col overflow-hidden bg-background">
            {commonHeader}

            <div className="flex-1 min-h-0">
                <FeatureThreeColumnLayout
                    preset="feature"
                    // Sidebar
                    sidebarTitle="Databases"
                    sidebarStats={`${filteredTables.length} databases`}
                    sidebarActions={
                        <Button aria-label="Add" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    }
                    sidebarContent={sidebarContent}
                    // Center
                    mainContent={mainContent}
                    mainHeader={
                        <div className="flex items-center justify-between px-4 py-2 border-b h-10 bg-muted/10">
                            <span className="text-sm font-medium truncate">
                                {record?.table?.name ?? "Select a database"}
                            </span>
                            {selectedRow && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant={rightPanelMode === "inspector" && !rightPanelCollapsed ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                            setRightPanelMode("inspector");
                                            setRightPanelCollapsed(false);
                                        }}
                                    >
                                        <Info className="h-3.5 w-3.5 mr-1" />
                                        Inspector
                                    </Button>
                                    <Button
                                        variant={rightPanelMode === "ai" && !rightPanelCollapsed ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                            setRightPanelMode("ai");
                                            setRightPanelCollapsed(false);
                                        }}
                                    >
                                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                                        AI
                                    </Button>
                                </div>
                            )}
                        </div>
                    }
                    // Right
                    inspector={inspector}
                    // Layout Props
                    storageKey={storageKey}
                    rightCollapsed={rightPanelCollapsed}
                    onRightCollapsedChange={setRightPanelCollapsed}
                    className="border-t-0"
                />
            </div>

            <CreateDatabaseDialog
                workspaceId={workspaceId}
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onCreated={(tableId) => {
                    setSelectedTableId(tableId);
                    setIsCreateOpen(false);
                }}
            />
        </div>
    );
}
