/**
 * Use Option Actions Hook
 * 
 * Reusable logic for managing select/multi-select options
 * Provides consistent handlers for rename, delete, add, and change color
 */

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SelectOption {
  id?: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface UseOptionActionsProps {
  options: SelectOption[];
  onUpdateOptions: (updatedOptions: SelectOption[]) => Promise<void> | void;
}

export interface UseOptionActionsReturn {
  handleRename: (optionId: string) => void;
  handleDelete: (optionId: string) => void;
  handleChangeColor: (optionId: string, color: string) => void;
  handleAdd: () => void;
}

export function useOptionActions({ 
  options, 
  onUpdateOptions 
}: UseOptionActionsProps): UseOptionActionsReturn {
  const { toast } = useToast();

  const handleRename = useCallback((optionId: string) => {
    const option = options.find((opt) => (opt.id || opt.name) === optionId);
    if (!option) return;

    const newName = prompt('Rename option:', option.name);
    if (newName && newName.trim() && newName !== option.name) {
      const updatedOptions = options.map((opt) =>
        (opt.id || opt.name) === optionId 
          ? { ...opt, name: newName.trim() } 
          : opt
      );
      
      onUpdateOptions(updatedOptions);
      
      toast({
        title: "Option renamed",
        description: `Renamed to "${newName.trim()}"`,
      });
    }
  }, [options, onUpdateOptions, toast]);

  const handleDelete = useCallback((optionId: string) => {
    const option = options.find((opt) => (opt.id || opt.name) === optionId);
    if (!option) return;

    if (confirm(`Delete option "${option.name}"?`)) {
      const updatedOptions = options.filter(
        (opt) => (opt.id || opt.name) !== optionId
      );
      
      onUpdateOptions(updatedOptions);
      
      toast({
        title: "Option deleted",
        description: `Deleted "${option.name}"`,
      });
    }
  }, [options, onUpdateOptions, toast]);

  const handleChangeColor = useCallback((optionId: string, color: string) => {
    const updatedOptions = options.map((opt) =>
      (opt.id || opt.name) === optionId 
        ? { ...opt, color } 
        : opt
    );
    
    onUpdateOptions(updatedOptions);
    
    toast({
      title: "Color changed",
      description: "Option color updated",
    });
  }, [options, onUpdateOptions, toast]);

  const handleAdd = useCallback(() => {
    const newName = prompt('New option name:');
    if (newName && newName.trim()) {
      const newOption: SelectOption = {
        id: `option-${Date.now()}`,
        name: newName.trim(),
        color: '#6b7280', // default gray
      };
      
      onUpdateOptions([...options, newOption]);
      
      toast({
        title: "Option added",
        description: `Added "${newName.trim()}"`,
      });
    }
  }, [options, onUpdateOptions, toast]);

  return {
    handleRename,
    handleDelete,
    handleChangeColor,
    handleAdd,
  };
}
