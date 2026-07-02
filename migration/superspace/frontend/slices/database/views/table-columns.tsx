/**
 * Property Column Factory
 * 
 * Generates TanStack Table column definitions from property configurations.
 * Auto-maps all 23 property types to their appropriate renderers and editors.
 * 
 * Features:
 * - Auto-discovery of property configs
 * - Type-safe column generation
 * - Inline editing support
 * - Custom cell renderers
 * - Sorting/filtering integration
 */

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import property type registry
import type { PropertyConfig } from "../registry/types";
import type { PropertyType, Property } from "@/frontend/shared/foundation/types/universal-database";

// Auto-discover all property configs
const propertyConfigModules = import.meta.glob<{ default: PropertyConfig }>(
  "../properties/*/config.ts",
  { eager: true }
);

// Build property registry
const propertyRegistry = new Map<PropertyType, PropertyConfig>();

for (const [path, module] of Object.entries(propertyConfigModules)) {
  if (module.default) {
    const config = module.default;
    propertyRegistry.set(config.type, config);
  }
}

/**
 * Get property config by type
 */
export function getPropertyConfig(type: PropertyType): PropertyConfig | undefined {
  return propertyRegistry.get(type);
}

/**
 * Get all registered property types
 */
export function getAllPropertyTypes(): PropertyType[] {
  return Array.from(propertyRegistry.keys());
}

/**
 * Property data for table rows
 */
export interface PropertyRowData {
  id: string;
  properties: Record<string, any>;
  [key: string]: any;
}

/**
 * Property column configuration
 */
export interface PropertyColumnConfig {
  key: string;
  name: string;
  type: PropertyType;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  required?: boolean;
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
}

/**
 * Column factory options
 */
export interface ColumnFactoryOptions {
  onCellUpdate?: (rowId: string, propertyKey: string, value: any) => Promise<void>;
  onRowDelete?: (rowId: string) => Promise<void>;
  enableRowSelection?: boolean;
  enableRowActions?: boolean;
  enableDragHandle?: boolean;
}

function SortableHeaderButton({
  label,
  isSortable,
  onToggleSort,
}: {
  label: string;
  isSortable: boolean;
  onToggleSort: () => void;
}) {
  const [sortDirection, setSortDirection] = React.useState<false | "asc" | "desc">(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => {
        if (!isSortable) return;
        setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
        onToggleSort();
      }}
    >
      <span className="font-medium">{label}</span>
      {sortDirection && (
        <span className="ml-2 text-muted-foreground">
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      )}
    </Button>
  );
}

/**
 * Create selection column
 */
function createSelectionColumn<T extends PropertyRowData>(): ColumnDef<T> {
  return {
    id: "__select",
    size: 40,
    minSize: 40,
    maxSize: 40,
    enableResizing: false,
    enableSorting: false,
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </div>
    ),
  };
}

/**
 * Create drag handle column
 */
function createDragHandleColumn<T extends PropertyRowData>(): ColumnDef<T> {
  return {
    id: "__drag",
    size: 40,
    minSize: 40,
    maxSize: 40,
    enableResizing: false,
    enableSorting: false,
    header: () => null,
    cell: () => (
      <div
        className="flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        role="button"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
    ),
  };
}

/**
 * Create actions column
 */
