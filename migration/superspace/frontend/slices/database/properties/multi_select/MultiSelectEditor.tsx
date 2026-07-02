import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import type { SelectOptions, SelectChoice } from '@/frontend/shared/foundation/types/property-options';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Plus, X, Palette, MoreHorizontal, Pencil, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorPicker } from '../../components/ColorPicker';
import { COLOR_PALETTE, getRandomColor } from '../shared/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useOptionsCRUD } from '../shared/useOptionsCRUD';

export const MultiSelectEditor: React.FC<PropertyEditorProps> = ({ value, onChange, property, onPropertyUpdate }) => {
  const [open, setOpen] = useState(false);
  const selectOptions = property.options as SelectOptions | undefined;
  
  // ✅ Use Convex data directly - no local state for choices
  const choices = selectOptions?.choices && selectOptions.choices.length > 0 
    ? selectOptions.choices 
    : [];
  
  // Convert value to array of strings
  const selectedValues = Array.isArray(value) ? value.map(String) : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempNewChoice, setTempNewChoice] = useState<SelectChoice | null>(null);

  // Use shared CRUD hook
  const {
    editingChoice,
    editingName,
    setEditingName,
    handleCreate,
    handleEdit,
    handleSaveEdit: saveEdit,
    handleCancelEdit,
    handleDelete,
    handleChangeColor,
  } = useOptionsCRUD({ choices, onPropertyUpdate });

  const handleToggle = (choiceName: string) => {
    let newValues: string[];
    
    if (selectedValues.includes(choiceName)) {
      // Remove if already selected
      newValues = selectedValues.filter(v => v !== choiceName);
    } else {
      // Add if not selected
      newValues = [...selectedValues, choiceName];
    }
    
    onChange(newValues.length > 0 ? newValues : null);
    setSearchQuery('');
  };

  const handleRemove = (choiceName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newValues = selectedValues.filter(v => v !== choiceName);
    onChange(newValues.length > 0 ? newValues : null);
  };

  const handleCreateWithColor = async (color?: string) => {
    if (searchQuery.trim() && (selectOptions?.allowCreate !== false)) {
      const newChoice = await handleCreate(searchQuery, color);
      if (newChoice) {
        handleToggle(newChoice.name);
        setShowColorPicker(false);
        setTempNewChoice(null);
      }
    }
  };

  // Handle bulk create (comma-separated)
  const handleBulkCreate = async () => {
    if (!searchQuery.trim() || (selectOptions?.allowCreate === false)) return;
    
    // Check if input contains comma - if yes, create multiple
    if (searchQuery.includes(',')) {
      const names = searchQuery
        .split(',')
        .map(n => n.trim())
        .filter(n => n.length > 0)
        .filter(n => !choices.some(choice => choice.name.toLowerCase() === n.toLowerCase())); // Prevent duplicates
      
      if (names.length === 0) {
        setSearchQuery('');
        return;
      }

      // Create all new choices at once (not in loop to avoid race condition)
      const newChoices = names.map((name, index) => ({
        id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() + '-' + index,
        name: name.trim(),
        color: getRandomColor(),
      }));

      const updatedChoices = [...choices, ...newChoices];
      
      if (onPropertyUpdate) {
        try {
          await onPropertyUpdate({
            selectOptions: updatedChoices,
          });
          
          // Auto-select all newly created options
          const newChoiceNames = newChoices.map(c => c.name);
          const newValues = [...selectedValues, ...newChoiceNames];
          onChange(newValues);
        } catch (error) {
          console.error('Failed to bulk create options:', error);
          return;
        }
      }
      
      setSearchQuery('');
      setShowColorPicker(false);
      setTempNewChoice(null);
    } else {
      // Single create
      await handleCreateWithColor();
    }
  };

  const handleOpenColorPicker = () => {
    if (searchQuery.trim()) {
      setTempNewChoice({
        id: searchQuery.toLowerCase().replace(/\s+/g, '-'),
        name: searchQuery.trim(),
        color: getRandomColor(),
      });
      setShowColorPicker(true);
    }
  };

  const handleSaveEditWithValueUpdate = async () => {
    const oldName = editingChoice?.name;
    const success = await saveEdit();
    
    // Update selected values if we renamed a selected option
    if (success && oldName && selectedValues.includes(oldName)) {
      const newSelectedValues = selectedValues.map(v => 
        v === oldName ? editingName.trim() : v
      );
      onChange(newSelectedValues);
    }
  };

  const handleDeleteChoice = async (choice: SelectChoice) => {
    await handleDelete(choice);
    
    // Remove from selected values if we deleted a selected option
    if (selectedValues.includes(choice.name)) {
      const newSelectedValues = selectedValues.filter(v => v !== choice.name);
      onChange(newSelectedValues.length > 0 ? newSelectedValues : null);
    }
  };

  const handleColorChange = async (choice: SelectChoice, newColor: string) => {
    await handleChangeColor(choice, newColor);
  };

  const selectedChoices = choices.filter(choice => selectedValues.includes(choice.name));
  const filteredChoices = choices.filter(choice =>
    choice.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const canCreateNew = searchQuery.trim() && 
    !filteredChoices.some(choice => choice.name.toLowerCase() === searchQuery.toLowerCase()) &&
    (selectOptions?.allowCreate !== false);

  const handlePopoverChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <Popover open={open} onOpenChange={handlePopoverChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-9 h-auto"
        >
          <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
            {selectedChoices.length > 0 ? (
              selectedChoices.map((choice) => (
                <Badge
                  key={choice.id || choice.name}
                  variant="secondary"
                  className="gap-1 shrink-0"
                  style={choice.color ? {
                    backgroundColor: choice.color + '20',
                    borderColor: choice.color,
                    color: choice.color
                  } : undefined}
                >
                  {choice.icon && <span>{choice.icon}</span>}
                  <span className="truncate max-w-[100px]">{choice.name}</span>
                  <X
                    className="h-3 w-3 opacity-50 hover:opacity-100"
                    onClick={(e) => handleRemove(choice.name, e)}
                  />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">Pilih opsi...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {showColorPicker && tempNewChoice ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Pilih warna untuk tag baru</h4>
              <Button aria-label="Close"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowColorPicker(false);
                  setTempNewChoice(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary"
                style={{ 
                  backgroundColor: tempNewChoice.color + '20',
                  borderColor: tempNewChoice.color,
                  color: tempNewChoice.color 
                }}
              >
                {tempNewChoice.name}
              </Badge>
            </div>
            <ColorPicker
              value={tempNewChoice.color}
              onChange={(color) => {
                setTempNewChoice({ ...tempNewChoice, color });
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleCreateWithColor(tempNewChoice.color)}
              >
                Buat Tag
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCreateWithColor()}
              >
                Warna Acak
              </Button>
            </div>
          </div>
        ) : (
          <Command>
            <CommandInput 
              placeholder="Cari atau buat opsi (pisahkan dengan koma)..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canCreateNew) {
                  e.preventDefault();
                  handleBulkCreate();
                }
              }}
            />
            <CommandList>
              <CommandEmpty>
                {canCreateNew ? (
                  <div className="p-2 space-y-2">
                    {searchQuery.includes(',') ? (
                      <>
                        <div className="text-xs text-muted-foreground px-2 py-1">
                          Buat {searchQuery.split(',').filter(n => n.trim()).length} opsi baru dan pilih semua
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={handleBulkCreate}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Buat semua dengan warna acak
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleCreateWithColor()}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Buat &quot;{searchQuery}&quot; (warna acak)
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={handleOpenColorPicker}
                        >
                          <Palette className="mr-2 h-4 w-4" />
                          Buat dengan pilih warna
                        </Button>
                      </>
                    )}
                    <div className="text-xs text-muted-foreground px-2 py-1 border-t mt-2 pt-2">
                      💡 Tip: Gunakan koma untuk membuat beberapa opsi sekaligus
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm">Tidak ada opsi ditemukan.</div>
                )}
              </CommandEmpty>
              {filteredChoices.length > 0 && (
                <CommandGroup>
                  {filteredChoices.map((choice) => {
                    const isSelected = selectedValues.includes(choice.name);
                    return (
                      <div key={choice.id || choice.name} className="group relative">
                        {editingChoice?.id === choice.id ? (
                          <div className="flex items-center gap-2 px-2 py-1.5">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEditWithValueUpdate();
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                              onBlur={handleSaveEditWithValueUpdate}
                              autoFocus
                              className="h-7 flex-1"
                            />
                          </div>
                        ) : (
                          <CommandItem
                            value={choice.name}
                            onSelect={() => handleToggle(choice.name)}
                            className="flex items-center gap-2"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                            <Check
                              className={cn(
                                'h-4 w-4 shrink-0',
                                isSelected ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <Badge 
                              variant="secondary"
                              className="truncate flex-1"
                              style={choice.color ? { 
                                backgroundColor: choice.color + '20',
                                borderColor: choice.color,
                                color: choice.color 
                              } : undefined}
                            >
                              {choice.icon && <span className="mr-1">{choice.icon}</span>}
                              {choice.name}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button aria-label="More options"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => handleEdit(choice)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <div className="px-2 py-1.5">
                                  <div className="text-xs text-muted-foreground mb-2">Colors</div>
                                  <div className="grid grid-cols-4 gap-1">
                                    {COLOR_PALETTE.map((color) => (
                                      <button
                                        key={color}
                                        onClick={() => handleColorChange(choice, color)}
                                        className={cn(
                                          'h-6 w-6 rounded border-2 hover:scale-110 transition-transform',
                                          choice.color === color ? 'border-foreground' : 'border-transparent'
                                        )}
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteChoice(choice)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </CommandItem>
                        )}
                      </div>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
};
