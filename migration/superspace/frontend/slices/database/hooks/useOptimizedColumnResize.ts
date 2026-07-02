import { useCallback, useRef, useState, useEffect } from "react";
import type { ColumnSizingState } from "@tanstack/react-table";

interface UseOptimizedColumnResizeProps {
  initialSizing?: ColumnSizingState;
  onPersist?: (sizes: Record<string, number>) => void;
  debounceMs?: number;
  minColumnWidth?: number;
}

/**
 * Optimized column resize hook with local state and debounced persistence
 * 
 * Features:
 * - Instant visual feedback (local state)
 * - Debounced backend persistence
 * - Prevents unnecessary re-renders
 * - RequestAnimationFrame batching
 * 
 * @example
 * const { columnSizing, handleColumnSizingChange } = useOptimizedColumnResize({
 *   initialSizing: activeView?.settings.fieldWidths,
 *   onPersist: (sizes) => updateView({ settings: { fieldWidths: sizes } }),
 *   debounceMs: 500,
 * });
 */
export function useOptimizedColumnResize({
  initialSizing = {},
  onPersist,
  debounceMs = 500,
  minColumnWidth = 80,
}: UseOptimizedColumnResizeProps) {
  // Local state for instant visual feedback
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(initialSizing);
  
  // Refs for debouncing and batching
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingSizesRef = useRef<ColumnSizingState>({});

  // Sync with prop changes
  useEffect(() => {
    setColumnSizing(initialSizing);
  }, [initialSizing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleColumnSizingChange = useCallback(
    (updater: ColumnSizingState | ((old: ColumnSizingState) => ColumnSizingState)) => {
      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use RAF for smooth visual updates
      rafRef.current = requestAnimationFrame(() => {
        setColumnSizing((prevSizing) => {
          const nextSizing = typeof updater === "function" ? updater(prevSizing) : updater;
          
          // Store for persistence
          pendingSizesRef.current = nextSizing;
          
          return nextSizing;
        });
      });

      // Debounce persistence to backend
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }

      persistTimeoutRef.current = setTimeout(() => {
        if (!onPersist) return;

        const sizesToPersist = pendingSizesRef.current;
        
        // Normalize and validate sizes
        const normalized: Record<string, number> = {};
        Object.entries(sizesToPersist).forEach(([key, value]) => {
          // Skip action columns
          if (key === "propertyActions" || key === "rowActions" || key === "select" || key === "drag") {
            return;
          }

          if (typeof value === "number" && Number.isFinite(value)) {
            normalized[key] = Math.max(minColumnWidth, Math.round(value));
          }
        });

        // Only persist if we have valid sizes
        if (Object.keys(normalized).length > 0) {
          onPersist(normalized);
        }
      }, debounceMs);
    },
    [onPersist, debounceMs, minColumnWidth]
  );

  return {
    columnSizing,
    handleColumnSizingChange,
    isResizing: persistTimeoutRef.current !== null,
  };
}
