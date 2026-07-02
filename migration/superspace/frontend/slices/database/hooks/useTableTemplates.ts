/**
 * useTableTemplates Hook
 * Feature #92 - Table templates for reusable table structures
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback } from "react";

export interface TemplateField {
  name: string;
  type: string;
  options?: any;
  isRequired?: boolean;
  defaultValue?: any;
}

export interface TemplateView {
  name: string;
  type: string;
  config?: any;
}

export interface UseTableTemplatesOptions {
  workspaceId: Id<"workspaces">;
  category?: string;
  includeGlobal?: boolean;
}

export function useTableTemplates(options: UseTableTemplatesOptions) {
  const { workspaceId, category, includeGlobal = true } = options;

  // Queries
  const templates = useQuery(api.features.database.tableTemplates.getTemplates, {
    workspaceId,
    category,
    includeGlobal,
  });

  const globalTemplates = useQuery(
    api.features.database.tableTemplates.getGlobalTemplates,
    {}
  );

  // Mutations
  const createTemplateMutation = useMutation(
    api.features.database.tableTemplates.createTemplate
  );
  const createFromTableMutation = useMutation(
    api.features.database.tableTemplates.createTemplateFromTable
  );
  const applyTemplateMutation = useMutation(
    api.features.database.tableTemplates.applyTemplate
  );
  const updateTemplateMutation = useMutation(
    api.features.database.tableTemplates.updateTemplate
  );
  const deleteTemplateMutation = useMutation(
    api.features.database.tableTemplates.deleteTemplate
  );
  const duplicateTemplateMutation = useMutation(
    api.features.database.tableTemplates.duplicateTemplate
  );

  // Create a new template
  const createTemplate = useCallback(
    async (data: {
      name: string;
      description?: string;
      icon?: string;
      category?: string;
      fields: TemplateField[];
      defaultViews?: TemplateView[];
    }) => {
      return await createTemplateMutation({
        workspaceId,
        ...data,
      });
    },
    [workspaceId, createTemplateMutation]
  );

  // Create template from existing table
  const createFromTable = useCallback(
    async (data: {
      tableId: Id<"dbTables">;
      name: string;
      description?: string;
      category?: string;
    }) => {
      return await createFromTableMutation(data);
    },
    [createFromTableMutation]
  );

  // Apply template to create new table
  const applyTemplate = useCallback(
    async (data: {
      templateId: Id<"dbTableTemplates">;
      databaseId: Id<"universalDatabases">;
      tableName: string;
    }) => {
      return await applyTemplateMutation({
        ...data,
        workspaceId,
      });
    },
    [workspaceId, applyTemplateMutation]
  );

  // Update template
  const updateTemplate = useCallback(
    async (
      templateId: Id<"dbTableTemplates">,
      updates: {
        name?: string;
        description?: string;
        icon?: string;
        category?: string;
        fields?: TemplateField[];
        defaultViews?: TemplateView[];
        isPublished?: boolean;
      }
    ) => {
      return await updateTemplateMutation({
        templateId,
        ...updates,
      });
    },
    [updateTemplateMutation]
  );

  // Delete template
  const deleteTemplate = useCallback(
    async (templateId: Id<"dbTableTemplates">) => {
      return await deleteTemplateMutation({ templateId });
    },
    [deleteTemplateMutation]
  );

  // Duplicate template
  const duplicateTemplate = useCallback(
    async (templateId: Id<"dbTableTemplates">, newName?: string) => {
      return await duplicateTemplateMutation({ templateId, newName });
    },
    [duplicateTemplateMutation]
  );

  // Get templates by category
  const getByCategory = useCallback(
    (cat: string) => {
      return templates?.filter((t) => t.category === cat) ?? [];
    },
    [templates]
  );

  return {
    // Data
    templates: templates ?? [],
    globalTemplates: globalTemplates ?? [],
    isLoading: templates === undefined,

    // Actions
    createTemplate,
    createFromTable,
    applyTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,

    // Helpers
    getByCategory,
  };
}

export function useTemplate(templateId: Id<"dbTableTemplates"> | null) {
  const template = useQuery(
    api.features.database.tableTemplates.getTemplate,
    templateId ? { templateId } : "skip"
  );

  return {
    template,
    isLoading: templateId !== null && template === undefined,
  };
}
