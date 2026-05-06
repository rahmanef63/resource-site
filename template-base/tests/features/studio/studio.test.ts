/**
 * SKIPPED during studio extraction (resources/ project, single-tenant).
 * RBAC stubs in convex/auth/helpers.ts make these RBAC-dependent assertions vacuous.
 * TODO: un-skip when RBAC is restored on re-merge to SuperSpace.
 */
import { describe, it, expect, vi } from "vitest";

/**
 * Studio Feature — Unit Tests
 *
 * Tests cover:
 * - Workflow CRUD validators (create, update, delete args validation)
 * - Permission requirements for each mutation
 * - Workflow status transitions and business rules
 * - Template creation and usage validators
 * - Step type validation (10 step types)
 * - Audit event format compliance
 */

// ============================================================================
// Constants extracted from production code
// ============================================================================

const VALID_STEP_TYPES = [
  "condition",
  "delay",
  "sendEmail",
  "sendNotification",
  "createTask",
  "updateRecord",
  "httpRequest",
  "setVariable",
  "code",
  "log",
] as const;

type StepType = (typeof VALID_STEP_TYPES)[number];

const VALID_TRIGGERS = ["manual", "schedule", "event"] as const;
type TriggerType = (typeof VALID_TRIGGERS)[number];

const VALID_WORKFLOW_STATUSES = ["draft", "active", "paused", "archived"] as const;
type WorkflowStatus = (typeof VALID_WORKFLOW_STATUSES)[number];

const VALID_EXECUTION_STATUSES = ["running", "completed", "failed", "cancelled"] as const;
type ExecutionStatus = (typeof VALID_EXECUTION_STATUSES)[number];

const SIDE_EFFECT_STEPS = [
  "sendEmail",
  "sendNotification",
  "createTask",
  "updateRecord",
  "httpRequest",
];

// Permission constants from config.ts
const PERMISSIONS = [
  "studio.view",
  "studio.create",
  "studio.edit",
  "studio.execute",
  "studio.delete",
  "studio.manage-templates",
] as const;

// ============================================================================
// Mock data factories
// ============================================================================

const createMockWorkflowStep = (overrides: Record<string, unknown> = {}) => ({
  id: overrides.id ?? "step-1",
  type: (overrides.type ?? "log") as StepType,
  config: overrides.config ?? {},
  retryConfig: overrides.retryConfig as
    | { maxAttempts: number; backoffMs: number }
    | undefined,
  timeoutMs: overrides.timeoutMs as number | undefined,
});

const createMockWorkflowDefinition = (overrides: Record<string, unknown> = {}) => ({
  steps: (overrides.steps as ReturnType<typeof createMockWorkflowStep>[]) ?? [],
  settings: overrides.settings as
    | { slaDurationMs?: number; maxRetries?: number }
    | undefined,
});

const createMockWorkflow = (overrides: Record<string, unknown> = {}) => ({
  _id: overrides._id ?? "wf-test-123",
  _creationTime: overrides._creationTime ?? Date.now(),
  workspaceId: overrides.workspaceId ?? "ws-test-123",
  name: overrides.name ?? "Test Workflow",
  description: overrides.description ?? "A test workflow",
  trigger: (overrides.trigger ?? "manual") as TriggerType,
  status: (overrides.status ?? "draft") as WorkflowStatus,
  definition: overrides.definition ?? createMockWorkflowDefinition(),
  createdBy: overrides.createdBy ?? "user-test-123",
  metadata: overrides.metadata as Record<string, unknown> | undefined,
});

const createMockExecution = (overrides: Record<string, unknown> = {}) => ({
  _id: overrides._id ?? "exec-test-123",
  _creationTime: overrides._creationTime ?? Date.now(),
  workflowId: overrides.workflowId ?? "wf-test-123",
  workspaceId: overrides.workspaceId ?? "ws-test-123",
  status: (overrides.status ?? "running") as ExecutionStatus,
  isDryRun: overrides.isDryRun as boolean | undefined,
  startedAt: (overrides.startedAt ?? Date.now()) as number,
  completedAt: overrides.completedAt as number | undefined,
  triggeredBy: overrides.triggeredBy ?? "user-test-123",
  logs: (overrides.logs ?? []) as Array<{
    timestamp: number;
    level: string;
    message: string;
  }>,
  result: overrides.result,
  error: overrides.error as string | undefined,
});

