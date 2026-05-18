/**
 * Studio Page - Unified Visual Builder
 * 
 * Combines CMS Builder (UI widgets) and Automation (workflow nodes) into
 * a single canvas experience with mode switching and data binding.
 */

"use client";

import dynamic from 'next/dynamic';
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Id } from "@convex/_generated/dataModel";
import { useSharedCanvas } from '@/frontend/shared/builder';
import { StudioCanvasProvider } from '../canvas/StudioCanvasProvider';
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/components/ui/resizable';
import { Card, CardTitle, Button, Input, Label } from '@/components/ui';
import { cn, errorMessage } from '@/lib/utils';
import { MobileInspectorDrawer } from '@/frontend/shared/ui/layout/container/three-column/mobile/MobileInspectorDrawer';
import { FeatureThreeColumnLayout } from '@/frontend/shared/ui/layout/container/three-column';
import { MobileHeader } from '@/frontend/shared/ui/layout/header';

import { SharedCanvas } from '@/frontend/shared/ui';
import { CMSPreview } from '@/frontend/shared/ui';
import { UnifiedInspector } from '@/frontend/shared/builder';
import { ExecutionPanel } from '@/frontend/shared/builder/flows';
import { DnDProvider } from '@/frontend/shared/builder';
import { StudioIconProvider } from '../providers/StudioIconProvider';

import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { registerStudioComponents, registerStudioLibraryTabs, type StudioMode } from '../registry';
import {
    toN8nWorkflow,
    fromN8nWorkflow,
    legacyFlowToStudioFlow,
} from '../workflow/schema/n8n-converter';
import { createStudioDocument } from '../workflow/schema/studio-unified.types';

// Node types from both features
import { ShadcnNode } from '@/frontend/slices/studio/ui/slices/canvas/components/ShadcnNode';
import { GroupNode } from '@/frontend/slices/studio/ui/slices/canvas/components/GroupNode';
import { AutomationNode } from '@/frontend/slices/studio/components/AutomationNode';
import { resolveRendererRootId } from '@/frontend/slices/studio/ui/slices/renderer/components/Renderer';
import { toSchema } from '@/frontend/slices/studio/ui/hooks/useSchema';
import { fromSchema } from '@/frontend/slices/studio/ui/hooks/useSchemaParser';
import { schemaToHtml } from '@/frontend/slices/studio/lib/schemaToHtml';
import { toJpeg } from 'html-to-image';
import { useAutomationExecution } from '@/frontend/slices/studio/hooks/useAutomationExecution';
import { cmsTemplateProvider } from '@/frontend/slices/studio/ui/state/templateProvider';
import type { NodeTypes, EdgeTypes } from 'reactflow';

// Custom edge types for data/event binding
import { studioEdgeTypes } from '../connections';
import { FolderOpen, X, ArrowLeft, Layers3, Play, MoreHorizontal } from 'lucide-react';
import { NodeContextMenu } from '@/frontend/slices/studio/ui/slices/canvas/components/NodeContextMenu';

// ============================================================================
// Combined Node Types
// ============================================================================

const nodeTypes: NodeTypes = {
    shadcnNode: ShadcnNode,
    groupNode: GroupNode as any,
    automationNode: AutomationNode as any,
};

// Combined edge types (data binding + event binding)
const edgeTypes: EdgeTypes = {
    ...studioEdgeTypes,
};

// ============================================================================
// UI Components
// ============================================================================

import { StudioGlobalHeader } from '../views/header/StudioGlobalHeader';
import { StudioCanvasEmpty } from '../components/StudioCanvasEmpty';
import { StudioLeftPanel } from '../views/StudioLeftPanel';
import { StudioRightPanel } from '../views/StudioRightPanel';
import { StudioBottomPanel } from '../views/StudioBottomPanel';
import { StudioBreadcrumbs } from '../views/StudioBreadcrumbs';
import { StudioEditorTabs, type ActiveView } from '../views/StudioEditorTabs';
import { JsonEditor } from '../components/JsonEditor';
import { StudioAIGenerateDialog } from '../components/StudioAIGenerateDialog';
const StudioDocsDialog = dynamic(
    () => import('../components/StudioDocsDialog').then((mod) => mod.StudioDocsDialog),
    { ssr: false, loading: () => null }
);
const ImportJsonDialog = dynamic(
    () => import('../components/ImportJsonDialog').then((mod) => mod.ImportJsonDialog),
    { ssr: false, loading: () => null }
);
const StudioConverterDialog = dynamic(
    () => import('../components/StudioConverterDialog').then((mod) => mod.StudioConverterDialog),
    { ssr: false, loading: () => null }
);

