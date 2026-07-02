import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { buildDatabaseViewModel, inferFieldMapping } from "../utils";
import type {
  DatabaseRecord,
  DatabaseViewModel,
  DatabaseTable,
  FieldMapping,
} from "../types";

export function useDatabaseRecord(
  tableId?: Id<"dbTables"> | null,
): {
  record: DatabaseRecord | null;
  viewModel: DatabaseViewModel | null;
  mapping: FieldMapping | null;
  isLoading: boolean;
} {
  const queryResult: any = useQuery(
    (api.features.database.queries as any).get,
    tableId ? { id: tableId } : "skip",
  );

  const record = useMemo<DatabaseRecord | null>(() => {
    if (!queryResult) return null;
    return {
      table: queryResult.table,
      fields: queryResult.fields,
      rows: queryResult.rows,
      views: queryResult.views,
      stats: queryResult.stats,
    };
  }, [queryResult]);

  const viewModel = useMemo<DatabaseViewModel | null>(() => {
    if (!record) return null;
    return buildDatabaseViewModel(record);
  }, [record]);

  const mapping = useMemo<FieldMapping | null>(() => {
    if (!record) return null;
    return inferFieldMapping(record.fields);
  }, [record]);

  const isLoading = Boolean(tableId) && queryResult === undefined;

  return {
    record,
    viewModel,
    mapping,
    isLoading,
  };
}

type TableDoc = DatabaseTable;

export function useDatabaseSidebar(
  workspaceId?: Id<"workspaces"> | null,
): {
  tables: TableDoc[];
  isLoading: boolean;
} {
  const result = useQuery(
    (api.features.database.queries as any).list,
    workspaceId ? { workspaceId } : "skip",
  ) as TableDoc[] | undefined;

  return {
    tables: result ?? [],
    isLoading: Boolean(workspaceId) && result === undefined,
  };
}

export function useDatabaseSearch(
  workspaceId: Id<"workspaces"> | null | undefined,
  term: string,
): {
  results: TableDoc[];
  isSearching: boolean;
} {
  const queryResult = useQuery(
    (api.features.database.queries as any).search,
    workspaceId && term.trim()
      ? { workspaceId, term }
      : "skip",
  ) as TableDoc[] | undefined;

  return {
    results: queryResult ?? [],
    isSearching: Boolean(workspaceId && term.trim()) && queryResult === undefined,
  };
}

export function useDatabaseMutations() {
  const createTable = useMutation(
    api.features.database.mutations.createTable as any,
  );
  const updateTable = useMutation(
    api.features.database.mutations.updateTable as any,
  );
  const deleteTable = useMutation(
    api.features.database.mutations.deleteTable as any,
  );
  const duplicateTable = useMutation(
    (api.features.database.mutations as any).duplicateTable,
  );

  const createRow = useMutation(
    api.features.database.mutations.createRow as any,
  );
  const updateRow = useMutation(
    api.features.database.mutations.updateRow as any,
  );
  const deleteRow = useMutation(
    api.features.database.mutations.deleteRow as any,
  );

  const createView = useMutation(
    api.features.database.mutations.createView as any,
  );
  const updateView = useMutation(
    api.features.database.mutations.updateView as any,
  );
  const deleteView = useMutation(
    api.features.database.mutations.deleteView as any,
  );
  const setDefaultView = useMutation(
    api.features.database.mutations.setDefaultView as any,
  );

  const createField = useMutation(
    api.features.database.mutations.createField as any,
  );
  const updateField = useMutation(
    api.features.database.mutations.updateField as any,
  );
  const deleteField = useMutation(
    api.features.database.mutations.deleteField as any,
  );
  const reorderField = useMutation(
    api.features.database.mutations.reorderField as any,
  );
  const reorderRow = useMutation(
    api.features.database.mutations.reorderRow as any,
  );
  const changeFieldType = useMutation(
    api.features.database.mutations.changeFieldType as any,
  );

  return {
    createTable,
    updateTable,
    deleteTable,
    duplicateTable,
    createRow,
    updateRow,
    deleteRow,
    createView,
    updateView,
    deleteView,
    setDefaultView,
    createField,
    updateField,
    deleteField,
    reorderField,
    reorderRow,
    changeFieldType,
  };
}
