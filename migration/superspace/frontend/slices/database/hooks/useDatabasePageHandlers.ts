/**
 * Custom hook for DatabasePage handlers
 * Consolidates all event handlers for better organization and reusability
 */

import { useCallback, useRef } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import type {
  DatabaseRecord,
  DatabaseView,
  DatabaseTable,
  DatabaseFeature,
  DatabaseFieldType,
  DatabaseViewType,
  FieldMapping,
  DatabaseViewModel,
} from "../types";
import { DATABASE_FIELD_DEFINITIONS } from "../config/fields";
import { useDatabaseMutations } from "./useDatabase";
import { APP_VIEW_TYPE_TO_DB } from "../constants";

interface UseDatabasePageHandlersProps {
  record: DatabaseRecord | null;
  activeDbView: DatabaseView | null;
  mapping: FieldMapping | null;
  viewModel: DatabaseViewModel | null;
  selectedTableId: Id<"dbTables"> | null;
  activeView: DatabaseViewType;
  setActiveView: (view: DatabaseViewType) => void;
  setSelectedTableId: (id: Id<"dbTables"> | null) => void;
}

export function useDatabasePageHandlers({
  record,
  activeDbView,
  mapping,
  viewModel,
  selectedTableId,
  activeView,
  setActiveView,
  setSelectedTableId,
}: UseDatabasePageHandlersProps) {
  const {
    updateRow,
    deleteRow,
    setDefaultView,
    updateTable,
    deleteTable,
    duplicateTable,
    createField,
    createRow,
    updateField,
    deleteField,
    reorderField,
    reorderRow,
    updateView,
  } = useDatabaseMutations();

  const columnSizingUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Row operations
  const handleUpdateCell = useCallback(
    async (rowId: DatabaseFeature["id"], updates: Record<string, unknown>) => {
      try {
        await updateRow({
          id: rowId,
          data: updates,
        });
      } catch (error) {
        console.error("Failed to update cell:", error);
      }
    },
    [updateRow]
  );

  const handleDeleteRow = useCallback(
    async (rowId: DatabaseFeature["id"]) => {
      try {
        await deleteRow({ id: rowId });
        toast.success("Row deleted.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete row.";
        toast.error(message);
      }
    },
    [deleteRow]
  );

  const handleAddRow = useCallback(async (initialData?: Record<string, unknown>) => {
    if (!selectedTableId) {
      toast.error("Select a database before adding rows.");
      return;
    }

    try {
      const data: Record<string, unknown> = { ...initialData };

      // Only set title if record and mapping are available
      if (record && record.fields.length > 0) {
        const primaryField = record.fields.find((field) => field.isPrimary);
        const titleFieldId =
          mapping?.titleField ?? (primaryField ? String(primaryField._id) : null);

        if (titleFieldId && !data[titleFieldId]) {
          data[titleFieldId] = "New page";
        }
      }

      await createRow({
        tableId: selectedTableId,
        data,
      });
      toast.success("Row added.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add row.";
      toast.error(message);
    }
  }, [selectedTableId, record, mapping, createRow]);

  const handleReorderRows = useCallback(
    async (orderedIds: string[]) => {
      if (!viewModel) return;

      const orderedRows = orderedIds
        .map((id) => viewModel.features.find((feature) => String(feature.id) === id))
        .filter((feature): feature is DatabaseFeature => Boolean(feature));

      try {
        await Promise.all(
          orderedRows.map((feature, index) =>
            reorderRow({
              rowId: feature.id as Id<"dbRows">,
              newPosition: index,
            })
          )
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to reorder rows.";
        toast.error(message);
      }
    },
    [viewModel, reorderRow]
  );

  // Field operations
  const handleRenameField = useCallback(
    async (fieldId: string, name: string) => {
      try {
        await updateField({
          id: fieldId as Id<"dbFields">,
          name,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to rename property.";
        toast.error(message);
      }
    },
    [updateField]
  );

  const handleToggleFieldRequired = useCallback(
    async (fieldId: string, required: boolean) => {
      try {
        await updateField({
          id: fieldId as Id<"dbFields">,
          isRequired: required,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update property.";
        toast.error(message);
      }
    },
    [updateField]
  );

  const handleDeleteField = useCallback(
    async (fieldId: string) => {
      try {
        await deleteField({ id: fieldId as Id<"dbFields"> });
        toast.success("Property deleted.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete property.";
        toast.error(message);
      }
    },
    [deleteField]
  );

  const handleUpdateFieldOptions = useCallback(
    async (fieldId: string, options: Partial<any>) => {
      try {
        await updateField({
          id: fieldId as any,
          options: options as any,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update field options.";
        console.error("Failed to update field options:", error);
        toast.error(message);
        throw error;
      }
    },
    [updateField]
  );

  const handleToggleFieldVisibility = useCallback(
    async (fieldId: string, visible: boolean) => {
      if (!record || !activeDbView) return;

      const visibleSet = new Set(
        (activeDbView.settings.visibleFields ?? []).map((id) => String(id))
      );

      if (visible) {
        visibleSet.add(fieldId);
      } else {
        visibleSet.delete(fieldId);
      }

      const orderedFields = [...record.fields].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      );

      const nextVisible = orderedFields
        .filter((field) => visibleSet.has(String(field._id)))
        .map((field) => field._id);

      try {
        await updateView({
          id: activeDbView._id,
          settings: {
            ...activeDbView.settings,
            visibleFields: nextVisible,
          },
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update property visibility.";
        toast.error(message);
      }
    },
    [activeDbView, record, updateView]
  );

  const handleReorderFields = useCallback(
    async (orderedIds: string[]) => {
      if (!record || !activeDbView) return;

      const orderedVisible = orderedIds
        .map((id) => record.fields.find((field) => String(field._id) === id))
        .filter((field): field is (typeof record.fields)[number] => Boolean(field));

      const hidden = record.fields
        .filter((field) => !orderedIds.includes(String(field._id)))
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

      const nextOrdering = [...orderedVisible, ...hidden];

      try {
        await Promise.all(
          nextOrdering.map((field, index) =>
            reorderField({
              fieldId: field._id,
              newPosition: index,
            })
          )
        );

        await updateView({
          id: activeDbView._id,
          settings: {
            ...activeDbView.settings,
            visibleFields: orderedVisible.map((field) => field._id),
          },
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to reorder properties.";
        toast.error(message);
      }
    },
    [activeDbView, record, reorderField, updateView]
  );

  const handleAddProperty = useCallback(
    async (type: DatabaseFieldType) => {
      if (!selectedTableId) {
        toast.error("Select a database before adding properties.");
        return;
      }

      const definition = DATABASE_FIELD_DEFINITIONS[type];
      const fieldsCount = record?.fields.length ?? 0;
      const defaultName = definition?.label
        ? `${definition.label} ${fieldsCount + 1}`
        : `Property ${fieldsCount + 1}`;

      const name = window.prompt("Property name", defaultName);
      if (name == null) return;

      const trimmed = name.trim();
      if (!trimmed) {
        toast.error("Property name cannot be empty.");
        return;
      }

      try {
        await createField({
          tableId: selectedTableId,
          name: trimmed,
          type,
          isRequired: false,
        });
        toast.success(`${definition?.label ?? "Property"} added.`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to add property.";
        toast.error(message);
      }
    },
    [selectedTableId, record, createField]
  );

  // View operations
  const handleViewChange = useCallback(
    (view: DatabaseViewType) => {
      setActiveView(view);
    },
    [setActiveView]
  );

  const handleMakeDefaultView = useCallback(
    async (view: DatabaseViewType) => {
      if (!record) {
        toast.error("Select a database before setting a default view.");
        return;
      }

      const targetType = APP_VIEW_TYPE_TO_DB[view];
      const viewDoc = record.views.find((candidate) => candidate.type === targetType);

      if (!viewDoc) {
        toast.error("That view is not available yet.");
        return;
      }

      try {
        await setDefaultView({ id: viewDoc._id });
        setActiveView(view);
        toast.success(`${viewDoc.name ?? view.toUpperCase()} is now the default view.`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to update the default view.";
        toast.error(message);
      }
    },
    [record, setDefaultView, setActiveView]
  );

  const handleColumnSizingChange = useCallback(
    (sizes: Record<string, number>) => {
      if (!activeDbView) return;

      const nextFieldWidths = Object.entries(sizes).reduce<Record<string, number>>(
        (accumulator, [key, value]) => {
          if (key === "propertyActions" || key === "rowActions") {
            return accumulator;
          }

          if (Number.isFinite(value)) {
            accumulator[key] = Math.max(80, Math.round(value));
          }
          return accumulator;
        },
        {}
      );

      const viewId = activeDbView._id;
      const nextSettings = {
        ...activeDbView.settings,
        fieldWidths: nextFieldWidths,
      };

      if (columnSizingUpdateRef.current) {
        clearTimeout(columnSizingUpdateRef.current);
      }

      columnSizingUpdateRef.current = setTimeout(() => {
        updateView({
          id: viewId,
          settings: nextSettings,
        }).catch((error) => {
          console.error("[DatabasePage] Failed to persist column widths", error);
        });
      }, 250);
    },
    [activeDbView, updateView]
  );

  // Table operations
  const handleRenameTable = useCallback(
    async (table: DatabaseTable) => {
      const currentName = (() => {
        const name = table.name || "Untitled database";
        if (typeof name === "string") {
          try {
            const parsed = JSON.parse(name);
            return typeof parsed === "string" ? parsed : name;
          } catch {
            return name;
          }
        }
        return name;
      })();

      const nextName = window.prompt("Rename database", currentName);
      if (nextName == null) return;

      const trimmed = nextName.trim();
      if (!trimmed || trimmed === currentName) return;

      try {
        await updateTable({ id: table._id, name: trimmed });
        toast.success("Database renamed.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to rename database.";
        toast.error(message);
      }
    },
    [updateTable]
  );

  // Inline rename - accepts name directly (for double-click inline edit)
  const handleRenameTableInline = useCallback(
    async (table: DatabaseTable, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;

      try {
        await updateTable({ id: table._id, name: trimmed });
        toast.success("Database renamed.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to rename database.";
        toast.error(message);
      }
    },
    [updateTable]
  );

  // Update table icon
  const handleUpdateTableIcon = useCallback(
    async (table: DatabaseTable, iconData: { name: string; color: string }) => {
      try {
        await updateTable({
          id: table._id,
          icon: JSON.stringify(iconData)
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update icon.";
        toast.error(message);
      }
    },
    [updateTable]
  );

  const handleCopyTableId = useCallback(async (table: DatabaseTable) => {
    try {
      await navigator.clipboard.writeText(String(table._id));
      toast.success("Database ID copied to clipboard.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to copy database ID.";
      toast.error(message);
    }
  }, []);

  const handleDuplicateTable = useCallback(
    async (table: DatabaseTable) => {
      try {
        const newTableId = await duplicateTable({
          id: table._id,
          name: table.name ?? undefined,
        });
        if (newTableId) {
          setSelectedTableId(newTableId);
        }
        toast.success("Database duplicated.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to duplicate database.";
        toast.error(message);
      }
    },
    [duplicateTable, setSelectedTableId]
  );

  const handleDeleteTable = useCallback(
    async (table: DatabaseTable) => {
      const confirmed = window.confirm(
        `Delete "${table.name || "Untitled database"}"? This cannot be undone.`
      );
      if (!confirmed) return;

      try {
        await deleteTable({ id: table._id });
        if (selectedTableId && String(selectedTableId) === String(table._id)) {
          setSelectedTableId(null);
        }
        toast.success("Database deleted.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete database.";
        toast.error(message);
      }
    },
    [deleteTable, selectedTableId, setSelectedTableId]
  );

  // Toolbar actions
  const handleManageViews = useCallback(() => {
    toast.info("Open the view dropdown to manage views.");
  }, []);

  const handleCopyData = useCallback(async () => {
    if (!viewModel) {
      toast.error("Nothing to copy yet.");
      return;
    }

    try {
      const payload = viewModel.features.map((feature) => ({
        id: String(feature.id),
        name: feature.name,
        metadata: feature.metadata,
      }));
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast.success("Database data copied to your clipboard.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to copy data to clipboard.";
      toast.error(message);
    }
  }, [viewModel]);

  const handleGetLink = useCallback(async () => {
    if (typeof window === "undefined" || !selectedTableId) {
      toast.error("Open a database before generating a link.");
      return;
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("table", String(selectedTableId));
      url.searchParams.set("view", activeView);
      await navigator.clipboard.writeText(url.toString());
      toast.success("View link copied to your clipboard.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to copy the view link.";
      toast.error(message);
    }
  }, [selectedTableId, activeView]);

  const handleExport = useCallback(() => {
    toast.info("Export support is in progress.");
  }, []);

  const handleImport = useCallback(() => {
    toast.info("Import support is in progress.");
  }, []);

  // Legacy handlers for specific views (gantt, calendar)
  const handleStatusChange = useCallback(
    async (featureId: DatabaseFeature["id"], status: { id: string }) => {
      if (!mapping?.statusField) return;
      await updateRow({
        id: featureId,
        data: { [mapping.statusField]: status.id },
      });
    },
    [mapping, updateRow]
  );

  const handleMoveDates = useCallback(
    async (
      featureId: DatabaseFeature["id"],
      startAt: Date,
      endAt: Date | null
    ) => {
      if (!mapping) return;
      const updates: Record<string, unknown> = {};
      if (mapping.startDateField) {
        updates[mapping.startDateField] = startAt.getTime();
      }
      if (mapping.endDateField && endAt) {
        updates[mapping.endDateField] = endAt.getTime();
      }
      if (Object.keys(updates).length === 0) return;
      await updateRow({
        id: featureId,
        data: updates,
      });
    },
    [mapping, updateRow]
  );

  return {
    // Row operations
    handleUpdateCell,
    handleDeleteRow,
    handleAddRow,
    handleReorderRows,
    // Field operations
    handleRenameField,
    handleToggleFieldRequired,
    handleDeleteField,
    handleUpdateFieldOptions,
    handleToggleFieldVisibility,
    handleReorderFields,
    handleAddProperty,
    // View operations
    handleViewChange,
    handleMakeDefaultView,
    handleColumnSizingChange,
    // Table operations
    handleRenameTable,
    handleRenameTableInline,
    handleUpdateTableIcon,
    handleCopyTableId,
    handleDuplicateTable,
    handleDeleteTable,
    // Toolbar actions
    handleManageViews,
    handleCopyData,
    handleGetLink,
    handleExport,
    handleImport,
    // Legacy handlers
    handleStatusChange,
    handleMoveDates,
    // Cleanup
    columnSizingUpdateRef,
  };
}
