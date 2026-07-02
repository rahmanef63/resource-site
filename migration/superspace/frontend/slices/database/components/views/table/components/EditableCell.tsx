"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { DatabaseField, DatabaseSelectOption } from "../../../../types";
import { FieldValue } from "../../../FieldValue";
import { propertyRegistry } from "../../../../registry";
import type { Property } from "@/frontend/shared/foundation/types/universal-database";
import type { PropertyOptions } from "@/frontend/shared/foundation/types/property-options";
import { convertFieldToProperty } from "../../../../lib/field-converter";

// ============================================================================
// Type Guards & Helpers
// ============================================================================

const isV2Property = (field: DatabaseField | Property): field is Property => {
  return 'key' in field && 'required' in field;
};

const getFieldType = (field: DatabaseField | Property): string => {
  return 'type' in field ? field.type : 'text';
};

const getFieldId = (field: DatabaseField | Property): string => {
  return 'key' in field ? field.key : String((field as DatabaseField)._id);
};

const getSelectOptions = (field: DatabaseField | Property): DatabaseSelectOption[] => {
  if ('options' in field && field.options && 'selectOptions' in field.options) {
    return field.options.selectOptions ?? [];
  }
  return [];
};

// ============================================================================
// Reusable Cell Wrapper
// ============================================================================

interface CellWrapperProps {
  isSelected?: boolean;
  isEditing?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  onStartEdit?: () => void;
  children: React.ReactNode;
}

function CellWrapper({ 
  isSelected, 
  isEditing, 
  disabled, 
  onSelect, 
  onStartEdit, 
  children 
}: CellWrapperProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!disabled && onSelect) {
      e.stopPropagation();
      onSelect();
    }
  }, [disabled, onSelect]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!disabled && onStartEdit) {
      e.stopPropagation();
      onStartEdit();
    }
  }, [disabled, onStartEdit]);

  const wrapperClassName = cn(
    "relative w-full rounded-sm transition-all",
    isSelected && !isEditing && "ring-2 ring-blue-500 ring-offset-1",
    isEditing && "ring-2 ring-blue-600 ring-offset-1"
  );

  if (disabled) {
    return (
      <div className="w-full cursor-not-allowed rounded-md px-2 py-1 text-sm text-muted-foreground">
        {children}
      </div>
    );
  }

  return (
    <div 
      className={wrapperClassName}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {children}
    </div>
  );
}

// ============================================================================
// V2 Property Registry Editor Wrapper
// ============================================================================

interface V2EditorProps {
  property: Property;
  value: unknown;
  onCommit?: (value: unknown) => Promise<void> | void;
  onPropertyUpdate?: (options: Partial<PropertyOptions>) => Promise<void> | void;
}

function V2PropertyEditor({ property, value, onCommit, onPropertyUpdate }: V2EditorProps) {
  const config = propertyRegistry.get(property.type);
  const [localValue, setLocalValue] = useState(value);
  const commitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  useEffect(() => {
    return () => {
      if (commitTimeoutRef.current) {
        clearTimeout(commitTimeoutRef.current);
        commitTimeoutRef.current = null;
      }
    };
  }, []);
  
  if (!config?.Editor) {
    return <FieldValue field={property} value={value} />;
  }

  const { Editor } = config;
  
  const handleChange = useCallback((newValue: unknown) => {
    setLocalValue(newValue);
    
    if (commitTimeoutRef.current) {
      clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = null;
    }
    
    // Immediate commit for certain types
    const immediateCommitTypes = ['checkbox', 'select', 'multi_select'];
    if (immediateCommitTypes.includes(property.type)) {
      if (JSON.stringify(newValue) !== JSON.stringify(value)) {
        onCommit?.(newValue);
      }
    } else {
      // Debounce for text inputs
      commitTimeoutRef.current = setTimeout(() => {
        if (JSON.stringify(newValue) !== JSON.stringify(value)) {
          onCommit?.(newValue);
        }
      }, 1000);
    }
  }, [property.type, value, onCommit]);
  
  return (
    <div className="w-full">
      <Editor
        value={localValue}
        property={property}
        onChange={handleChange}
        onPropertyUpdate={onPropertyUpdate}
      />
    </div>
  );
}

// ============================================================================
// Main Editable Cell Component
// ============================================================================

interface EditableCellProps {
  field: DatabaseField | Property;
  value: unknown;
  disabled?: boolean;
  onCommit?: (value: unknown) => Promise<void> | void;
  onPropertyUpdate?: (fieldId: string, options: Partial<PropertyOptions>) => Promise<void> | void;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: () => void;
  onStartEdit?: () => void;
  onStopEdit?: () => void;
}

export function EditableCell({ 
  field, 
  value, 
  disabled = false, 
  onCommit, 
  onPropertyUpdate,
  isSelected = false,
  isEditing = false,
  onSelect,
  onStartEdit,
  onStopEdit,
}: EditableCellProps) {
  // Convert to V2 Property if needed
  const property: Property = isV2Property(field) 
    ? field 
    : convertFieldToProperty(field as DatabaseField);
  
  const fieldId = getFieldId(field);
  const fieldType = getFieldType(field);

  // Wrap onPropertyUpdate to include field ID
  const handlePropertyUpdate = useCallback(
    (options: Partial<PropertyOptions>) => {
      onPropertyUpdate?.(fieldId, options);
    },
    [fieldId, onPropertyUpdate]
  );

  // Try V2 Property Registry Editor first
  const config = propertyRegistry.get(property.type);
  
  if (config?.Editor) {
    return (
      <CellWrapper
        isSelected={isSelected}
        isEditing={isEditing}
        disabled={disabled}
        onSelect={onSelect}
        onStartEdit={onStartEdit}
      >
        <V2PropertyEditor
          property={property}
          value={value}
          onCommit={onCommit}
          onPropertyUpdate={handlePropertyUpdate}
        />
      </CellWrapper>
    );
  }

  // Fallback to displaying field value only
  return (
    <CellWrapper
      isSelected={isSelected}
      isEditing={isEditing}
      disabled={disabled}
      onSelect={onSelect}
      onStartEdit={onStartEdit}
    >
      <FieldValue field={field} value={value} />
    </CellWrapper>
  );
}
