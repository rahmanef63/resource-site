/**
 * Hook for managing cell editing state and keyboard navigation
 * Google Sheets-style behavior:
 * - Arrow keys: Navigate between cells
 * - Enter: Start editing OR move down
 * - ESC: Cancel editing
 * - Any character: Start editing with that character
 * - Tab: Move to next cell
 */

import { useCallback, useState, useEffect } from "react";

export interface CellPosition {
  rowId: string;
  fieldId: string;
  rowIndex: number;
  colIndex: number;
}

export interface CellEditorState {
  focusedCell: CellPosition | null;
  editingCell: CellPosition | null;
  isEditing: boolean;
}

export interface UseCellEditorOptions {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right', current: CellPosition) => CellPosition | null;
  onEnterEdit?: (position: CellPosition) => void;
  onExitEdit?: () => void;
}

export interface UseCellEditorReturn {
  focusedCell: CellPosition | null;
  editingCell: CellPosition | null;
  isEditing: boolean;
  focusCell: (position: CellPosition | null) => void;
  startEditing: (position?: CellPosition, initialValue?: string) => void;
  stopEditing: (commit?: boolean) => void;
  isCellFocused: (rowId: string, fieldId: string) => boolean;
  isCellEditing: (rowId: string, fieldId: string) => boolean;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
}

export function useCellEditor(options: UseCellEditorOptions = {}): UseCellEditorReturn {
  const { onNavigate, onEnterEdit, onExitEdit } = options;
  
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const isEditing = editingCell !== null;

  const focusCell = useCallback((position: CellPosition | null) => {
    setFocusedCell(position);
    // Clear editing when focusing a different cell
    if (position && editingCell && 
        (position.rowId !== editingCell.rowId || position.fieldId !== editingCell.fieldId)) {
      setEditingCell(null);
      onExitEdit?.();
    }
  }, [editingCell, onExitEdit]);

  const startEditing = useCallback((position?: CellPosition, initialValue?: string) => {
    const cellToEdit = position || focusedCell;
    if (cellToEdit) {
      setEditingCell(cellToEdit);
      setFocusedCell(cellToEdit);
      onEnterEdit?.(cellToEdit);
    }
  }, [focusedCell, onEnterEdit]);

  const stopEditing = useCallback((commit: boolean = true) => {
    setEditingCell(null);
    if (!commit) {
      onExitEdit?.();
    }
  }, [onExitEdit]);

  const isCellFocused = useCallback((rowId: string, fieldId: string) => {
    return focusedCell?.rowId === rowId && focusedCell?.fieldId === fieldId;
  }, [focusedCell]);

  const isCellEditing = useCallback((rowId: string, fieldId: string) => {
    return editingCell?.rowId === rowId && editingCell?.fieldId === fieldId;
  }, [editingCell]);

  // Arrow key navigation
  const moveUp = useCallback(() => {
    if (!focusedCell || !onNavigate) return;
    const next = onNavigate('up', focusedCell);
    if (next) focusCell(next);
  }, [focusedCell, onNavigate, focusCell]);

  const moveDown = useCallback(() => {
    if (!focusedCell || !onNavigate) return;
    const next = onNavigate('down', focusedCell);
    if (next) focusCell(next);
  }, [focusedCell, onNavigate, focusCell]);

  const moveLeft = useCallback(() => {
    if (!focusedCell || !onNavigate) return;
    const next = onNavigate('left', focusedCell);
    if (next) focusCell(next);
  }, [focusedCell, onNavigate, focusCell]);

  const moveRight = useCallback(() => {
    if (!focusedCell || !onNavigate) return;
    const next = onNavigate('right', focusedCell);
    if (next) focusCell(next);
  }, [focusedCell, onNavigate, focusCell]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInInput = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.contentEditable === 'true';

    // ESC - Cancel editing
    if (e.key === 'Escape') {
      if (isEditing) {
        e.preventDefault();
        stopEditing(false);
      }
      return;
    }

    // Don't handle navigation keys if we're editing
    if (isEditing && !isInInput) {
      return;
    }

    // Arrow keys - Navigate
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      if (!isEditing && focusedCell) {
        e.preventDefault();
        if (e.key === 'ArrowUp') moveUp();
        if (e.key === 'ArrowDown') moveDown();
        if (e.key === 'ArrowLeft') moveLeft();
        if (e.key === 'ArrowRight') moveRight();
      }
      return;
    }

    // Enter - Start editing OR move down
    if (e.key === 'Enter' && focusedCell) {
      e.preventDefault();
      if (isEditing) {
        stopEditing(true);
        moveDown();
      } else {
        startEditing();
      }
      return;
    }

    // Tab - Move right (or left with Shift)
    if (e.key === 'Tab' && focusedCell && !isEditing) {
      e.preventDefault();
      if (e.shiftKey) {
        moveLeft();
      } else {
        moveRight();
      }
      return;
    }

    // Any printable character - Start editing with that character
    if (!isEditing && focusedCell && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      startEditing(focusedCell, e.key);
      return;
    }
  }, [isEditing, focusedCell, startEditing, stopEditing, moveUp, moveDown, moveLeft, moveRight]);

  // Add global keyboard listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      handleKeyDown(e);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleKeyDown]);

  return {
    focusedCell,
    editingCell,
    isEditing,
    focusCell,
    startEditing,
    stopEditing,
    isCellFocused,
    isCellEditing,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
  };
}