// ============================================================================
// Main Layout
// ============================================================================

interface StudioLayoutInnerProps {
    workspaceId?: Id<"workspaces">;
}

// workspaceId is reserved for future Convex-scoped persistence; not yet wired up.
const StudioLayoutInner: React.FC<StudioLayoutInnerProps> = ({ workspaceId: _workspaceId }) => {

    const isMobile = useIsMobile();

    const {
        nodes,
        edges,
        selectedNodeId,
        setSelectedNodeId,
        createNode,
        removeSelectedNode,
        setNodes,
        setEdges,
        isPinned,
        pin,
        unpin,
        pinnedIds,
        groupSelectedNodes,
        ungroupNode,
        focusedGroupId,
        enterGroup,
        exitGroup,
        clearAll,
        undo,
        redo,
        canUndo,
        canRedo,
        activeWs,
        activeRoute,
        menuOverride,
        focusNode,
        copy,
        paste,
        explodeBlock,
        deleteNodeWithReconnect,
    } = useSharedCanvas();

    // Context menu state
    const [contextMenu, setContextMenu] = useState<{
        x: number; y: number; nodeId: string; comp: string;
    } | null>(null);

    const handleNodeContextMenu = useCallback((e: React.MouseEvent, nodeId: string, comp: string) => {
        setContextMenu({ x: e.clientX, y: e.clientY, nodeId, comp });
    }, []);

    // When a node is selected from the preview panel, select it AND pan the canvas to it
    const handlePreviewSelectNode = useCallback((id: string) => {
        setSelectedNodeId(id);
        focusNode(id);
    }, [setSelectedNodeId, focusNode]);

    const {
        status,
        result,
        logs,
        steps,
        validate,
        run,
        stop,
        clearLogs,
        exportFlow,
        importFlow,
        clearFlow,
    } = useAutomationExecution();

    const { toast } = useToast();

    // State
    const [mode, setMode] = useState<StudioMode>('unified');
    const [leftTab, setLeftTab] = useState<'library' | 'templates' | 'settings'>('library');
    const [previewMode, setPreviewMode] = useState<'design' | 'interactive'>('design');
    // Phase C: viewport + bottom panel + center view state
    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [bottomOpen, setBottomOpen] = useState(false);
    const [activeView, setActiveView] = useState<ActiveView>('canvas');
    // Panel collapse state — managed here so the header (outside ThreeColumnLayoutAdvanced) can access it
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [rightCollapsed, setRightCollapsed] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [canvasAiOpen, setCanvasAiOpen] = useState(false);
    const previewRef = React.useRef<HTMLDivElement>(null);

    // Mobile-specific state
    const [mobileView, setMobileView] = useState<'library' | 'canvas' | 'inspector'>('library');
    const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
    // Mobile center sub-tab for stacked layout (replaces nested ResizablePanelGroup)
    const [mobileCenterTab, setMobileCenterTab] = useState<'canvas' | 'preview' | 'console'>('canvas');

    // Schema for preview
    const schema = useMemo(() => toSchema(nodes as any, edges as any), [nodes, edges]);

    // Handlers
    const handleAddComponent = useCallback((compKey: string) => {
        createNode(compKey);
    }, [createNode]);

    const handleImportTemplate = useCallback((template: any) => {
        if (!template) return;

        // Schema v0.4/v0.5 format: { version, root, nodes: Record<string, SchemaNode> }
        if (template.root && template.nodes && !Array.isArray(template.nodes)) {
            clearAll();
            const { nodes: importedNodes, edges: importedEdges } = fromSchema(template);
            setNodes(importedNodes as any);
            setEdges(importedEdges as any);
            return;
        }

        // Legacy ReactFlow array format: { nodes: Node[], edges: Edge[] }
        clearFlow();
        const idMap: Record<string, string> = {};
        const newNodes = (template.nodes || []).map((templateNode: any) => {
            const newId = `${templateNode.id}-${Date.now()}`;
            idMap[templateNode.id] = newId;
            return {
                id: newId,
                type: templateNode.type || 'automationNode',
                position: templateNode.position,
                data: templateNode.data,
            };
        });
        const newEdges = (template.edges || []).map((templateEdge: any, idx: number) => ({
            id: `e-${Date.now()}-${idx}`,
            source: idMap[templateEdge.source],
            target: idMap[templateEdge.target],
        }));
        setNodes(newNodes);
        setEdges(newEdges);
    }, [clearFlow, clearAll, setNodes, setEdges]);

    /** Download a JSON blob as a file */
    const downloadJson = useCallback((data: unknown, filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    /**
     * Export in Studio format (default) or n8n format.
     * - Workflow mode: exports StudioDocument (flow only) or n8n JSON
     * - UI mode: exports StudioDocument (ui-layout) with v0.5 metadata
     */
    const handleExport = useCallback((format: 'studio' | 'n8n' = 'studio') => {
        const ts = Date.now();
        if (mode === 'workflow') {
            if (format === 'n8n') {
                // Convert canvas nodes/edges → StudioFlow → n8n workflow JSON
                const studioFlow = legacyFlowToStudioFlow({
                    id: 'current-flow',
                    name: 'Automation Flow',
                    nodes: nodes as any[],
                    edges: edges as any[],
                });
                const n8nWorkflow = toN8nWorkflow(studioFlow);
                downloadJson(n8nWorkflow, `n8n-workflow-${ts}.json`);
            } else {
                exportFlow();
            }
        } else {
            // UI layout export with v0.5 metadata
            const projectSettings = (() => {
                try {
                    return JSON.parse(localStorage.getItem('studio-project-settings') ?? '{}');
                } catch { return {}; }
            })();
            const doc = createStudioDocument('ui-layout', {
                name: projectSettings.name || 'Studio Layout',
                description: projectSettings.description,
                author: projectSettings.author,
            });
            if (doc.ui) {
                doc.ui.version = '0.5';
                doc.ui.root = schema.root ?? [];
                doc.ui.nodes = schema.nodes ?? {};
            }
            downloadJson(doc, `studio-ui-${ts}.json`);
        }
    }, [mode, exportFlow, schema, nodes, edges, downloadJson]);

    /** Export schema as standalone HTML file */
    const handleExportHtml = useCallback(() => {
        const html = schemaToHtml(schema);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studio-ui-${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }, [schema]);

    /** Export preview panel as JPG screenshot */
    const handleExportJpg = useCallback(async () => {
        const previewHost = previewRef.current;
        if (!previewHost) {
            toast({ title: 'Export failed', description: 'Switch to Preview tab first.', variant: 'destructive' });
            return;
        }
        try {
            const iframe = previewHost.querySelector('iframe');
            const exportTarget = iframe?.contentDocument?.documentElement ?? previewHost;
            const dataUrl = await toJpeg(exportTarget as HTMLElement, { quality: 0.95, backgroundColor: '#ffffff' });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `studio-preview-${Date.now()}.jpg`;
            a.click();
        } catch {
            toast({ title: 'Export failed', description: 'Could not capture preview.', variant: 'destructive' });
        }
    }, [toast]);

    /** Open the import dialog */
    const handleImport = useCallback(() => {
        setImportDialogOpen(true);
    }, []);

    /** Handle UI layout import from ImportJsonDialog */
    const handleImportUI = useCallback((uiSchema: any) => {
        try {
            if (uiSchema.root && uiSchema.nodes) {
                const { nodes: importedNodes, edges: importedEdges } = fromSchema(uiSchema);
                setNodes(importedNodes as any);
                setEdges(importedEdges as any);
                toast({ title: 'Layout imported', description: `${Object.keys(uiSchema.nodes).length} nodes loaded.` });
            } else {
                toast({ title: 'Import failed', description: 'Missing root/nodes in schema.', variant: 'destructive' });
            }
        } catch (err) {
            toast({ title: 'Import failed', description: errorMessage(err, 'Unknown error'), variant: 'destructive' });
        }
    }, [setNodes, setEdges, toast]);

    /** Handle workflow / n8n import from ImportJsonDialog */
    const handleImportWorkflow = useCallback((text: string) => {
        try {
            const parsed = JSON.parse(text);
            const isN8n = Array.isArray(parsed.nodes) && parsed.connections !== undefined;
            const isStudioUnified = parsed.studioVersion && parsed.flow;

            if (isN8n) {
                const studioDoc = fromN8nWorkflow(parsed);
                if (studioDoc.flow) {
                    const legacyJson = JSON.stringify({
                        flow: {
                            id: studioDoc.metadata.id,
                            name: studioDoc.metadata.name,
                            nodes: studioDoc.flow.nodes.map(n => ({
                                id: n.id, type: 'automationNode', position: n.position,
                                data: { type: n.type, props: n.parameters, label: n.name, category: n.category },
                            })),
                            edges: studioDoc.flow.edges.map(e => ({
                                id: e.id, source: e.source, target: e.target,
                                data: { order: e.order, label: e.label, condition: e.condition },
                            })),
                        },
                        exportedAt: new Date().toISOString(),
                    });
                    importFlow(legacyJson);
                    toast({ title: 'n8n workflow imported' });
                }
            } else if (isStudioUnified) {
                const flow = parsed.flow;
                const legacyJson = JSON.stringify({
                    flow: {
                        id: parsed.metadata?.id ?? 'imported',
                        name: parsed.metadata?.name ?? 'Imported Flow',
                        nodes: flow.nodes.map((n: any) => ({
                            id: n.id, type: 'automationNode', position: n.position,
                            data: { type: n.type, props: n.parameters, label: n.name, category: n.category },
                        })),
                        edges: flow.edges.map((e: any) => ({
                            id: e.id, source: e.source, target: e.target,
                            data: { order: e.order, label: e.label, condition: e.condition },
                        })),
                    },
                    exportedAt: new Date().toISOString(),
                });
                importFlow(legacyJson);
                toast({ title: 'Studio workflow imported' });
            } else {
                importFlow(text);
                toast({ title: 'Workflow imported' });
            }
        } catch (err) {
            toast({ title: 'Import failed', description: errorMessage(err, 'Unknown error'), variant: 'destructive' });
        }
    }, [importFlow, toast]);

    const handleSchemaChange = useCallback((newJson: string) => {
        try {
            const parsed = JSON.parse(newJson);
            if (parsed.root && parsed.nodes) {
                const { nodes: newNodes, edges: newEdges } = fromSchema(parsed);
                setNodes(newNodes as any);
                setEdges(newEdges as any);
            }
        } catch {
            // ignore invalid JSON (user is mid-edit)
        }
    }, [setNodes, setEdges]);

    const handleClear = useCallback(() => {
        if (mode === 'workflow') {
            clearFlow();
        } else {
            clearAll();
        }
        toast({ title: 'Canvas cleared' });
    }, [mode, clearFlow, clearAll, toast]);

    // Mobile: navigate to canvas when a component is added from the library
    const handleAddComponentMobile = useCallback((compKey: string) => {
        createNode(compKey);
        if (isMobile) {
            setMobileView('canvas');
        }
    }, [createNode, isMobile]);

    // Mobile: navigate to canvas when a template is imported
    const handleImportTemplateMobile = useCallback((template: any) => {
        handleImportTemplate(template);
        if (isMobile) {
            setMobileView('canvas');
        }
    }, [handleImportTemplate, isMobile]);

    // Mobile: open inspector drawer when a node is selected on mobile
    const handleNodeSelectMobile = useCallback((nodeId: string | null) => {
        setSelectedNodeId(nodeId);
        if (isMobile && nodeId) {
            setMobileInspectorOpen(true);
        }
    }, [setSelectedNodeId, isMobile]);

    // Double-click on a node: enter group focus mode for groupNode, pin for shadcn widgets
    const handleNodeDoubleClick = useCallback((nodeId: string, nodeType: string) => {
        if (nodeType === 'groupNode' || nodeType === 'group') {
            enterGroup(nodeId);
        } else {
            // For regular nodes: toggle pin to preview (quick preview shortcut)
            if (isPinned(nodeId)) {
                unpin(nodeId);
            } else {
                pin(nodeId);
            }
        }
    }, [enterGroup, isPinned, pin, unpin]);

    // Document switch handler for StudioEditorTabs
    const handleSwitchDocument = useCallback((newNodes: any[], newEdges: any[]) => {
        clearAll();
        setNodes(newNodes);
        setEdges(newEdges);
    }, [clearAll, setNodes, setEdges]);

    const handleNewDocument = useCallback(() => {
        clearAll();
    }, [clearAll]);

    // Render canvas based on mode
    // In focus mode, show only the focused group's subtree
    // When canvas is empty show quick-start actions
    const renderCanvas = () => {
        const isEmpty = nodes.length === 0;
        return (
            <div className="h-full flex flex-col">
                <StudioBreadcrumbs selectedNodeId={selectedNodeId} />
                {focusedGroupId && (
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-b border-emerald-500/20 shrink-0">
                        <FolderOpen size={12} />
                        <span>Focus mode — editing group</span>
                        <button
                            className="underline hover:no-underline ml-auto flex items-center gap-1"
                            onClick={exitGroup}
                        >
                            <X size={10} /> Exit
                        </button>
                    </div>
                )}
                <div className="flex-1 min-h-0 relative">
                    {isEmpty ? (
                        <StudioCanvasEmpty
                            onAddElement={() => {
                                setLeftTab('library');
                                setLeftCollapsed(false);
                            }}
                            onChooseTemplate={() => {
                                setLeftTab('templates');
                                setLeftCollapsed(false);
                            }}
                            onAskAI={() => setCanvasAiOpen(true)}
                            onImport={handleImport}
                        />
                    ) : (
                        <SharedCanvas
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            onNodeSelect={setSelectedNodeId}
                            onNodeDoubleClick={handleNodeDoubleClick}
                            onNodeContextMenu={handleNodeContextMenu}
                            showLayoutControls={true}
                        />
                    )}
                </div>
            </div>
        );
    };

    // Render preview (UI mode)
    // When a node is pinned OR a group is focused, render its subtree directly
    const pinnedRootId = pinnedIds.length > 0 ? pinnedIds[0] : (focusedGroupId ?? null);
    const previewRootId = useMemo(() => resolveRendererRootId({
        schema,
        activeWs,
        activeRoute,
        menuOverride,
        rootId: pinnedRootId,
    }), [schema, activeWs, activeRoute, menuOverride, pinnedRootId]);

    // Viewport class for preview sizing
    const viewportClass = {
        desktop: 'w-full',
        tablet: 'max-w-[768px] mx-auto border-x border-border',
        mobile: 'max-w-[390px] mx-auto border-x border-border',
    }[viewport];
    const previewHtml = useMemo(() => schemaToHtml(schema, {
        designMode: previewMode === 'design',
        // selectedNodeId intentionally omitted — selection highlight is managed
        // locally by the iframe's JS (getPreviewBridge) to avoid full iframe
        // reload on every click which was causing annoying refresh in design mode.
        rootIds: previewRootId ? [previewRootId] : undefined,
    }), [schema, previewMode, previewRootId]);

    // renderCenter: the tabbed center workspace (canvas / preview / json / split views)
    const renderCenter = () => (
        <div className="h-full flex flex-col">
            <StudioEditorTabs
                currentNodes={nodes as any[]}
                currentEdges={edges as any[]}
                onSwitchDocument={handleSwitchDocument}
                onNewDocument={handleNewDocument}
                activeView={activeView}
                onViewChange={setActiveView}
            />
            <div className="flex-1 min-h-0">
                {activeView === 'canvas' && renderCanvas()}
                {activeView === 'preview' && (
                    <div className={cn('h-full overflow-auto', viewportClass)}>
                        {renderPreview()}
                    </div>
                )}
                {activeView === 'json' && (
                    <JsonEditor
                        jsonText={JSON.stringify(schema, null, 2)}
                        onSchemaChange={handleSchemaChange}
                    />
                )}
                {/* Split view: Canvas (left) + Preview (right) */}
                {activeView === 'split-preview' && (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        <ResizablePanel defaultSize={50} minSize={25}>
                            <Card className="h-full overflow-hidden border-0 rounded-none border-r border-border">
                                {renderCanvas()}
                            </Card>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50} minSize={20}>
                            <div className={cn('h-full overflow-auto', viewportClass)}>
                                {renderPreview()}
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
                {/* Split view: Canvas (left) + JSON (right) */}
                {activeView === 'split-json' && (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        <ResizablePanel defaultSize={50} minSize={25}>
                            <Card className="h-full overflow-hidden border-0 rounded-none border-r border-border">
                                {renderCanvas()}
                            </Card>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50} minSize={20}>
                            <JsonEditor
                                jsonText={JSON.stringify(schema, null, 2)}
                                onSchemaChange={handleSchemaChange}
                            />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
                {/* Split view: JSON (left) + Preview (right) — equal halves, live sync */}
                {activeView === 'json-preview' && (
                    <div className="h-full flex overflow-hidden">
                        <div className="flex-1 min-w-0 border-r border-border overflow-hidden">
                            <JsonEditor
                                jsonText={JSON.stringify(schema, null, 2)}
                                onSchemaChange={handleSchemaChange}
                            />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <div className={cn('h-full overflow-auto', viewportClass)}>
                                {renderPreview()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // renderPreview: used in both desktop center tab and mobile tabbed layout
    const renderPreview = () => (
        <div ref={previewRef} className="h-full">
            {pinnedRootId && (
                <div className="px-3 py-1 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
                    <span>Pinned preview: node {pinnedRootId.slice(0, 8)}</span>
                    <button
                        className="underline text-amber-700 dark:text-amber-400"
                        onClick={() => unpin(pinnedRootId)}
                    >
                        Unpin
                    </button>
                </div>
            )}
            <CMSPreview
                designMode={previewMode === 'design'}
                currentMode={previewMode}
                showSidebar={false}
                iframeSrcDoc={previewHtml}
                onFrameNodeSelect={previewMode === 'design' ? handlePreviewSelectNode : undefined}
            />
        </div>
    );

    // Render execution panel (Workflow mode)
    const renderExecutionPanel = () => (
        <ExecutionPanel
            result={result}
            logs={logs}
            steps={steps}
            onClearLogs={clearLogs}
        />
    );

    // renderCenter is kept for potential future use; desktop uses inline canvas in ResizablePanel.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _renderCenter = () => (
        <Card className="h-full overflow-hidden border-0 rounded-none">
            {renderCanvas()}
        </Card>
    );

    const [docsOpen, setDocsOpen] = React.useState(false);
    const [converterOpen, setConverterOpen] = React.useState(false);

    const handleOpenPreview = React.useCallback(() => {
        localStorage.setItem('studio-preview-schema', JSON.stringify(schema));
        const win = window.open('/dashboard/studio/preview', '_blank');
        if (!win) {
            // Popup blocked — fall back to a simple alert so the user knows what happened
            alert('Preview window was blocked by your browser.\nPlease allow popups for this site and try again.');
        }
    }, [schema]);

    // ========================================================================
    // Mobile: render center content as tabbed stacked layout (no ResizablePanelGroup)
    // ========================================================================
    const renderMobileCenter = () => {
        const showPreviewTab = mode === 'ui' || mode === 'unified';
        const showConsoleTab = mode === 'workflow' || mode === 'unified';

        return (
            <div className="h-full flex flex-col">
                {/* Tab bar for canvas / preview / console */}
                <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-muted/30 shrink-0">
                    <button
                        onClick={() => setMobileCenterTab('canvas')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                            mobileCenterTab === 'canvas'
                                ? 'bg-background border border-border font-medium text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Canvas
                    </button>
                    {showPreviewTab && (
                        <button
                            onClick={() => setMobileCenterTab('preview')}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                mobileCenterTab === 'preview'
                                    ? 'bg-background border border-border font-medium text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Preview
                        </button>
                    )}
                    {showConsoleTab && (
                        <button
                            onClick={() => setMobileCenterTab('console')}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                mobileCenterTab === 'console'
                                    ? 'bg-background border border-border font-medium text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Console
                        </button>
                    )}
                </div>
                {/* Tab content */}
                <div className="flex-1 min-h-0">
                    {mobileCenterTab === 'canvas' && renderCanvas()}
                    {mobileCenterTab === 'preview' && showPreviewTab && renderPreview()}
                    {mobileCenterTab === 'console' && showConsoleTab && renderExecutionPanel()}
                </div>
            </div>
        );
    };

    // ========================================================================
    // Mobile Layout
    // ========================================================================
    if (isMobile) {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                {/* Mobile: Library view */}
                {mobileView === 'library' && (
                    <>
                        <MobileHeader
                            title="Studio"
                            icon={Layers3}
                            showBack={false}
                            actions={
                                <div className="flex items-center gap-1">
                                    {/* Compact mode toggle */}
                                    <div className="flex items-center bg-muted rounded-md p-0.5">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setMode('ui')}
                                            className={cn('h-6 px-1.5 text-[10px] gap-0.5', mode === 'ui' && 'bg-emerald-500 text-white hover:bg-emerald-600')}
                                        >
                                            UI
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setMode('workflow')}
                                            className={cn('h-6 px-1.5 text-[10px] gap-0.5', mode === 'workflow' && 'bg-violet-500 text-white hover:bg-violet-600')}
                                        >
                                            Flow
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setMode('unified')}
                                            className={cn('h-6 px-1.5 text-[10px] gap-0.5', mode === 'unified' && 'bg-blue-500 text-white hover:bg-blue-600')}
                                        >
                                            All
                                        </Button>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setMobileView('canvas')} className="h-8 w-8 p-0">
                                        <Play size={14} />
                                    </Button>
                                </div>
                            }
                        />
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <StudioLeftPanel
                                mode={mode}
                                leftTab={leftTab}
                                setLeftTab={setLeftTab}
                                onAddComponent={handleAddComponentMobile}
                                onImportTemplate={handleImportTemplateMobile}
                            />
                        </div>
                        {/* Floating button to go to canvas */}
                        <button
                            onClick={() => setMobileView('canvas')}
                            className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
                        >
                            <Play size={16} />
                            <span className="text-sm font-medium">Canvas</span>
                        </button>
                    </>
                )}

                {/* Mobile: Canvas view */}
                {mobileView === 'canvas' && (
                    <>
                        <StudioGlobalHeader
                            mode={mode}
                            setMode={setMode}
                            undo={undo}
                            canUndo={canUndo}
                            redo={redo}
                            canRedo={canRedo}
                            handleExport={handleExport}
                            handleImport={handleImport}
                            handleClear={handleClear}
                            onOpenDocs={() => setDocsOpen(true)}
                            onOpenConverter={() => setConverterOpen(true)}
                            onOpenPreview={handleOpenPreview}
                            handleExportHtml={handleExportHtml}
                            handleExportJpg={handleExportJpg}
                            previewMode={previewMode}
                            setPreviewMode={setPreviewMode}
                            onGroup={groupSelectedNodes}
                            focusedGroupId={focusedGroupId}
                            onExitGroup={exitGroup}
                            isMobile={true}
                            mobileOnBack={() => setMobileView('library')}
                            mobileOnOpenInspector={() => setMobileInspectorOpen(true)}
                        />
                        <div className="flex-1 min-h-0 overflow-hidden">
                            {renderMobileCenter()}
                        </div>
                    </>
                )}

                {/* Mobile: Inspector as bottom drawer */}
                <MobileInspectorDrawer
                    open={mobileInspectorOpen}
                    onClose={() => setMobileInspectorOpen(false)}
                    title={selectedNodeId ? `Inspector — ${selectedNodeId.slice(0, 8)}` : 'Inspector'}
                >
                    <StudioRightPanel
                        mode={mode}
                        selectedNodeId={selectedNodeId}
                        isPinned={isPinned}
                        pin={pin}
                        unpin={unpin}
                        removeSelectedNode={removeSelectedNode}
                    />
                </MobileInspectorDrawer>

                {/* Shared dialogs — same as desktop */}
                {docsOpen && (
                    <React.Suspense fallback={null}>
                        <StudioDocsDialog open={docsOpen} onClose={() => setDocsOpen(false)} />
                    </React.Suspense>
                )}
                {converterOpen && (
                    <StudioConverterDialog
                        open={converterOpen}
                        onClose={() => setConverterOpen(false)}
                        schema={mode === 'ui' || mode === 'unified' ? schema : null}
                        onImportSchema={(s) => {
                            const { nodes: n, edges: e } = fromSchema(s);
                            setNodes(n as any);
                            setEdges(e as any);
                        }}
                    />
                )}
                <ImportJsonDialog
                    open={importDialogOpen}
                    onClose={() => setImportDialogOpen(false)}
                    onImportUI={handleImportUI}
                    onImportWorkflow={handleImportWorkflow}
                />
                <StudioAIGenerateDialog open={canvasAiOpen} onOpenChange={setCanvasAiOpen} onUndo={undo} />
                {contextMenu && (
                    <NodeContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        nodeId={contextMenu.nodeId}
                        comp={contextMenu.comp}
                        isPinned={isPinned(contextMenu.nodeId)}
                        onPin={() => isPinned(contextMenu.nodeId) ? unpin(contextMenu.nodeId) : pin(contextMenu.nodeId)}
                        onDuplicate={() => {
                            setSelectedNodeId(contextMenu.nodeId);
                            copy();
                            paste();
                        }}
                        onDelete={() => {
                            const edgesArr = edges as any[];
                            const hasParent = !!edgesArr?.find((e: any) => e.target === contextMenu.nodeId);
                            const hasChildren = !!edgesArr?.find((e: any) => e.source === contextMenu.nodeId);
                            deleteNodeWithReconnect(contextMenu.nodeId, hasParent && hasChildren);
                        }}
                        onExplode={() => explodeBlock(contextMenu.nodeId)}
                        onGroup={groupSelectedNodes}
                        onFocusNode={() => focusNode(contextMenu.nodeId)}
                        onClose={() => setContextMenu(null)}
                    />
                )}
            </div>
        );
    }

    // ========================================================================
    // Desktop Layout — Phase C: VSCode-style panels
    // Left panel full height, bottom panel beside left + below right
    // ========================================================================
    return (

        <div className="flex flex-col h-full overflow-hidden">
            {/* Single-row unified header — all controls in one bar */}
            <StudioGlobalHeader
                mode={mode}
                setMode={setMode}
                undo={undo}
                canUndo={canUndo}
                redo={redo}
                canRedo={canRedo}
                handleExport={handleExport}
                handleImport={handleImport}
                handleClear={handleClear}
                onOpenDocs={() => setDocsOpen(true)}
                onOpenConverter={() => setConverterOpen(true)}
                onOpenPreview={handleOpenPreview}
                handleExportHtml={handleExportHtml}
                handleExportJpg={handleExportJpg}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                onGroup={groupSelectedNodes}
                focusedGroupId={focusedGroupId}
                onExitGroup={exitGroup}
                viewport={viewport}
                setViewport={setViewport}
                onToggleBottom={() => setBottomOpen(v => !v)}
                activeView={activeView}
            />

            {/* Left/right panels are full-height: the vertical split lives inside the center column */}
            <FeatureThreeColumnLayout
                preset="ide"
                leftLabel="Library"
                centerLabel="Canvas"
                rightLabel="Inspector"
                leftCollapsed={leftCollapsed}
                rightCollapsed={rightCollapsed}
                onLeftCollapsedChange={setLeftCollapsed}
                onRightCollapsedChange={setRightCollapsed}
                className="flex-1 min-h-0"
                sidebarContent={
                    <StudioLeftPanel
                        mode={mode}
                        leftTab={leftTab}
                        setLeftTab={setLeftTab}
                        onAddComponent={handleAddComponent}
                        onImportTemplate={handleImportTemplate}
                    />
                }
                mainContent={
                    <div className="h-full flex flex-col overflow-hidden">
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <Card className="h-full overflow-hidden border-0 rounded-none">
                                {renderCenter()}
                            </Card>
                        </div>
                        <StudioBottomPanel
                            open={bottomOpen}
                            onToggle={() => setBottomOpen(v => !v)}
                            result={result}
                            logs={logs}
                            steps={steps}
                            onClearLogs={clearLogs}
                            mode={mode}
                        />
                    </div>
                }
                inspector={
                    <StudioRightPanel
                        mode={mode}
                        selectedNodeId={selectedNodeId}
                        isPinned={isPinned}
                        pin={pin}
                        unpin={unpin}
                        removeSelectedNode={removeSelectedNode}
                    />
                }
                rightWidth={280}
                persistState={true}
                storageKey="studio-layout"
                showCollapseButtons={true}
            />
            {docsOpen && (
                <React.Suspense fallback={null}>
                    <StudioDocsDialog open={docsOpen} onClose={() => setDocsOpen(false)} />
                </React.Suspense>
            )}
            {converterOpen && (
                <StudioConverterDialog
                    open={converterOpen}
                    onClose={() => setConverterOpen(false)}
                    schema={mode === 'ui' || mode === 'unified' ? schema : null}
                    onImportSchema={(s) => {
                        const { nodes: n, edges: e } = fromSchema(s);
                        setNodes(n as any);
                        setEdges(e as any);
                    }}
                />
            )}
            <ImportJsonDialog
                open={importDialogOpen}
                onClose={() => setImportDialogOpen(false)}
                onImportUI={handleImportUI}
                onImportWorkflow={handleImportWorkflow}
            />
            <StudioAIGenerateDialog open={canvasAiOpen} onOpenChange={setCanvasAiOpen} onUndo={undo} />

            {contextMenu && (
                <NodeContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    nodeId={contextMenu.nodeId}
                    comp={contextMenu.comp}
                    isPinned={isPinned(contextMenu.nodeId)}
                    onPin={() => isPinned(contextMenu.nodeId) ? unpin(contextMenu.nodeId) : pin(contextMenu.nodeId)}
                    onDuplicate={() => {
                        setSelectedNodeId(contextMenu.nodeId);
                        copy();
                        paste();
                    }}
                    onDelete={() => {
                        const edgesArr = edges as any[];
                        const hasParent = !!edgesArr?.find((e: any) => e.target === contextMenu.nodeId);
                        const hasChildren = !!edgesArr?.find((e: any) => e.source === contextMenu.nodeId);
                        deleteNodeWithReconnect(contextMenu.nodeId, hasParent && hasChildren);
                    }}
                    onExplode={() => explodeBlock(contextMenu.nodeId)}
                    onGroup={groupSelectedNodes}
                    onFocusNode={() => focusNode(contextMenu.nodeId)}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
};

// ============================================================================
// Exports
// ============================================================================

export interface StudioPageProps {
    workspaceId?: Id<"workspaces">;
}

class StudioErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }
    override render() {
        if (this.state.hasError) {
            return (
                <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="text-4xl">⚠️</div>
                    <div>
                        <p className="font-semibold text-destructive">Studio encountered an error</p>
                        <p className="text-sm text-muted-foreground mt-1">{this.state.error?.message}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false, error: null })}>
                        Try again
                    </Button>
                </div>
            );
        }
        return this.props.children;
    }
}

export const StudioPage: React.FC<StudioPageProps> = ({ workspaceId }) => {
    const { registerComponent, registerFeatureTabs } = useCrossFeatureRegistry();

    useEffect(() => {
        registerStudioComponents(registerComponent);
        registerStudioLibraryTabs(registerFeatureTabs);
    }, [registerComponent, registerFeatureTabs]);

    return (
        <StudioErrorBoundary>
            <StudioIconProvider>
                <StudioCanvasProvider initialMode="studio">
                    <DnDProvider>
                        <StudioLayoutInner workspaceId={workspaceId} />
                    </DnDProvider>
                </StudioCanvasProvider>
            </StudioIconProvider>
        </StudioErrorBoundary>
    );
};

export default StudioPage;