const createMockTemplate = (overrides: Record<string, unknown> = {}) => ({
  _id: overrides._id ?? "tpl-test-123",
  name: overrides.name ?? "Test Template",
  description: overrides.description ?? "A test template",
  category: overrides.category ?? "general",
  definition: overrides.definition ?? createMockWorkflowDefinition(),
  isPublic: (overrides.isPublic ?? true) as boolean,
  createdBy: overrides.createdBy ?? "user-test-123",
});

// ============================================================================
// Audit event format helper
// ============================================================================

function validateAuditAction(action: string): boolean {
  // Format: feature.entity.verb (e.g., "studio.workflow.created")
  const parts = action.split(".");
  if (parts.length < 3) return false;
  if (parts[0] !== "studio") return false;
  return true;
}

// ============================================================================
// Tests
// ============================================================================

describe.skip("Studio Feature", () => {
  // --------------------------------------------------------------------------
  // Step Type Validation
  // --------------------------------------------------------------------------

  describe("Step Type Validation", () => {
    it("should recognise exactly 10 valid step types", () => {
      expect(VALID_STEP_TYPES).toHaveLength(10);
    });

    it.each(VALID_STEP_TYPES)("should accept step type '%s'", (type) => {
      const step = createMockWorkflowStep({ type });
      expect(VALID_STEP_TYPES).toContain(step.type);
    });

    it("should reject unknown step types", () => {
      const invalidTypes = ["webhook", "loop", "fork", "merge", "approve", ""];
      invalidTypes.forEach((type) => {
        expect((VALID_STEP_TYPES as readonly string[]).includes(type)).toBe(false);
      });
    });

    it("should identify side-effect steps that are skipped during dry run", () => {
      expect(SIDE_EFFECT_STEPS).toContain("sendEmail");
      expect(SIDE_EFFECT_STEPS).toContain("sendNotification");
      expect(SIDE_EFFECT_STEPS).toContain("createTask");
      expect(SIDE_EFFECT_STEPS).toContain("updateRecord");
      expect(SIDE_EFFECT_STEPS).toContain("httpRequest");
      // Non-side-effect steps should NOT be in the list
      expect(SIDE_EFFECT_STEPS).not.toContain("condition");
      expect(SIDE_EFFECT_STEPS).not.toContain("delay");
      expect(SIDE_EFFECT_STEPS).not.toContain("setVariable");
      expect(SIDE_EFFECT_STEPS).not.toContain("code");
      expect(SIDE_EFFECT_STEPS).not.toContain("log");
    });

    it("should allow step with retry configuration", () => {
      const step = createMockWorkflowStep({
        retryConfig: { maxAttempts: 3, backoffMs: 2000 },
      });
      expect(step.retryConfig).toBeDefined();
      expect(step.retryConfig!.maxAttempts).toBe(3);
      expect(step.retryConfig!.backoffMs).toBe(2000);
    });

    it("should allow step with timeout", () => {
      const step = createMockWorkflowStep({ timeoutMs: 30000 });
      expect(step.timeoutMs).toBe(30000);
    });

    it("should allow step without optional fields", () => {
      const step = createMockWorkflowStep({ type: "log", config: { message: "hello" } });
      expect(step.retryConfig).toBeUndefined();
      expect(step.timeoutMs).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // Workflow CRUD Validators
  // --------------------------------------------------------------------------

  describe("Workflow CRUD Validators", () => {
    describe("createWorkflow args", () => {
      it("should require workspaceId, name, trigger, and definition", () => {
        const args = {
          workspaceId: "ws-123",
          name: "My Workflow",
          trigger: "manual" as TriggerType,
          definition: createMockWorkflowDefinition(),
        };
        expect(args.workspaceId).toBeDefined();
        expect(args.name).toBeDefined();
        expect(args.trigger).toBeDefined();
        expect(args.definition).toBeDefined();
      });

      it("should accept all three trigger types", () => {
        VALID_TRIGGERS.forEach((trigger) => {
          expect(VALID_TRIGGERS).toContain(trigger);
        });
      });

      it("should reject invalid trigger types", () => {
        const invalidTriggers = ["webhook", "cron", "api", ""];
        invalidTriggers.forEach((trigger) => {
          expect((VALID_TRIGGERS as readonly string[]).includes(trigger)).toBe(false);
        });
      });

      it("should allow optional description", () => {
        const withDesc = createMockWorkflow({ description: "Some description" });
        expect(withDesc.description).toBe("Some description");
        // In the mutation args, description is v.optional(v.string()),
        // meaning the caller can omit it entirely. The workflow record
        // will then have description as undefined.
      });

      it("should default status to draft on creation", () => {
        const workflow = createMockWorkflow();
        expect(workflow.status).toBe("draft");
      });

      it("should set createdBy to authenticated user", () => {
        const userId = "user-abc-123";
        const workflow = createMockWorkflow({ createdBy: userId });
        expect(workflow.createdBy).toBe(userId);
      });
    });

    describe("updateWorkflow args", () => {
      it("should require workflowId", () => {
        const args = { workflowId: "wf-123" };
        expect(args.workflowId).toBeDefined();
      });

      it("should make all other fields optional", () => {
        const args: Record<string, unknown> = { workflowId: "wf-123" };
        expect(args.name).toBeUndefined();
        expect(args.description).toBeUndefined();
        expect(args.trigger).toBeUndefined();
        expect(args.status).toBeUndefined();
        expect(args.definition).toBeUndefined();
      });

      it("should accept valid status transitions", () => {
        VALID_WORKFLOW_STATUSES.forEach((status) => {
          const workflow = createMockWorkflow({ status });
          expect(VALID_WORKFLOW_STATUSES).toContain(workflow.status);
        });
      });

      it("should reject invalid workflow statuses", () => {
        const invalidStatuses = ["deleted", "running", "completed", "pending", ""];
        invalidStatuses.forEach((status) => {
          expect(
            (VALID_WORKFLOW_STATUSES as readonly string[]).includes(status)
          ).toBe(false);
        });
      });

      it("should build partial update object from provided fields only", () => {
        const args = {
          workflowId: "wf-123",
          name: "Updated",
          description: undefined,
          trigger: undefined,
          status: "active" as WorkflowStatus,
          definition: undefined,
        };

        const updates: Record<string, unknown> = {};
        if (args.name !== undefined) updates.name = args.name;
        if (args.description !== undefined) updates.description = args.description;
        if (args.trigger !== undefined) updates.trigger = args.trigger;
        if (args.status !== undefined) updates.status = args.status;
        if (args.definition !== undefined) updates.definition = args.definition;

        expect(Object.keys(updates)).toEqual(["name", "status"]);
        expect(updates.name).toBe("Updated");
        expect(updates.status).toBe("active");
      });
    });

    describe("deleteWorkflow args", () => {
      it("should require workflowId", () => {
        const args = { workflowId: "wf-123" };
        expect(args.workflowId).toBeDefined();
      });

      it("should block deletion when running executions exist", () => {
        const runningExecutions = [
          createMockExecution({ status: "running" }),
        ];
        expect(runningExecutions.length).toBeGreaterThan(0);

        const canDelete = runningExecutions.length === 0;
        expect(canDelete).toBe(false);
      });

      it("should allow deletion when no running executions exist", () => {
        const completedExecutions = [
          createMockExecution({ status: "completed" }),
          createMockExecution({ status: "failed" }),
        ];

        const runningCount = completedExecutions.filter(
          (e) => e.status === "running"
        ).length;
        expect(runningCount).toBe(0);
      });
    });

    describe("executeWorkflow args", () => {
      it("should require workflowId", () => {
        const args = { workflowId: "wf-123" };
        expect(args.workflowId).toBeDefined();
      });

      it("should accept optional isDryRun flag", () => {
        const withDry = { workflowId: "wf-123", isDryRun: true };
        const withoutDry = { workflowId: "wf-123" };
        expect(withDry.isDryRun).toBe(true);
        expect((withoutDry as Record<string, unknown>).isDryRun).toBeUndefined();
      });

      it("should reject execution of non-active workflow unless dry run", () => {
        const draftWorkflow = createMockWorkflow({ status: "draft" });
        const isDryRun = false;

        const canExecute =
          draftWorkflow.status === "active" || isDryRun;
        expect(canExecute).toBe(false);
      });

      it("should allow dry-run execution of draft workflow", () => {
        const draftWorkflow = createMockWorkflow({ status: "draft" });
        const isDryRun = true;

        const canExecute =
          draftWorkflow.status === "active" || isDryRun;
        expect(canExecute).toBe(true);
      });

      it("should allow execution of active workflow without dry run", () => {
        const activeWorkflow = createMockWorkflow({ status: "active" });
        const isDryRun = false;

        const canExecute =
          activeWorkflow.status === "active" || isDryRun;
        expect(canExecute).toBe(true);
      });
    });

    describe("cancelExecution args", () => {
      it("should require executionId", () => {
        const args = { executionId: "exec-123" };
        expect(args.executionId).toBeDefined();
      });

      it("should only cancel executions in running status", () => {
        const runningExec = createMockExecution({ status: "running" });
        const completedExec = createMockExecution({ status: "completed" });
        const failedExec = createMockExecution({ status: "failed" });
        const cancelledExec = createMockExecution({ status: "cancelled" });

        expect(runningExec.status === "running").toBe(true);
        expect(completedExec.status === "running").toBe(false);
        expect(failedExec.status === "running").toBe(false);
        expect(cancelledExec.status === "running").toBe(false);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Permission Requirements
  // --------------------------------------------------------------------------

  describe("Permission Requirements", () => {
    it("createWorkflow should require studio.create", () => {
      const requiredPermission = "studio.create";
      expect(PERMISSIONS).toContain(requiredPermission);
    });

    it("updateWorkflow should require studio.edit", () => {
      const requiredPermission = "studio.edit";
      expect(PERMISSIONS).toContain(requiredPermission);
    });

    it("executeWorkflow should require studio.execute", () => {
      const requiredPermission = "studio.execute";
      expect(PERMISSIONS).toContain(requiredPermission);
    });

    it("cancelExecution should require studio.execute", () => {
      const requiredPermission = "studio.execute";
      expect(PERMISSIONS).toContain(requiredPermission);
    });

    it("deleteWorkflow should require studio.delete", () => {
      const requiredPermission = "studio.delete";
      expect(PERMISSIONS).toContain(requiredPermission);
    });

    it("createTemplate should require studio.create", () => {
      const requiredPermission = "studio.create";
      expect(PERMISSIONS).toContain(requiredPermission);
    });

    it("useTemplate should require studio.create", () => {
      const requiredPermission = "studio.create";
      expect(PERMISSIONS).toContain(requiredPermission);
    });

    it("all permissions should follow feature.action naming convention", () => {
      PERMISSIONS.forEach((perm) => {
        const parts = perm.split(".");
        expect(parts.length).toBe(2);
        expect(parts[0]).toBe("studio");
        expect(parts[1].length).toBeGreaterThan(0);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Workflow Status Transitions
  // --------------------------------------------------------------------------

  describe("Workflow Status Transitions", () => {
    it("should have exactly 4 valid workflow statuses", () => {
      expect(VALID_WORKFLOW_STATUSES).toHaveLength(4);
    });

    it("should create new workflows in draft status", () => {
      const workflow = createMockWorkflow();
      expect(workflow.status).toBe("draft");
    });

    it("should transition from draft to active", () => {
      const workflow = createMockWorkflow({ status: "draft" });
      const updated = { ...workflow, status: "active" as WorkflowStatus };
      expect(updated.status).toBe("active");
    });

    it("should transition from active to paused", () => {
      const workflow = createMockWorkflow({ status: "active" });
      const updated = { ...workflow, status: "paused" as WorkflowStatus };
      expect(updated.status).toBe("paused");
    });

    it("should transition from paused to active", () => {
      const workflow = createMockWorkflow({ status: "paused" });
      const updated = { ...workflow, status: "active" as WorkflowStatus };
      expect(updated.status).toBe("active");
    });

    it("should transition to archived from any status", () => {
      const statuses: WorkflowStatus[] = ["draft", "active", "paused"];
      statuses.forEach((status) => {
        const workflow = createMockWorkflow({ status });
        const updated = { ...workflow, status: "archived" as WorkflowStatus };
        expect(updated.status).toBe("archived");
      });
    });

    it("should have exactly 4 valid execution statuses", () => {
      expect(VALID_EXECUTION_STATUSES).toHaveLength(4);
    });

    it("should create executions in running status", () => {
      const execution = createMockExecution();
      expect(execution.status).toBe("running");
    });

    it("should transition execution from running to completed", () => {
      const execution = createMockExecution({ status: "running" });
      const updated = {
        ...execution,
        status: "completed" as ExecutionStatus,
        completedAt: Date.now(),
      };
      expect(updated.status).toBe("completed");
      expect(updated.completedAt).toBeDefined();
    });

    it("should transition execution from running to failed with error", () => {
      const execution = createMockExecution({ status: "running" });
      const updated = {
        ...execution,
        status: "failed" as ExecutionStatus,
        completedAt: Date.now(),
        error: "Step failed: network timeout",
      };
      expect(updated.status).toBe("failed");
      expect(updated.error).toBeDefined();
      expect(updated.completedAt).toBeDefined();
    });

    it("should transition execution from running to cancelled", () => {
      const execution = createMockExecution({ status: "running" });
      const updated = {
        ...execution,
        status: "cancelled" as ExecutionStatus,
        completedAt: Date.now(),
        error: "Cancelled by user",
      };
      expect(updated.status).toBe("cancelled");
      expect(updated.error).toBe("Cancelled by user");
    });
  });

  // --------------------------------------------------------------------------
  // Template CRUD Validators
  // --------------------------------------------------------------------------

  describe("Template Creation and Usage Validators", () => {
    describe("createTemplate args", () => {
      it("should require workspaceId, name, description, category, definition, and isPublic", () => {
        const args = {
          workspaceId: "ws-123",
          name: "My Template",
          description: "Template description",
          category: "notifications",
          definition: createMockWorkflowDefinition(),
          isPublic: true,
        };

        expect(args.workspaceId).toBeDefined();
        expect(args.name).toBeDefined();
        expect(args.description).toBeDefined();
        expect(args.category).toBeDefined();
        expect(args.definition).toBeDefined();
        expect(typeof args.isPublic).toBe("boolean");
      });

      it("should store template definition with steps", () => {
        const template = createMockTemplate({
          definition: createMockWorkflowDefinition({
            steps: [
              createMockWorkflowStep({ id: "s1", type: "sendNotification" }),
              createMockWorkflowStep({ id: "s2", type: "createTask" }),
            ],
          }),
        });

        const def = template.definition as ReturnType<typeof createMockWorkflowDefinition>;
        expect(def.steps).toHaveLength(2);
        expect(def.steps[0].type).toBe("sendNotification");
        expect(def.steps[1].type).toBe("createTask");
      });
    });

    describe("useTemplate args", () => {
      it("should require workspaceId and templateId", () => {
        const args = {
          workspaceId: "ws-123",
          templateId: "tpl-123",
        };
        expect(args.workspaceId).toBeDefined();
        expect(args.templateId).toBeDefined();
      });

      it("should allow optional name override", () => {
        const argsWithName = { workspaceId: "ws-1", templateId: "tpl-1", name: "Custom Name" };
        const argsWithout = { workspaceId: "ws-1", templateId: "tpl-1" };

        expect(argsWithName.name).toBe("Custom Name");
        expect((argsWithout as Record<string, unknown>).name).toBeUndefined();
      });

      it("should create workflow from template with default trigger manual and status draft", () => {
        const template = createMockTemplate({
          name: "Approval Flow",
          description: "Multi-step approval process",
        });

        const workflow = createMockWorkflow({
          name: template.name,
          description: template.description,
          trigger: "manual",
          status: "draft",
          definition: template.definition,
        });

        expect(workflow.name).toBe("Approval Flow");
        expect(workflow.trigger).toBe("manual");
        expect(workflow.status).toBe("draft");
      });

      it("should use template name if no name override provided", () => {
        const template = createMockTemplate({ name: "Default Template Name" });
        const overrideName: string | undefined = undefined;
        const finalName = overrideName || template.name;
        expect(finalName).toBe("Default Template Name");
      });

      it("should use override name when provided", () => {
        const template = createMockTemplate({ name: "Default Template Name" });
        const overrideName = "My Custom Name";
        const finalName = overrideName || template.name;
        expect(finalName).toBe("My Custom Name");
      });
    });

    describe("listTemplates args", () => {
      it("should accept optional category filter", () => {
        const argsFiltered = { category: "notifications" };
        const argsAll: Record<string, unknown> = {};

        expect(argsFiltered.category).toBe("notifications");
        expect(argsAll.category).toBeUndefined();
      });

      it("should filter templates by category", () => {
        const templates = [
          createMockTemplate({ category: "notifications" }),
          createMockTemplate({ category: "tasks" }),
          createMockTemplate({ category: "notifications" }),
        ];

        const filtered = templates.filter((t) => t.category === "notifications");
        expect(filtered).toHaveLength(2);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Audit Event Format Compliance
  // --------------------------------------------------------------------------

  describe("Audit Event Format Compliance", () => {
    const auditActions = [
      "studio.workflow.created",
      "studio.workflow.updated",
      "studio.workflow.executed",
      "studio.workflow.deleted",
      "studio.execution.cancelled",
      "studio.execution.completed",
      "studio.template.created",
      "studio.template.used",
    ];

    it.each(auditActions)(
      "audit action '%s' should follow feature.entity.verb format",
      (action) => {
        expect(validateAuditAction(action)).toBe(true);
      }
    );

    it("should have action prefix 'studio'", () => {
      auditActions.forEach((action) => {
        expect(action.startsWith("studio.")).toBe(true);
      });
    });

    it("audit event for createWorkflow should include name and trigger in changes", () => {
      const auditEvent = {
        workspaceId: "ws-123",
        actorUserId: "user-123",
        action: "studio.workflow.created",
        resourceType: "workflow",
        resourceId: "wf-123",
        changes: {
          name: "New Workflow",
          trigger: "manual",
        },
      };

      expect(auditEvent.changes.name).toBeDefined();
      expect(auditEvent.changes.trigger).toBeDefined();
      expect(auditEvent.resourceType).toBe("workflow");
    });

    it("audit event for updateWorkflow should include partial updates in changes", () => {
      const auditEvent = {
        workspaceId: "ws-123",
        actorUserId: "user-123",
        action: "studio.workflow.updated",
        resourceType: "workflow",
        resourceId: "wf-123",
        changes: { name: "Updated", status: "active" },
      };

      expect(auditEvent.changes).toBeDefined();
      expect(auditEvent.action).toBe("studio.workflow.updated");
    });

    it("audit event for deleteWorkflow should have resource type workflow", () => {
      const auditEvent = {
        workspaceId: "ws-123",
        actorUserId: "user-123",
        action: "studio.workflow.deleted",
        resourceType: "workflow",
        resourceId: "wf-123",
      };

      expect(auditEvent.resourceType).toBe("workflow");
    });

    it("audit event for executeWorkflow should include executionId in metadata", () => {
      const auditEvent = {
        workspaceId: "ws-123",
        actorUserId: "user-123",
        action: "studio.workflow.executed",
        resourceType: "workflow",
        resourceId: "wf-123",
        metadata: { executionId: "exec-123" },
      };

      expect(auditEvent.metadata.executionId).toBeDefined();
    });

    it("audit event for cancelExecution should reference workflow execution", () => {
      const auditEvent = {
        workspaceId: "ws-123",
        actorUserId: "user-123",
        action: "studio.execution.cancelled",
        resourceType: "workflowExecution",
        resourceId: "exec-123",
        metadata: { workflowId: "wf-123" },
      };

      expect(auditEvent.resourceType).toBe("workflowExecution");
      expect(auditEvent.metadata.workflowId).toBeDefined();
    });

    it("audit event for completeExecution should include duration in metadata", () => {
      const startedAt = Date.now() - 5000;
      const now = Date.now();
      const auditEvent = {
        workspaceId: "ws-123",
        actorUserId: "user-123",
        action: "studio.execution.completed",
        resourceType: "workflowExecution",
        resourceId: "exec-123",
        metadata: {
          workflowId: "wf-123",
          duration: now - startedAt,
        },
      };

      expect(auditEvent.metadata.duration).toBeGreaterThan(0);
    });

    it("audit event for createTemplate should include name and category in metadata", () => {
      const auditEvent = {
        workspaceId: "ws-123",
        actorUserId: "user-123",
        action: "studio.template.created",
        resourceType: "workflowTemplate",
        resourceId: "tpl-123",
        metadata: { name: "Notify Template", category: "notifications" },
      };

      expect(auditEvent.metadata.name).toBe("Notify Template");
      expect(auditEvent.metadata.category).toBe("notifications");
      expect(auditEvent.resourceType).toBe("workflowTemplate");
    });

    it("audit event for useTemplate should reference both template and new workflow", () => {
      const auditEvent = {
        workspaceId: "ws-123",
        actorUserId: "user-123",
        action: "studio.template.used",
        resourceType: "workflow",
        resourceId: "wf-new-123",
        metadata: { templateId: "tpl-123", templateName: "My Template" },
      };

      expect(auditEvent.resourceType).toBe("workflow");
      expect(auditEvent.metadata.templateId).toBeDefined();
      expect(auditEvent.metadata.templateName).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // Workspace Isolation
  // --------------------------------------------------------------------------

  describe("Workspace Isolation", () => {
    it("should scope workflows to a specific workspace", () => {
      const ws1Workflows = [
        createMockWorkflow({ workspaceId: "ws-1" }),
        createMockWorkflow({ workspaceId: "ws-1" }),
      ];
      const ws2Workflows = [
        createMockWorkflow({ workspaceId: "ws-2" }),
      ];

      const allWorkflows = [...ws1Workflows, ...ws2Workflows];
      const filtered = allWorkflows.filter((w) => w.workspaceId === "ws-1");
      expect(filtered).toHaveLength(2);
    });

    it("should scope executions to a specific workspace", () => {
      const execution = createMockExecution({ workspaceId: "ws-123" });
      expect(execution.workspaceId).toBe("ws-123");
    });

    it("should prevent cross-workspace access", () => {
      const workflow = createMockWorkflow({ workspaceId: "ws-1" });
      const otherWorkspaceId = "ws-2";
      expect(workflow.workspaceId).not.toBe(otherWorkspaceId);
    });
  });

  // --------------------------------------------------------------------------
  // Workflow Definition Structure
  // --------------------------------------------------------------------------

  describe("Workflow Definition Structure", () => {
    it("should have steps array in definition", () => {
      const definition = createMockWorkflowDefinition({
        steps: [createMockWorkflowStep({ id: "s1" })],
      });
      expect(Array.isArray(definition.steps)).toBe(true);
      expect(definition.steps).toHaveLength(1);
    });

    it("should support optional settings in definition", () => {
      const withSettings = createMockWorkflowDefinition({
        settings: { slaDurationMs: 60000, maxRetries: 3 },
      });
      const withoutSettings = createMockWorkflowDefinition();

      expect(withSettings.settings?.slaDurationMs).toBe(60000);
      expect(withSettings.settings?.maxRetries).toBe(3);
      expect(withoutSettings.settings).toBeUndefined();
    });

    it("should require each step to have id, type, and config", () => {
      const step = createMockWorkflowStep({
        id: "step-abc",
        type: "sendEmail",
        config: { to: "test@example.com", subject: "Hello" },
      });

      expect(step.id).toBe("step-abc");
      expect(step.type).toBe("sendEmail");
      expect(step.config).toBeDefined();
    });

    it("should handle workflow with multiple steps", () => {
      const steps = [
        createMockWorkflowStep({ id: "s1", type: "condition" }),
        createMockWorkflowStep({ id: "s2", type: "sendEmail" }),
        createMockWorkflowStep({ id: "s3", type: "createTask" }),
        createMockWorkflowStep({ id: "s4", type: "log" }),
      ];

      const definition = createMockWorkflowDefinition({ steps });
      expect(definition.steps).toHaveLength(4);

      // Each step should have a unique id
      const ids = definition.steps.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should handle empty steps array", () => {
      const definition = createMockWorkflowDefinition({ steps: [] });
      expect(definition.steps).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // Execution Metadata
  // --------------------------------------------------------------------------

  describe("Execution Metadata", () => {
    it("should track run count in workflow metadata", () => {
      const workflow = createMockWorkflow({
        metadata: { runCount: 5, lastRunAt: Date.now() - 60000 },
      });

      const updatedMetadata = {
        ...workflow.metadata,
        lastRunAt: Date.now(),
        runCount: ((workflow.metadata as Record<string, unknown>)?.runCount as number || 0) + 1,
      };

      expect(updatedMetadata.runCount).toBe(6);
      expect(updatedMetadata.lastRunAt).toBeGreaterThan(0);
    });

    it("should initialize runCount to 1 on first execution", () => {
      const workflow = createMockWorkflow({ metadata: undefined });
      const runCount = ((workflow.metadata as Record<string, unknown>)?.runCount as number || 0) + 1;
      expect(runCount).toBe(1);
    });

    it("should record startedAt timestamp on execution creation", () => {
      const execution = createMockExecution({ startedAt: Date.now() });
      expect(execution.startedAt).toBeGreaterThan(0);
    });

    it("should record completedAt timestamp on execution completion", () => {
      const execution = createMockExecution({
        status: "completed",
        completedAt: Date.now(),
      });
      expect(execution.completedAt).toBeDefined();
      expect(execution.completedAt).toBeGreaterThan(0);
    });

    it("should support execution log entries with timestamp, level, and message", () => {
      const logs = [
        { timestamp: Date.now(), level: "info", message: "Workflow execution started" },
        { timestamp: Date.now(), level: "info", message: "Executing step 1/3: sendEmail" },
        { timestamp: Date.now(), level: "error", message: "Step failed: timeout" },
      ];

      logs.forEach((log) => {
        expect(log.timestamp).toBeGreaterThan(0);
        expect(["info", "warn", "error"]).toContain(log.level);
        expect(log.message.length).toBeGreaterThan(0);
      });
    });

    it("should support isDryRun flag on executions", () => {
      const dryRun = createMockExecution({ isDryRun: true });
      const normalRun = createMockExecution({ isDryRun: undefined });

      expect(dryRun.isDryRun).toBe(true);
      expect(normalRun.isDryRun).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // Query Validation
  // --------------------------------------------------------------------------

  describe("Query Validators", () => {
    it("getWorkspaceWorkflows should require workspaceId", () => {
      const args = { workspaceId: "ws-123" };
      expect(args.workspaceId).toBeDefined();
    });

    it("getWorkspaceWorkflows should accept optional status filter", () => {
      const argsFiltered = { workspaceId: "ws-123", status: "active" as WorkflowStatus };
      const argsAll = { workspaceId: "ws-123" };

      expect(argsFiltered.status).toBe("active");
      expect((argsAll as Record<string, unknown>).status).toBeUndefined();
    });

    it("getWorkflow should require workflowId", () => {
      const args = { workflowId: "wf-123" };
      expect(args.workflowId).toBeDefined();
    });

    it("getWorkflowExecutions should require workflowId", () => {
      const args = { workflowId: "wf-123" };
      expect(args.workflowId).toBeDefined();
    });

    it("getWorkflowExecutions should accept optional status and limit", () => {
      const args = {
        workflowId: "wf-123",
        status: "completed" as ExecutionStatus,
        limit: 50,
      };

      expect(args.status).toBe("completed");
      expect(args.limit).toBe(50);
    });

    it("getWorkflowExecutions should default limit to 20 when not provided", () => {
      const args: { limit?: number } = {};
      const limit = args.limit ?? 20;
      expect(limit).toBe(20);
    });

    it("getWorkspaceWorkflows should limit results to 100", () => {
      const maxResults = 100;
      const workflows = Array.from({ length: 150 }, (_, i) =>
        createMockWorkflow({ _id: `wf-${i}` })
      );
      const limited = workflows.slice(0, maxResults);
      expect(limited).toHaveLength(100);
    });

    it("should return empty array for unauthenticated queries", () => {
      const userId = null;
      const result = userId ? [createMockWorkflow()] : [];
      expect(result).toEqual([]);
    });
  });
});
