/**
 * Builder Clipboard Hook
 *
 * Provides copy/cut/paste functionality for canvas nodes and edges.
 * Supports keyboard shortcuts: Ctrl+C, Ctrl+X, Ctrl+V
 *
 * Features:
 * - Copy selected nodes with their edges
 * - Paste with automatic position offset
 * - Cut (copy + delete)
 * - Cross-canvas paste support
 *
 * @example
 * const { copy, cut, paste, canPaste } = useBuilderClipboard(nodes, edges);
 */

import { useCallback, useState, useEffect } from 'react';
import type { Node, Edge } from 'reactflow';
import { uid } from '@/lib/utils';

export interface ClipboardData {
    nodes: Node<any>[];
    edges: Edge[];
    copiedAt: number;
}

export interface UseBuilderClipboardOptions {
    /** Offset for pasted nodes (to avoid overlapping) */
    pasteOffset?: { x: number; y: number };
    /** Enable keyboard shortcuts */
    enableShortcuts?: boolean;
}

export interface UseBuilderClipboardReturn {
    /** Copy selected nodes and their connecting edges */
    copy: (selectedNodeIds: string[]) => void;
    /** Cut selected nodes (copy + delete) */
    cut: (selectedNodeIds: string[]) => { nodes: Node<any>[]; edges: Edge[] };
    /** Paste clipboard contents, returns new nodes and edges with fresh IDs */
    paste: () => { nodes: Node<any>[]; edges: Edge[] } | null;
    /** Whether there's content to paste */
    canPaste: boolean;
    /** Number of items in clipboard */
    clipboardCount: number;
    /** Clear clipboard */
    clear: () => void;
}

const DEFAULT_OPTIONS: Required<UseBuilderClipboardOptions> = {
    pasteOffset: { x: 50, y: 50 },
    enableShortcuts: true,
};

/**
 * Hook for managing clipboard operations in the builder
 */
export function useBuilderClipboard(
    nodes: Node<any>[],
    edges: Edge[],
    options: UseBuilderClipboardOptions = {}
): UseBuilderClipboardReturn {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

    // Track paste count to increment offset for multiple pastes
    const [pasteCount, setPasteCount] = useState(0);

    // Copy selected nodes and their connecting edges
    const copy = useCallback((selectedNodeIds: string[]) => {
        if (selectedNodeIds.length === 0) return;

        const selectedSet = new Set(selectedNodeIds);

        // Get selected nodes
        const selectedNodes = nodes.filter(n => selectedSet.has(n.id));

        // Get edges that connect selected nodes (both source and target must be selected)
        const selectedEdges = edges.filter(
            e => selectedSet.has(e.source) && selectedSet.has(e.target)
        );

        setClipboard({
            nodes: selectedNodes,
            edges: selectedEdges,
            copiedAt: Date.now(),
        });

        // Reset paste count on new copy
        setPasteCount(0);
    }, [nodes, edges]);

    // Cut: copy + return nodes/edges for deletion
    const cut = useCallback((selectedNodeIds: string[]): { nodes: Node<any>[]; edges: Edge[] } => {
        if (selectedNodeIds.length === 0) {
            return { nodes: [], edges: [] };
        }

        const selectedSet = new Set(selectedNodeIds);

        // Get selected nodes
        const selectedNodes = nodes.filter(n => selectedSet.has(n.id));

        // Get ALL edges connected to selected nodes (for deletion)
        const connectedEdges = edges.filter(
            e => selectedSet.has(e.source) || selectedSet.has(e.target)
        );

        // Copy to clipboard (only internal edges)
        copy(selectedNodeIds);

        return {
            nodes: selectedNodes,
            edges: connectedEdges,
        };
    }, [nodes, edges, copy]);

    // Paste: create new nodes/edges with fresh IDs and offset positions
    const paste = useCallback((): { nodes: Node<any>[]; edges: Edge[] } | null => {
        if (!clipboard || clipboard.nodes.length === 0) return null;

        // Calculate offset based on paste count
        const offset = {
            x: opts.pasteOffset.x * (pasteCount + 1),
            y: opts.pasteOffset.y * (pasteCount + 1),
        };

        // Create ID mapping for new nodes
        const idMapping = new Map<string, string>();
        clipboard.nodes.forEach(node => {
            idMapping.set(node.id, uid());
        });

        // Create new nodes with fresh IDs and offset positions
        const newNodes: Node<any>[] = clipboard.nodes.map(node => ({
            ...node,
            id: idMapping.get(node.id)!,
            position: {
                x: node.position.x + offset.x,
                y: node.position.y + offset.y,
            },
            selected: true, // Select pasted nodes
            data: {
                ...node.data,
                // Deep clone props to avoid reference issues
                props: { ...node.data?.props },
            },
        }));

        // Create new edges with updated source/target IDs
        const newEdges: Edge[] = clipboard.edges.map(edge => ({
            ...edge,
            id: uid(),
            source: idMapping.get(edge.source)!,
            target: idMapping.get(edge.target)!,
        }));

        // Increment paste count for next paste offset
        setPasteCount(prev => prev + 1);

        return { nodes: newNodes, edges: newEdges };
    }, [clipboard, opts.pasteOffset, pasteCount]);

    // Clear clipboard
    const clear = useCallback(() => {
        setClipboard(null);
        setPasteCount(0);
    }, []);

    return {
        copy,
        cut,
        paste,
        canPaste: clipboard !== null && clipboard.nodes.length > 0,
        clipboardCount: clipboard?.nodes.length || 0,
        clear,
    };
}

/**
 * Hook for clipboard keyboard shortcuts (Ctrl+C, Ctrl+X, Ctrl+V)
 * Should be used alongside useBuilderClipboard
 */
export function useBuilderClipboardShortcuts(
    onCopy: () => void,
    onCut: () => void,
    onPaste: () => void,
    enabled: boolean = true
) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl/Cmd key
            const isCtrl = e.ctrlKey || e.metaKey;

            // Skip if focus is in an input field
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            if (isCtrl && e.key === 'c') {
                e.preventDefault();
                onCopy();
            }

            if (isCtrl && e.key === 'x') {
                e.preventDefault();
                onCut();
            }

            if (isCtrl && e.key === 'v') {
                e.preventDefault();
                onPaste();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCopy, onCut, onPaste, enabled]);
}

export default useBuilderClipboard;
