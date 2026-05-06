/**
 * ChildrenManager — Layers Panel
 *
 * Shows children of the selected node in order.
 * - Click child row  → select that child on the canvas
 * - Pencil icon      → inline rename (saves to node.data.label)
 * - Reorder up/down
 * - Remove child edge (detach)
 * - Explode layout block: detaches all children and removes the wrapper node
 */
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import { ArrowUp, ArrowDown, X, Ungroup, Pencil, MousePointer, Layers, Info, ChevronRight } from 'lucide-react';
import { useSharedCanvas } from '../canvas/core';

// Node types whose children can be released as independent nodes (ungroup/explode)
const EXPLODABLE_TYPES = new Set([
    'threeColumn', 'twoColumn', 'grid', 'flex', 'row', 'column', 'div', 'section', 'container', 'accordion',
    'card', 'groupNode',
]);

// Color/badge mapping for common node types
const NODE_TYPE_COLORS: Record<string, { bg: string; text: string; short: string }> = {
    text: { bg: 'bg-sky-500/10', text: 'text-sky-500', short: 'T' },
    heading: { bg: 'bg-sky-500/10', text: 'text-sky-500', short: 'H' },
    button: { bg: 'bg-violet-500/10', text: 'text-violet-500', short: 'Btn' },
    image: { bg: 'bg-green-500/10', text: 'text-green-500', short: 'Img' },
    input: { bg: 'bg-amber-500/10', text: 'text-amber-500', short: 'In' },
    select: { bg: 'bg-amber-500/10', text: 'text-amber-500', short: 'Sel' },
    row: { bg: 'bg-orange-500/10', text: 'text-orange-500', short: 'Row' },
    column: { bg: 'bg-orange-500/10', text: 'text-orange-500', short: 'Col' },
    flex: { bg: 'bg-orange-500/10', text: 'text-orange-500', short: 'Flx' },
    grid: { bg: 'bg-orange-500/10', text: 'text-orange-500', short: 'Grd' },
    section: { bg: 'bg-slate-500/10', text: 'text-slate-400', short: 'Sec' },
    container: { bg: 'bg-slate-500/10', text: 'text-slate-400', short: 'Cnt' },
    card: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', short: 'Crd' },
    div: { bg: 'bg-muted', text: 'text-muted-foreground', short: 'Div' },
};

function NodeTypeBadge({ type }: { type: string }) {
    const color = NODE_TYPE_COLORS[type?.toLowerCase()] ?? { bg: 'bg-muted', text: 'text-muted-foreground', short: type?.slice(0, 3) || '?' };
    return (
        <span className={`inline-flex items-center px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide shrink-0 ${color.bg} ${color.text}`}>
            {color.short}
        </span>
    );
}

interface ChildrenManagerProps {
    selectedNode?: any | null;
}

