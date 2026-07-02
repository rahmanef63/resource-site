import { useState, useCallback } from 'react';

interface UseBulkSelectionReturn<T> {
  selectedIds: Set<any>;
  isSelected: (id: any) => boolean;
  toggleSelection: (id: any) => void;
  selectAll: (items: T[]) => void;
  clearSelection: () => void;
  selectedCount: number;
  hasSelection: boolean;
}

export function useBulkSelection<T extends { id: any }>(): UseBulkSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());

  const isSelected = useCallback((id: any) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const toggleSelection = useCallback((id: any) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    selectedCount: selectedIds.size,
    hasSelection: selectedIds.size > 0,
  };
}
