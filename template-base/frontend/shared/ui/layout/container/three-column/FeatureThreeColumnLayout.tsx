/**
 * Feature Three Column Layout
 * 
 * A standardized wrapper around ThreeColumnLayoutAdvanced for feature pages.
 * Enforces consistency in:
 * - Panel headers and controls
 * - Search / Sort / Filter toolbars
 * - Layout structure (Left list, Center content, Right inspector)
 */

"use client";

import * as React from "react";
import { ThreeColumnLayoutAdvanced } from "./ThreeColumnLayout";
import { PanelLeftClose } from "lucide-react";
import { useThreeColumnLayoutSafe } from "./context";
import { HeaderControls } from "@/frontend/shared/ui/layout/header";
import { UniversalToolbar, toolType, type SortToolParams } from "@/frontend/shared/ui/layout/toolbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./components/EmptyState";
import { RightPanelTabs } from "./components/RightPanelTabs";
import type {
    ThreeColumnLayoutAdvancedProps,
    MobileNavigation,
    RightPanelConfig,
    RightPanelMode,
    EmptyStateConfig,
    LoadingStateConfig,
    HeaderActionsConfig,
} from "./types";

export interface FeatureThreeColumnLayoutProps extends Omit<ThreeColumnLayoutAdvancedProps, "left" | "center" | "right"> {
    // Left Panel Configuration
    sidebarTitle?: string;
    sidebarStats?: string; // e.g. "12 of 50 documents"
    sidebarActions?: React.ReactNode; // e.g. View toggle, New button
    sidebarContent: React.ReactNode;

    // Search & Filter configuration
    searchProps?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
    };
    sortOptions?: SortToolParams;
    filterOptions?: React.ReactNode;
    breadcrumbs?: React.ReactNode;

    // Center Panel Configuration
    mainContent: React.ReactNode;
    mainHeader?: React.ReactNode;

    // Right Panel Configuration
    inspector?: React.ReactNode; // If null, right panel is hidden/empty

    // ✨ NEW: Mobile Configuration
    /** Mobile navigation configuration */
    mobile?: MobileNavigation;
    /** Custom mobile header component (overrides default) */
    mobileHeaderComponent?: React.ComponentType<any>;

    // ✨ NEW: Right Panel Configuration
    /** Right panel mode configuration */
    rightPanelConfig?: RightPanelConfig;
    /** Current right panel mode */
    rightPanelMode?: RightPanelMode;
    /** Right panel mode change callback */
    onRightPanelModeChange?: (mode: RightPanelMode) => void;

    // ✨ NEW: Empty States
    /** Empty state configuration for sidebar */
    sidebarEmptyState?: EmptyStateConfig;
    /** Empty state configuration for center panel */
    centerEmptyState?: EmptyStateConfig;

    // ✨ NEW: Loading States
    /** Loading state configuration */
    loading?: LoadingStateConfig;

    // ✨ NEW: Header Actions (standardize AI/Settings buttons)
    /** Header actions configuration */
    headerActions?: HeaderActionsConfig;
}