export const ChildrenManager: React.FC<ChildrenManagerProps> = ({ selectedNode: propNode }) => {
    const {
        childrenOrdered,
        nodes,
        edges,
        reorderChild,
        removeChildEdge,
        setNodes,
        setEdges,
        selectedNodeId: ctxSelectedId,
        setSelectedNodeId,
        selectedNode: ctxNode,
    } = useSharedCanvas();

    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [showHelp, setShowHelp] = useState(false);

    const node = propNode ?? ctxNode;
    const isExternalBinding = Boolean(propNode && propNode.id !== ctxSelectedId);
    const visibleChildren = useMemo(() => {
        if (!node) return [];

        // If this panel is bound to external propNode, build children from graph
        // so panel content always matches the node being inspected.
        if (propNode && propNode.id !== ctxSelectedId) {
            const childEdges = (edges ?? []).filter((e: any) => e.source === node.id);
            const byId = new Map((nodes ?? []).map((n: any) => [n.id, n]));
            return childEdges
                .map((e: any) => {
                    const child = byId.get(e.target);
                    if (!child) return null;
                    return {
                        ...child,
                        edgeId: e.id,
                        label: child.data?.label || child.data?.comp || child.data?.type || child.id,
                    };
                })
                .filter(Boolean);
        }

        return childrenOrdered ?? [];
    }, [node, propNode, ctxSelectedId, edges, nodes, childrenOrdered]);

    const nodeType = node?.data?.comp || node?.data?.type || '';
    const canExplode = EXPLODABLE_TYPES.has(nodeType) && visibleChildren.length > 0;
    const childCount = visibleChildren.length;

    const handleExplode = () => {
        if (!node || !visibleChildren.length) return;
        const confirmed = window.confirm(
            `Ungroup "${nodeType}"?\n\nThis will release ${visibleChildren.length} child node(s) as independent nodes on the canvas. The wrapper node will be removed but all its children will remain.`
        );
        if (!confirmed) return;

        const parentId = node.id;
        setEdges((eds: any[]) =>
            eds.filter((e: any) => !(e.source === parentId || e.target === parentId))
        );
        setNodes((ns: any[]) => ns.filter((n: any) => n.id !== parentId));
    };

    const startRename = (e: React.MouseEvent, c: any) => {
        e.stopPropagation();
        setRenamingId(c.id);
        setRenameValue(c.label || c.data?.label || '');
    };

    const commitRename = (id: string) => {
        const trimmed = renameValue.trim();
        if (trimmed) {
            setNodes((ns: any[]) =>
                ns.map((n: any) =>
                    n.id === id ? { ...n, data: { ...n.data, label: trimmed } } : n
                )
            );
        }
        setRenamingId(null);
    };

    return (
        <div className="p-3 space-y-3">
            {/* Header with count + help toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">Layers</span>
                    {childCount > 0 && (
                        <span className="text-[9px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-bold">
                            {childCount}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setShowHelp(h => !h)}
                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    title="How layers work"
                >
                    <Info className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Help card */}
            {showHelp && (
                <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1.5 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">How Layers work</p>
                    <ul className="space-y-1 list-none">
                        {[
                            '↕ Drag up/down to reorder children inside this element',
                            '✏ Click the pencil to rename any layer',
                            '✕ Detach removes the connection (child stays on canvas)',
                            'Ungroup releases all children as independent elements',
                        ].map(t => (
                            <li key={t} className="flex gap-1.5"><span className="shrink-0">·</span>{t}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Explode / Ungroup button for layout wrappers */}
            {canExplode && (
                <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                    <div className="flex items-start gap-2">
                        <Ungroup className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                Layout container: <span className="font-bold">{nodeType}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                Has {visibleChildren.length} nested element{visibleChildren.length !== 1 ? 's' : ''}. Ungroup to make them independent.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-xs border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/60"
                        onClick={handleExplode}
                    >
                        <Ungroup size={13} />
                        Ungroup &amp; Release Children
                    </Button>
                </div>
            )}

            {/* Children list */}
            <div className="space-y-1">
                {visibleChildren.length ? (
                    <>
                        {/* Column headers */}
                        <div className="grid grid-cols-[1fr_auto] gap-2 px-2 mb-1">
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-bold">Element</span>
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-bold">Actions</span>
                        </div>
                        {visibleChildren.map((c: any, idx: number) => {
                            const isSelected = c.id === ctxSelectedId;
                            const isRenaming = renamingId === c.id;
                            const compType = c.data?.comp || c.type || '';
                            return (
                                <div
                                    key={c.id}
                                    className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-blue-500/60 bg-blue-500/8 text-blue-300 shadow-sm'
                                            : 'border-border/50 bg-card hover:bg-accent/30 hover:border-border text-foreground'
                                    }`}
                                    onClick={() => setSelectedNodeId(c.id)}
                                    title={`Click to select "${c.label}" on canvas`}
                                >
                                    {/* Order number */}
                                    <span className={`text-[9px] font-mono shrink-0 w-4 text-center ${isSelected ? 'text-blue-400' : 'text-muted-foreground/40'}`}>
                                        {idx + 1}
                                    </span>

                                    {/* Type badge */}
                                    <NodeTypeBadge type={compType} />

                                    {/* Select indicator */}
                                    <MousePointer
                                        size={8}
                                        className={`shrink-0 ${isSelected ? 'text-blue-400' : 'text-muted-foreground/20'}`}
                                    />

                                    {/* Label / inline rename input */}
                                    {isRenaming ? (
                                        <input
                                            autoFocus
                                            value={renameValue}
                                            onChange={e => setRenameValue(e.target.value)}
                                            onBlur={() => commitRename(c.id)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') commitRename(c.id);
                                                if (e.key === 'Escape') setRenamingId(null);
                                            }}
                                            onClick={e => e.stopPropagation()}
                                            className="flex-1 min-w-0 bg-transparent border-b border-primary/60 outline-none text-xs"
                                        />
                                    ) : (
                                        <span className="flex-1 min-w-0 truncate font-medium">{c.label}</span>
                                    )}

                                    {/* Action buttons — stop propagation so they don't trigger select */}
                                    <div
                                        className="flex items-center gap-0.5 shrink-0"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-5 w-5 opacity-40 hover:opacity-100"
                                            onClick={e => startRename(e, c)}
                                            title="Rename"
                                        >
                                            <Pencil size={9} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-5 w-5 opacity-40 hover:opacity-100"
                                            onClick={() => reorderChild(idx, idx - 1)}
                                            disabled={isExternalBinding || idx === 0}
                                            aria-disabled={isExternalBinding}
                                            title="Move up"
                                        >
                                            <ArrowUp size={10} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-5 w-5 opacity-40 hover:opacity-100"
                                            onClick={() => reorderChild(idx, idx + 1)}
                                            disabled={isExternalBinding || idx === visibleChildren.length - 1}
                                            aria-disabled={isExternalBinding}
                                            title="Move down"
                                        >
                                            <ArrowDown size={10} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-5 w-5 text-destructive/50 hover:text-destructive opacity-40 hover:opacity-100"
                                            onClick={() => removeChildEdge(c.edgeId)}
                                            disabled={isExternalBinding}
                                            aria-disabled={isExternalBinding}
                                            title="Detach (remove connection)"
                                        >
                                            <X size={10} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Legend */}
                        <p className="text-[9px] text-muted-foreground/40 text-center pt-1">
                            {childCount} element{childCount !== 1 ? 's' : ''} · Click to select · ✏ to rename
                        </p>
                    </>
                ) : (
                    /* Empty state */
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground">No nested elements</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[180px]">
                                Connect nodes from this element&apos;s output handle to nest them here
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/30 text-[10px] text-muted-foreground">
                            <ChevronRight className="h-3 w-3 shrink-0" />
                            <span>Drag a component from the Library panel</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
