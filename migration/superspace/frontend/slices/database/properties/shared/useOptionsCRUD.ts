/**
 * useOptionsCRUD Hook
 * 
 * Reusable hook for Select/Multi-Select option CRUD operations.
 * Eliminates code duplication across SelectEditor, MultiSelectEditor, and OptionsManager.
 * 
 * @example
 * ```tsx
 * const { handleEdit, handleDelete, handleChangeColor, handleCreate } = useOptionsCRUD({
 *   choices,
 *   onPropertyUpdate,
 * });
 * ```
 */

import { useState } from 'react';
import type { SelectChoice } from '@/frontend/shared/foundation/types/property-options';
import type { PropertyOptions } from '@/frontend/shared/foundation/types/property-options';
import { COLOR_PALETTE, getRandomColor as getRandomColorUtil } from './constants';

export interface UseOptionsCRUDProps {
  /** Current choices array */
  choices: SelectChoice[];
  /** Callback to update property with new choices */
  onPropertyUpdate?: (options: Partial<PropertyOptions>) => Promise<void> | void;
}

export interface UseOptionsCRUDReturn {
  /** Editing state */
  editingChoice: SelectChoice | null;
  editingName: string;
  setEditingChoice: (choice: SelectChoice | null) => void;
  setEditingName: (name: string) => void;
  
  /** CRUD operations */
  handleCreate: (name: string, color?: string) => Promise<SelectChoice | null>;
  handleEdit: (choice: SelectChoice) => void;
  handleSaveEdit: () => Promise<boolean>;
  handleCancelEdit: () => void;
  handleDelete: (choice: SelectChoice) => Promise<void>;
  handleChangeColor: (choice: SelectChoice, newColor: string) => Promise<void>;
  
  /** Utilities */
  getRandomColor: () => string;
}

/**
 * Custom hook for option CRUD operations
 */
export function useOptionsCRUD({
  choices,
  onPropertyUpdate,
}: UseOptionsCRUDProps): UseOptionsCRUDReturn {
  const [editingChoice, setEditingChoice] = useState<SelectChoice | null>(null);
  const [editingName, setEditingName] = useState('');

  /**
   * Create new option
   */
  const handleCreate = async (name: string, color?: string): Promise<SelectChoice | null> => {
    if (!name.trim()) return null;

    const finalColor = color || getRandomColorUtil();
    
    const newChoice: SelectChoice = {
      id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: name.trim(),
      color: finalColor,
    };

    const updatedChoices = [...choices, newChoice];

    if (onPropertyUpdate) {
      try {
        await onPropertyUpdate({
          selectOptions: updatedChoices,
        });
        return newChoice;
      } catch (error) {
        console.error('Failed to create option:', error);
        return null;
      }
    }

    return newChoice;
  };

  /**
   * Start editing option
   */
  const handleEdit = (choice: SelectChoice) => {
    setEditingChoice(choice);
    setEditingName(choice.name);
  };

  /**
   * Save edit
   */
  const handleSaveEdit = async (): Promise<boolean> => {
    if (!editingChoice || !editingName.trim()) {
      setEditingChoice(null);
      return false;
    }

    const updatedChoices = choices.map(c =>
      c.id === editingChoice.id
        ? { ...c, name: editingName.trim() }
        : c
    );

    if (onPropertyUpdate) {
      try {
        await onPropertyUpdate({
          selectOptions: updatedChoices,
        });
        setEditingChoice(null);
        setEditingName('');
        return true;
      } catch (error) {
        console.error('Failed to update option:', error);
        return false;
      }
    }

    setEditingChoice(null);
    setEditingName('');
    return true;
  };

  /**
   * Cancel edit
   */
  const handleCancelEdit = () => {
    setEditingChoice(null);
    setEditingName('');
  };

  /**
   * Delete option
   */
  const handleDelete = async (choice: SelectChoice) => {
    const updatedChoices = choices.filter(c => c.id !== choice.id);

    if (onPropertyUpdate) {
      try {
        await onPropertyUpdate({
          selectOptions: updatedChoices,
        });
      } catch (error) {
        console.error('Failed to delete option:', error);
      }
    }
  };

  /**
   * Change option color
   */
  const handleChangeColor = async (choice: SelectChoice, newColor: string) => {
    const updatedChoices = choices.map(c =>
      c.id === choice.id
        ? { ...c, color: newColor }
        : c
    );

    if (onPropertyUpdate) {
      try {
        await onPropertyUpdate({
          selectOptions: updatedChoices,
        });
      } catch (error) {
        console.error('Failed to change color:', error);
      }
    }
  };

  return {
    editingChoice,
    editingName,
    setEditingChoice,
    setEditingName,
    handleCreate,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleChangeColor,
    getRandomColor: getRandomColorUtil,
  };
}
