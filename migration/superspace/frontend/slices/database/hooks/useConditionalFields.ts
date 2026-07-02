/**
 * Conditional Fields Hook
 * Manages field visibility and behavior based on conditions
 */
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";

export type ConditionType = "showIf" | "hideIf" | "requiredIf" | "readonlyIf";
export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "isEmpty"
  | "isNotEmpty"
  | "greaterThan"
  | "lessThan";

export interface ConditionRule {
  sourceFieldId: Id<"dbFields">;
  operator: ConditionOperator;
  value?: unknown;
}

export interface FieldCondition {
  _id: Id<"dbFieldConditions">;
  fieldId: Id<"dbFields">;
  tableId: Id<"dbTables">;
  conditionType: ConditionType;
  conditions: ConditionRule[];
  priority?: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FieldState {
  visible: boolean;
  required: boolean;
  readonly: boolean;
}

/**
 * Manage conditions for a table
 */
export function useFieldConditions(tableId: Id<"dbTables"> | undefined) {
  const conditions = useQuery(
    api.features.database.conditionalFields.listConditions,
    tableId ? { tableId } : "skip"
  );

  const createMutation = useMutation(
    api.features.database.conditionalFields.createCondition
  );
  const updateMutation = useMutation(
    api.features.database.conditionalFields.updateCondition
  );
  const deleteMutation = useMutation(
    api.features.database.conditionalFields.deleteCondition
  );

  const createCondition = useCallback(
    async (args: {
      fieldId: Id<"dbFields">;
      conditionType: ConditionType;
      conditions: ConditionRule[];
      priority?: number;
    }) => {
      if (!tableId) return;

      try {
        const id = await createMutation({
          ...args,
          tableId,
        });
        toast({ title: "Condition created" });
        return id;
      } catch (error) {
        toast({
          title: "Failed to create condition",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [createMutation, tableId]
  );

  const updateCondition = useCallback(
    async (
      conditionId: Id<"dbFieldConditions">,
      updates: {
        conditionType?: ConditionType;
        conditions?: ConditionRule[];
        priority?: number;
        isActive?: boolean;
      }
    ) => {
      try {
        await updateMutation({ conditionId, ...updates });
        toast({ title: "Condition updated" });
      } catch (error) {
        toast({
          title: "Failed to update condition",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [updateMutation]
  );

  const deleteCondition = useCallback(
    async (conditionId: Id<"dbFieldConditions">) => {
      try {
        await deleteMutation({ conditionId });
        toast({ title: "Condition deleted" });
      } catch (error) {
        toast({
          title: "Failed to delete condition",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        throw error;
      }
    },
    [deleteMutation]
  );

  // Group conditions by field
  const conditionsByField = useMemo(() => {
    if (!conditions) return {};
    const grouped: Record<string, FieldCondition[]> = {};
    for (const condition of conditions) {
      const fieldId = condition.fieldId as string;
      if (!grouped[fieldId]) grouped[fieldId] = [];
      grouped[fieldId].push(condition as FieldCondition);
    }
    return grouped;
  }, [conditions]);

  return {
    conditions: (conditions ?? []) as FieldCondition[],
    conditionsByField,
    isLoading: tableId !== undefined && conditions === undefined,
    createCondition,
    updateCondition,
    deleteCondition,
  };
}

/**
 * Evaluate conditions for a specific row
 */
export function useEvaluatedFieldStates(
  tableId: Id<"dbTables"> | undefined,
  rowData: Record<string, unknown>
) {
  const fieldStates = useQuery(
    api.features.database.conditionalFields.evaluateConditions,
    tableId ? { tableId, rowData } : "skip"
  );

  return {
    fieldStates: (fieldStates ?? {}) as Record<string, FieldState>,
    isLoading: tableId !== undefined && fieldStates === undefined,
  };
}

/**
 * Check if a specific field should be visible/required/readonly
 */
export function useFieldState(
  tableId: Id<"dbTables"> | undefined,
  fieldId: Id<"dbFields">,
  rowData: Record<string, unknown>
): FieldState {
  const { fieldStates } = useEvaluatedFieldStates(tableId, rowData);

  return (
    fieldStates[fieldId as string] ?? {
      visible: true,
      required: false,
      readonly: false,
    }
  );
}
