/**
 * useFieldValidation Hook
 * Feature #109 - Custom validation rules for fields
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback } from "react";

export type ValidationType =
  | "regex"
  | "range"
  | "custom_script"
  | "dependency"
  | "unique_composite"
  | "cross_field";

export interface ValidationConfig {
  pattern?: string;
  min?: number;
  max?: number;
  script?: string;
  dependsOnFields?: Id<"dbFields">[];
  compositeFields?: Id<"dbFields">[];
  errorMessage?: string;
}

export interface UseFieldValidationOptions {
  tableId: Id<"dbTables">;
}

export function useFieldValidation(options: UseFieldValidationOptions) {
  const { tableId } = options;

  // Queries
  const validations = useQuery(
    api.features.database.fieldValidation.getTableValidations,
    { tableId }
  );

  const activeValidations = useQuery(
    api.features.database.fieldValidation.getActiveValidations,
    { tableId }
  );

  // Mutations
  const createValidationMutation = useMutation(
    api.features.database.fieldValidation.createValidation
  );
  const updateValidationMutation = useMutation(
    api.features.database.fieldValidation.updateValidation
  );
  const deleteValidationMutation = useMutation(
    api.features.database.fieldValidation.deleteValidation
  );
  const toggleValidationMutation = useMutation(
    api.features.database.fieldValidation.toggleValidation
  );
  const createRegexValidationMutation = useMutation(
    api.features.database.fieldValidation.createRegexValidation
  );
  const createRangeValidationMutation = useMutation(
    api.features.database.fieldValidation.createRangeValidation
  );

  // Create a validation rule
  const createValidation = useCallback(
    async (data: {
      fieldId: Id<"dbFields">;
      validationType: ValidationType;
      config: ValidationConfig;
      runOnCreate?: boolean;
      runOnUpdate?: boolean;
    }) => {
      return await createValidationMutation({
        ...data,
        tableId,
      });
    },
    [tableId, createValidationMutation]
  );

  // Create regex validation shortcut
  const createRegexValidation = useCallback(
    async (data: {
      fieldId: Id<"dbFields">;
      pattern: string;
      errorMessage?: string;
    }) => {
      return await createRegexValidationMutation({
        ...data,
        tableId,
      });
    },
    [tableId, createRegexValidationMutation]
  );

  // Create range validation shortcut
  const createRangeValidation = useCallback(
    async (data: {
      fieldId: Id<"dbFields">;
      min?: number;
      max?: number;
      errorMessage?: string;
    }) => {
      return await createRangeValidationMutation({
        ...data,
        tableId,
      });
    },
    [tableId, createRangeValidationMutation]
  );

  // Update validation
  const updateValidation = useCallback(
    async (
      validationId: Id<"dbFieldValidations">,
      updates: {
        config?: ValidationConfig;
        isActive?: boolean;
        runOnCreate?: boolean;
        runOnUpdate?: boolean;
      }
    ) => {
      return await updateValidationMutation({
        validationId,
        ...updates,
      });
    },
    [updateValidationMutation]
  );

  // Delete validation
  const deleteValidation = useCallback(
    async (validationId: Id<"dbFieldValidations">) => {
      return await deleteValidationMutation({ validationId });
    },
    [deleteValidationMutation]
  );

  // Toggle validation active state
  const toggleValidation = useCallback(
    async (validationId: Id<"dbFieldValidations">) => {
      return await toggleValidationMutation({ validationId });
    },
    [toggleValidationMutation]
  );

  // Get validations for a specific field
  const getFieldValidations = useCallback(
    (fieldId: Id<"dbFields">) => {
      return validations?.filter((v) => v.fieldId === fieldId) ?? [];
    },
    [validations]
  );

  // Get active validations for a specific field
  const getActiveFieldValidations = useCallback(
    (fieldId: Id<"dbFields">) => {
      return activeValidations?.filter((v) => v.fieldId === fieldId) ?? [];
    },
    [activeValidations]
  );

  return {
    // Data
    validations: validations ?? [],
    activeValidations: activeValidations ?? [],
    isLoading: validations === undefined,

    // Actions
    createValidation,
    createRegexValidation,
    createRangeValidation,
    updateValidation,
    deleteValidation,
    toggleValidation,

    // Helpers
    getFieldValidations,
    getActiveFieldValidations,
  };
}

export function useSingleFieldValidation(fieldId: Id<"dbFields"> | null) {
  const validations = useQuery(
    api.features.database.fieldValidation.getFieldValidations,
    fieldId ? { fieldId } : "skip"
  );

  return {
    validations: validations ?? [],
    isLoading: fieldId !== null && validations === undefined,
  };
}

export function useValidateRow(tableId: Id<"dbTables">) {
  const validateRow = useQuery(api.features.database.fieldValidation.validateRow, {
    tableId,
    rowData: {},
    isCreate: true,
  });

  // Note: This is a simplified version. In practice, you'd want to
  // call this with actual row data when validating a form
  return {
    validate: useCallback(
      async (rowData: Record<string, any>, isCreate = false) => {
        // In real usage, you'd call the query with actual data
        // This would require a mutation or action instead of query
        return { isValid: true, errors: {} };
      },
      []
    ),
  };
}
