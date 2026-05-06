/**
 * Builder History Hook
 *
 * Provides undo/redo functionality for canvas operations.
 * Integrates with SharedCanvasProvider to track node/edge changes.
 *
 * Features:
 * - Maximum 50 operations in history stack
 * - Debounced state snapshots to batch rapid changes
 * - Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)
 *
 * @example
 * const { undo, redo, canUndo, canRedo } = useBuilderHistory();
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import type { Node, Edge } from 'reactflow';

export interface HistorySnapshot {
    nodes: Node<any>[];
    edges: Edge[];
    timestamp: number;
}

export interface UseBuilderHistoryOptions {
    /** Maximum number of history entries to keep */
    maxHistory?: number;
    /** Debounce time in ms before recording a new snapshot */
    debounceMs?: number;
    /** Enable keyboard shortcuts */
    enableShortcuts?: boolean;
}

export interface UseBuilderHistoryReturn {
    /** Push a new snapshot to history */
    pushSnapshot: (snapshot: Omit<HistorySnapshot, 'timestamp'>) => void;
    /** Undo to previous state, returns the snapshot or null if nothing to undo */
    undo: () => HistorySnapshot | null;
    /** Redo to next state, returns the snapshot or null if nothing to redo */
    redo: () => HistorySnapshot | null;
    /** Whether undo is available */
    canUndo: boolean;
    /** Whether redo is available */
    canRedo: boolean;
    /** Number of items in undo stack */
    undoCount: number;
    /** Number of items in redo stack */
    redoCount: number;
    /** Clear all history */
    clear: () => void;
}

const DEFAULT_OPTIONS: Required<UseBuilderHistoryOptions> = {
    maxHistory: 50,
    debounceMs: 300,
    enableShortcuts: true,
};

/**
 * Hook for managing undo/redo history in the builder
 */
export function useBuilderHistory(
    options: UseBuilderHistoryOptions = {}
): UseBuilderHistoryReturn {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // History stacks
    const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
    const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

    // Debounce timer ref
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingSnapshotRef = useRef<Omit<HistorySnapshot, 'timestamp'> | null>(null);

    // Push a new snapshot to history with debouncing
    const pushSnapshot = useCallback((snapshot: Omit<HistorySnapshot, 'timestamp'>) => {
        // Store the pending snapshot
        pendingSnapshotRef.current = snapshot;

        // Clear existing timer
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set new debounce timer
        debounceRef.current = setTimeout(() => {
            const pending = pendingSnapshotRef.current;
            if (!pending) return;

            const newSnapshot: HistorySnapshot = {
                ...pending,
                timestamp: Date.now(),
            };

            setUndoStack(prev => {
                // Add to front, limit to maxHistory
                const updated = [newSnapshot, ...prev].slice(0, opts.maxHistory);
                return updated;
            });

            // Clear redo stack when new action is performed
            setRedoStack([]);
            pendingSnapshotRef.current = null;
        }, opts.debounceMs);
    }, [opts.maxHistory, opts.debounceMs]);

    // Undo to previous state
    const undo = useCallback((): HistorySnapshot | null => {
        if (undoStack.length === 0) return null;

        const [current, ...rest] = undoStack;

        setUndoStack(rest);
        setRedoStack(prev => [current, ...prev].slice(0, opts.maxHistory));

        // Return the state to restore (the next one in the stack, or null if empty)
        return rest[0] || null;
    }, [undoStack, opts.maxHistory]);

    // Redo to next state
    const redo = useCallback((): HistorySnapshot | null => {
        if (redoStack.length === 0) return null;

        const [next, ...rest] = redoStack;

        setRedoStack(rest);
        setUndoStack(prev => [next, ...prev].slice(0, opts.maxHistory));

        return next;
    }, [redoStack, opts.maxHistory]);

    // Clear all history
    const clear = useCallback(() => {
        setUndoStack([]);
        setRedoStack([]);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        pendingSnapshotRef.current = null;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return {
        pushSnapshot,
        undo,
        redo,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        undoCount: undoStack.length,
        redoCount: redoStack.length,
        clear,
    };
}

/**
 * Hook for keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
 * Should be used alongside useBuilderHistory
 */
export function useBuilderKeyboardShortcuts(
    onUndo: () => void,
    onRedo: () => void,
    enabled: boolean = true
) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl/Cmd key
            const isCtrl = e.ctrlKey || e.metaKey;

            if (isCtrl && e.key === 'z') {
                e.preventDefault();

                if (e.shiftKey) {
                    // Ctrl+Shift+Z = Redo
                    onRedo();
                } else {
                    // Ctrl+Z = Undo
                    onUndo();
                }
            }

            // Alternative: Ctrl+Y for redo (Windows convention)
            if (isCtrl && e.key === 'y') {
                e.preventDefault();
                onRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onUndo, onRedo, enabled]);
}

export default useBuilderHistory;