function createActionsColumn<T extends PropertyRowData>(
  onRowDelete?: (rowId: string) => Promise<void>
): ColumnDef<T> {
  return {
    id: "__actions",
    size: 60,
    minSize: 60,
    maxSize: 60,
    enableResizing: false,
    enableSorting: false,
    header: () => null,
    cell: ({ row }) => {
      const rowId = row.original.id;

      return (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(rowId)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              {onRowDelete && (
                <DropdownMenuItem
                  onClick={() => onRowDelete(rowId)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  };
}

/**
 * Create property column
 */
function createPropertyColumn<T extends PropertyRowData>(
  config: PropertyColumnConfig,
  options: ColumnFactoryOptions
): ColumnDef<T> {
  const propertyConfig = getPropertyConfig(config.type);

  if (!propertyConfig) {
    console.warn(`Property config not found for type: ${config.type}`);
    return {
      id: config.key,
      accessorFn: (row) => row.properties[config.key],
      header: config.name,
      cell: () => <span className="text-muted-foreground italic">Unknown type</span>,
    };
  }

  const { Renderer, Editor, validate, format } = propertyConfig;
  const isEditable = config.editable !== false && !propertyConfig.isAuto;

  return {
    id: config.key,
    accessorFn: (row) => row.properties[config.key],
    size: config.width || 200,
    minSize: config.minWidth || 120,
    maxSize: config.maxWidth,
    enableSorting: config.sortable !== false && propertyConfig.isAuto !== true,
    enableResizing: true,
    header: ({ column }) => {
      return (
        <SortableHeaderButton
          label={config.name}
          isSortable={config.sortable !== false}
          onToggleSort={() => {
            if (config.sortable !== false) {
              column.toggleSorting(column.getIsSorted() === "asc");
            }
          }}
        />
      );
    },
    cell: ({ row, getValue }) => {
      const value = getValue();
      const rowId = row.original.id;
      const [isEditing, setIsEditing] = React.useState(false);
      const [editValue, setEditValue] = React.useState(value);
      const [error, setError] = React.useState<string | null>(null);

      // Create a minimal Property object for the components
      const property: Property = {
        key: config.key,
        name: config.name,
        type: config.type,
      };

      const handleSave = async () => {
        // Validate if validation function exists
        if (validate) {
          const validationResult = validate(editValue, property);
          if (validationResult) {
            setError(validationResult);
            return;
          }
        }

        // Save the value
        if (options.onCellUpdate) {
          try {
            await options.onCellUpdate(rowId, config.key, editValue);
            setIsEditing(false);
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save");
          }
        }
      };

      const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
        setError(null);
      };

      // Render mode
      if (!isEditing || !isEditable) {
        return (
          <div
            className="group relative min-h-[36px] flex items-center px-2 -mx-2 rounded hover:bg-accent/50 cursor-pointer"
            onClick={() => {
              if (isEditable) {
                setIsEditing(true);
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isEditable) {
                setIsEditing(true);
              }
            }}
          >
            <Renderer value={value} property={property} />
            {isEditable && (
              <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-muted-foreground">Click to edit</span>
              </div>
            )}
          </div>
        );
      }

      // Edit mode
      return (
        <div className="py-1">
          <Editor
            value={editValue}
            property={property}
            onChange={setEditValue}
            onBlur={handleSave}
            autoFocus
          />
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
          <div className="flex gap-1 mt-1">
            <Button
              size="sm"
              variant="default"
              onClick={handleSave}
              className="h-6 text-xs"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="h-6 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    },
  };
}

/**
 * Create all table columns from property configurations
 */
export function createTableColumns<T extends PropertyRowData>(
  properties: PropertyColumnConfig[],
  options: ColumnFactoryOptions = {}
): ColumnDef<T>[] {
  const columns: ColumnDef<T>[] = [];

  // Add drag handle column
  if (options.enableDragHandle) {
    columns.push(createDragHandleColumn());
  }

  // Add selection column
  if (options.enableRowSelection) {
    columns.push(createSelectionColumn());
  }

  // Add property columns
  for (const propConfig of properties) {
    if (propConfig.visible !== false) {
      columns.push(createPropertyColumn(propConfig, options));
    }
  }

  // Add "Add property" ghost column
  columns.push({
    id: "__add_property",
    size: 50,
    minSize: 50,
    enableResizing: false,
    enableSorting: false,
    header: () => (
      <Button variant="ghost" size="sm" className="h-8 -ml-3 text-muted-foreground hover:text-foreground">
        <Plus className="h-4 w-4 mr-2" />
        Add property
      </Button>
    ),
    cell: () => null,
  });

  // Add actions column
  if (options.enableRowActions) {
    columns.push(createActionsColumn(options.onRowDelete));
  }

  return columns;
}

/**
 * Export property registry for external use
 */
export { propertyRegistry };