export function FeatureThreeColumnLayout({
    // Feature Props
    sidebarTitle,
    sidebarStats,
    sidebarActions,
    sidebarContent,
    searchProps,
    sortOptions,
    filterOptions,
    breadcrumbs,
    mainContent,
    mainHeader,
    inspector,

    // New Props
    mobile,
    mobileHeaderComponent,
    rightPanelConfig,
    rightPanelMode,
    onRightPanelModeChange,
    sidebarEmptyState,
    centerEmptyState,
    loading,
    headerActions,

    // Layout Props
    className,
    preset,
    leftLabel: leftLabelProp,
    centerLabel: centerLabelProp,
    rightLabel: rightLabelProp,
    leftHeader: leftHeaderProp,
    showLeftCollapseButton: showLeftCollapseButtonProp,
    ...layoutProps
}: FeatureThreeColumnLayoutProps) {

    // Check if we have any header content to show
    const hasHeaderContent = sidebarTitle || sidebarStats || sidebarActions || searchProps || sortOptions || filterOptions || breadcrumbs;
    const hasTopRow = sidebarTitle || sidebarStats || sidebarActions;
    const hasBottomRow = searchProps || sortOptions || filterOptions || breadcrumbs;

    const effectiveLeftLabel = leftLabelProp ?? sidebarTitle ?? "Sidebar"
    const effectiveCenterLabel = centerLabelProp ?? "Main Content"
    const effectiveRightLabel = rightLabelProp ?? "Inspector"
    const effectivePreset = preset ?? "feature"

    // ============================================================================
    // LEFT HEADER (uses layout context for collapse)
    // ============================================================================
    function SidebarHeader() {
        const layout = useThreeColumnLayoutSafe()

        return (
            <div className="flex-shrink-0 border-b bg-muted/30">
                {hasTopRow && (
                    <div className="flex items-center">
                        {/* Full-width clickable trigger: icon + title + stats */}
                        <button
                            className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 hover:bg-muted/50 transition-colors duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                            onClick={layout ? layout.toggleLeft : undefined}
                            aria-label={layout ? `Collapse ${effectiveLeftLabel} panel` : undefined}
                            aria-expanded={layout ? true : undefined}
                            disabled={!layout}
                        >
                            <PanelLeftClose className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            {sidebarTitle && (
                                <span className="font-medium text-sm text-foreground truncate">{sidebarTitle}</span>
                            )}
                            {sidebarStats && (
                                <span className="text-sm text-muted-foreground truncate">{sidebarStats}</span>
                            )}
                        </button>

                        {/* Independent action buttons — not part of collapse trigger */}
                        {sidebarActions && (
                            <div className="flex items-center gap-1 pr-2 flex-shrink-0">
                                {sidebarActions}
                            </div>
                        )}
                    </div>
                )}

                {hasBottomRow && (
                    <div className="px-3 pb-2 space-y-2">
                        {searchProps && (
                            <HeaderControls
                                searchable
                                searchProps={{
                                    value: searchProps.value,
                                    onChange: searchProps.onChange,
                                    placeholder: searchProps.placeholder,
                                }}
                                responsive
                            />
                        )}

                        {sortOptions && (
                            <UniversalToolbar
                                tools={[
                                    {
                                        id: "sort-tool" as any,
                                        type: toolType.sort,
                                        params: sortOptions,
                                    },
                                ]}
                                spacing="compact"
                                background="transparent"
                            />
                        )}

                        {filterOptions}

                        {breadcrumbs && (
                            <div className="pt-1">
                                {breadcrumbs}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // LEFT PANEL BODY (scrollable)
    const leftPanelBody = React.useMemo(() => {
        if (loading?.sidebar) {
            return (
                <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        // Check if content is empty (simple check for empty array or falsy)
        const isEmpty = React.isValidElement(sidebarContent)
            ? false
            : !sidebarContent || (Array.isArray(sidebarContent) && sidebarContent.length === 0)

        if (isEmpty && sidebarEmptyState) {
            return <EmptyState {...sidebarEmptyState} />
        }

        return (
            <ScrollArea className="h-full">
                <div className="p-2">
                    {sidebarContent}
                </div>
            </ScrollArea>
        )
    }, [sidebarContent, loading?.sidebar, sidebarEmptyState])

    // ============================================================================
    // CENTER PANEL
    // ============================================================================
    const centerPanel = React.useMemo(() => {
        if (loading?.center) {
            return (
                <div className="h-full flex flex-col p-6">
                    <div className="border-b border-border pb-6 mb-6">
                        <Skeleton className="h-8 w-96 mb-4" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                        <Skeleton className="h-6 w-4/6" />
                    </div>
                </div>
            )
        }

        const content = (
            <div className="flex flex-col h-full min-h-0">
                {mainHeader && (
                    <div className="flex-shrink-0 border-b bg-muted/30">
                        {mainHeader}
                    </div>
                )}
                <div className="flex-1 min-h-0 overflow-auto">
                    {centerEmptyState && !mainContent ? (
                        <EmptyState {...centerEmptyState} />
                    ) : (
                        mainContent
                    )}
                </div>
            </div>
        )

        return content
    }, [mainHeader, mainContent, loading?.center, centerEmptyState]);

    // ============================================================================
    // RIGHT PANEL (with optional tabs)
    // ============================================================================
    const rightPanel = React.useMemo(() => {
        if (!inspector) return null

        if (loading?.right) {
            return (
                <div className="p-4 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            )
        }

        // If right panel config is provided, wrap with tabs
        if (rightPanelConfig?.modes && rightPanelConfig.modes.length > 0) {
            return (
                <RightPanelTabs
                    modes={rightPanelConfig.modes}
                    currentMode={rightPanelMode || rightPanelConfig.defaultMode || "inspector"}
                    onModeChange={onRightPanelModeChange || (() => { })}
                    collapsible={rightPanelConfig.collapsible}
                >
                    {inspector}
                </RightPanelTabs>
            )
        }

        return inspector
    }, [inspector, rightPanelConfig, rightPanelMode, onRightPanelModeChange, loading?.right])

    return (
        <ThreeColumnLayoutAdvanced
            className={className}
            preset={effectivePreset}
            leftHeader={hasHeaderContent ? <SidebarHeader /> : leftHeaderProp}
            showLeftCollapseButton={hasHeaderContent ? (showLeftCollapseButtonProp ?? false) : showLeftCollapseButtonProp}
            leftLabel={effectiveLeftLabel}
            centerLabel={effectiveCenterLabel}
            rightLabel={effectiveRightLabel}
            left={leftPanelBody}
            center={centerPanel}
            right={rightPanel}
            {...layoutProps}
        />
    );
}
