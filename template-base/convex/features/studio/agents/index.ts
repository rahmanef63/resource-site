/**
 * Server-side agents/tools for Studio workflows
 *
 * Provides AI-consumable tools for managing workflows, executions, and templates.
 * Each tool delegates to existing queries/mutations to avoid duplicating business logic.
 */

import { api } from "../../../_generated/api";
import { FeatureAgent } from "../../ai/lib/types";
import { z } from "zod";

const workflowStepSchema = z.object({
  id: z.string().describe("Unique step identifier"),
  type: z.enum([
    "condition", "delay", "sendEmail", "sendNotification",
    "createTask", "updateRecord", "httpRequest", "setVariable",
    "code", "log",
  ]).describe("Step type"),
  config: z.any().describe("Step-specific configuration object"),
  retryConfig: z.object({
    maxAttempts: z.number(),
    backoffMs: z.number(),
  }).optional().describe("Retry configuration"),
  timeoutMs: z.number().optional().describe("Step timeout in milliseconds"),
});

const workflowDefinitionSchema = z.object({
  steps: z.array(workflowStepSchema).describe("Ordered list of workflow steps"),
  settings: z.object({
    slaDurationMs: z.number().optional().describe("SLA duration in milliseconds"),
    maxRetries: z.number().optional().describe("Maximum number of retries"),
  }).optional().describe("Workflow-level settings"),
});

export const agent: FeatureAgent = {
  tools: {
    listWorkflows: {
      description: "List all workflows in a workspace, optionally filtered by status (draft, active, paused, archived). Returns workflows with creator info and execution statistics.",
      type: "query",
      handler: api.features.studio.queries.getWorkspaceWorkflows,
      args: z.object({
        workspaceId: z.string().describe("ID of the workspace"),
        status: z.enum(["draft", "active", "paused", "archived"]).optional().describe("Filter by workflow status"),
      }),
    },
    getWorkflow: {
      description: "Get a specific workflow by its ID. Returns full workflow details including creator info and recent executions.",
      type: "query",
      handler: api.features.studio.queries.getWorkflow,
      args: z.object({
        workflowId: z.string().describe("ID of the workflow to retrieve"),
      }),
    },
    createWorkflow: {
      description: "Create a new workflow in a workspace. Requires a name, trigger type, and workflow definition with steps. The workflow is created in 'draft' status.",
      type: "mutation",
      handler: api.features.studio.mutations.createWorkflow,
      args: z.object({
        workspaceId: z.string().describe("ID of the workspace"),
        name: z.string().describe("Name of the workflow"),
        description: z.string().optional().describe("Description of what the workflow does"),
        trigger: z.enum(["manual", "schedule", "event"]).describe("How the workflow is triggered"),
        definition: workflowDefinitionSchema.describe("Workflow definition containing steps and optional settings"),
      }),
    },
    updateWorkflow: {
      description: "Update an existing workflow's name, description, trigger, status, or definition. Only provided fields are updated.",
      type: "mutation",
      handler: api.features.studio.mutations.updateWorkflow,
      args: z.object({
        workflowId: z.string().describe("ID of the workflow to update"),
        name: z.string().optional().describe("New name for the workflow"),
        description: z.string().optional().describe("New description"),
        trigger: z.enum(["manual", "schedule", "event"]).optional().describe("New trigger type"),
        status: z.enum(["draft", "active", "paused", "archived"]).optional().describe("New status"),
        definition: workflowDefinitionSchema.optional().describe("New workflow definition"),
      }),
    },
    deleteWorkflow: {
      description: "Delete a workflow permanently. Fails if the workflow has any running executions.",
      type: "mutation",
      handler: api.features.studio.mutations.deleteWorkflow,
      args: z.object({
        workflowId: z.string().describe("ID of the workflow to delete"),
      }),
    },
    executeWorkflow: {
      description: "Trigger a workflow execution. The workflow must be in 'active' status unless isDryRun is true. Returns the execution ID for tracking.",
      type: "mutation",
      handler: api.features.studio.mutations.executeWorkflow,
      args: z.object({
        workflowId: z.string().describe("ID of the workflow to execute"),
        isDryRun: z.boolean().optional().describe("If true, allows running draft workflows in dry-run mode"),
      }),
    },
    listTemplates: {
      description: "List available workflow templates, optionally filtered by category. Templates provide pre-built workflow definitions that can be instantiated.",
      type: "query",
      handler: api.features.studio.templates.listTemplates,
      args: z.object({
        category: z.string().optional().describe("Filter templates by category"),
      }),
    },
    getExecutionStatus: {
      description: "Get the status and details of workflow executions. Returns execution history with status (running, completed, failed, cancelled), logs, and who triggered each execution.",
      type: "query",
      handler: api.features.studio.queries.getWorkflowExecutions,
      args: z.object({
        workflowId: z.string().describe("ID of the workflow to get executions for"),
        status: z.enum(["running", "completed", "failed", "cancelled"]).optional().describe("Filter by execution status"),
        limit: z.number().optional().describe("Maximum number of executions to return (default 20)"),
      }),
    },
  },
};

// Backward-compatible export for the existing empty array pattern
export const tools = Object.entries(agent.tools).map(([name, def]) => ({
  name,
  ...def,
}));
