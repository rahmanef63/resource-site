/**
 * DatabaseViewRenderer Component
 * Renders the appropriate view based on the active view type
 */

import React, { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import type {
  DatabaseRecord,
  DatabaseViewModel,
  DatabaseView,
  DatabaseFeature,
  FieldMapping,
  DatabaseViewType,
  DatabaseFieldType,
} from "../types";
import { DatabaseTableView } from "./views/table";
import { computeYearRange } from "../utils/date-helpers";
import { UniversalCalendarView } from "../views/UniversalCalendarView";
import { convertFieldsToProperties } from "../lib/field-converter";

interface DatabaseViewRendererProps {
  activeView: DatabaseViewType;
  record: DatabaseRecord;
  viewModel: DatabaseViewModel;
  mapping: FieldMapping | null;
  activeDbView: DatabaseView | null;
  tableId: Id<"dbTables">;
  filterQuery?: any | null; // ConvexQueryFilter from filters
  // Row operations
  onAddRow: (initialData?: Record<string, unknown>) => Promise<void>; // Updated signature
  onUpdateCell: (rowId: DatabaseFeature["id"], updates: Record<string, unknown>) => Promise<void>;
  onDeleteRow: (rowId: DatabaseFeature["id"]) => Promise<void>;
  onReorderRows: (orderedIds: string[]) => Promise<void>;
  // Field operations
  onAddProperty: (type: DatabaseFieldType) => Promise<void>;
  onRenameField: (fieldId: string, name: string) => Promise<void>;
  onToggleFieldRequired: (fieldId: string, required: boolean) => Promise<void>;
  onDeleteField: (fieldId: string) => Promise<void>;
  onUpdateFieldOptions: (fieldId: string, options: Partial<any>) => Promise<void>;
  onToggleFieldVisibility: (fieldId: string, visible: boolean) => Promise<void>;
  onReorderFields: (orderedIds: string[]) => Promise<void>;
  // View operations
  onColumnSizingChange: (sizes: Record<string, number>) => void;
  // Legacy handlers for gantt/calendar
  onStatusChange?: (featureId: DatabaseFeature["id"], status: { id: string }) => Promise<void>;
  onMoveDates?: (featureId: DatabaseFeature["id"], startAt: Date, endAt: Date | null) => Promise<void>;
}

export function DatabaseViewRenderer({
  activeView,
  record,
  viewModel,
  mapping,
  activeDbView,
  tableId,
  filterQuery,
  onAddRow,
  onUpdateCell,
  onDeleteRow,
  onReorderRows,
  onAddProperty,
  onRenameField,
  onToggleFieldRequired,
  onDeleteField,
  onUpdateFieldOptions,
  onToggleFieldVisibility,
  onReorderFields,
  onColumnSizingChange,
  onStatusChange,
  onMoveDates,
}: DatabaseViewRendererProps) {
  const years = useMemo(() => {
    return computeYearRange(viewModel.features);
  }, [viewModel.features]);

  switch (activeView) {
    case "gantt":
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Gantt View</p>
            <p className="text-sm text-muted-foreground">Visualize tasks on a timeline</p>
          </div>
        </div>
      );

    case "calendar":
      return (
        <UniversalCalendarView
          data={viewModel.features.map((f) => {
            // Map metadata to properties, and inject Name/Title
            const properties = { ...f.metadata };

            // Find primary field (Name) and inject if missing from metadata
            // Usually name is stored in f.name, not metadata.
            const primaryField = record.fields.find(field => field.isPrimary);
            if (primaryField && !properties[primaryField._id]) {
              properties[primaryField._id] = f.name;
            }

            return {
              id: String(f.id),
              properties,
            };
          })}
          properties={convertFieldsToProperties(record.fields) as any}
          dateProperty={(activeDbView?.settings as any)?.calendarDateProperty}
          onEventClick={() => {}}
          onAddRow={(date, propertyKey) => {
            if (date instanceof Date && propertyKey) {
              return onAddRow({ [propertyKey]: date });
            }
            return onAddRow();
          }}
        />
      );

    case "list":
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">List View</p>
            <p className="text-sm text-muted-foreground">View records in a simple list</p>
          </div>
        </div>
      );

    case "kanban":
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Kanban View</p>
            <p className="text-sm text-muted-foreground">Organize records in columns</p>
          </div>
        </div>
      );

    case "table":
    default:
      return (
        <DatabaseTableView
          tableId={record.table._id}
          features={viewModel.features}
          fields={record.fields}
          mapping={mapping}
          activeView={activeDbView}
          // filterQuery removed as it's not in props
          onAddProperty={onAddProperty}
          onAddRow={() => onAddRow()} // Fix to void
          onUpdateCell={onUpdateCell}
          onDeleteRow={onDeleteRow}
          onRenameField={onRenameField}
          onToggleFieldRequired={onToggleFieldRequired}
          onDeleteField={onDeleteField}
          onToggleFieldVisibility={onToggleFieldVisibility}
          onReorderFields={onReorderFields}
          onReorderRows={onReorderRows}
          onColumnSizingChange={onColumnSizingChange}
          onUpdateFieldOptions={onUpdateFieldOptions}
        />
      );
  }
}
