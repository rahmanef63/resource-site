/**
 * Custom hook for managing DatabasePage view state
 * Handles active view selection and table-specific view persistence
 */

import { useState, useEffect, useMemo, useRef } from "react";
import type { Id } from "@convex/_generated/dataModel";
import type { DatabaseRecord, DatabaseViewType } from "../types";
import { getDefaultViewType } from "../utils/view-helpers";

interface UseDatabaseViewStateProps {
  record: DatabaseRecord | null;
  selectedTableId: Id<"dbTables"> | null;
}

export function useDatabaseViewState({
  record,
  selectedTableId,
}: UseDatabaseViewStateProps) {
  const [activeView, setActiveView] = useState<DatabaseViewType>("table");
  const tableIdRef = useRef<string | null>(null);

  const defaultViewType = useMemo<DatabaseViewType>(() => {
    if (!record) return "table";
    return getDefaultViewType(record.views);
  }, [record]);

  const currentTableId = record ? String(record.table._id) : null;

  useEffect(() => {
    if (!currentTableId) {
      tableIdRef.current = null;
      setActiveView("table");
      return;
    }

    if (tableIdRef.current !== currentTableId) {
      tableIdRef.current = currentTableId;
      setActiveView(defaultViewType);
    }
  }, [currentTableId, defaultViewType]);

  return {
    activeView,
    setActiveView,
    defaultViewType,
  };
}
