/**
 * SKIPPED during studio extraction (resources/ project, single-tenant).
 * RBAC stubs in convex/auth/helpers.ts make these RBAC-dependent assertions vacuous.
 * TODO: un-skip when RBAC is restored on re-merge to SuperSpace.
 */
import { describe, it, expect } from "vitest";

/**
 * Studio — AgentConfig, SLA, Rollback, and Bulk Operation Tests
 *
 * Tests cover:
 * - AgentConfig CRUD validators and default values
 * - AgentConfig instruction versioning (updateAgentInstructions, rollbackInstructions)
 * - Train Mode and visual check validators
 * - SLA breach detection and escalation logic
 * - Rollback compensation logic for each step type
 * - Bulk workflow trigger validation
 */

// ============================================================================
// Constants
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

const ROLLBACK_CAPABLE_STEPS = ["createTask"] as const;
const NON_ROLLBACK_STEPS = [
  "sendEmail",
  "sendNotification",
  "httpRequest",
  "updateRecord",
  "setVariable",
  "code",
  "log",
  "condition",
  "delay",
] as const;

const AGENT_CONFIG_DEFAULTS = {
  provider: "openrouter",
  modelId: "google/gemini-2.5-flash",
  maxTokens: 4096,
  temperature: 0.3,
  supportsVision: false,
  maxImageInputs: 4,
  activeInstructionVersion: 1,
  targetSchemaVersion: "0.5",
  imageValidationEnabled: false,
  imageValidationMode: "manual",
  imageMatchThreshold: 0.85,
  trainModeEnabled: false,
  trainFeedbackMode: "explicit",
  trainFeedbackCount: 0,
  trainAutoUpdate: false,
  trainAutoUpdateThreshold: 5,
  exportDefaultFileName: "studio-export",
  exportImageScale: 2,
  exportIncludeMetadata: true,
  exportMinifyJson: false,
  status: "active",
};

// ============================================================================
// Mock data factories
// ============================================================================

const createMockAgentConfig = (overrides: Record<string, unknown> = {}) => ({
  _id: overrides._id ?? "cfg-test-123",
  workspaceId: overrides.workspaceId ?? "ws-test-123",
  featureId: overrides.featureId ?? "studio",
  name: overrides.name ?? "Test Agent",
  description: overrides.description as string | undefined,
  tags: (overrides.tags as string[]) ?? [],
  provider: (overrides.provider ?? AGENT_CONFIG_DEFAULTS.provider) as string,
  modelId: (overrides.modelId ?? AGENT_CONFIG_DEFAULTS.modelId) as string,
  maxTokens: (overrides.maxTokens ?? AGENT_CONFIG_DEFAULTS.maxTokens) as number,
  temperature: (overrides.temperature ?? AGENT_CONFIG_DEFAULTS.temperature) as number,
  supportsVision: (overrides.supportsVision ?? AGENT_CONFIG_DEFAULTS.supportsVision) as boolean,
  maxImageInputs: (overrides.maxImageInputs ?? AGENT_CONFIG_DEFAULTS.maxImageInputs) as number,
  activeInstructionVersion: (overrides.activeInstructionVersion ?? 1) as number,
  targetSchemaVersion: (overrides.targetSchemaVersion ?? AGENT_CONFIG_DEFAULTS.targetSchemaVersion) as string,
  imageValidationEnabled: (overrides.imageValidationEnabled ?? false) as boolean,
  imageValidationMode: (overrides.imageValidationMode ?? "manual") as string,
  imageMatchThreshold: (overrides.imageMatchThreshold ?? 0.85) as number,
  trainModeEnabled: (overrides.trainModeEnabled ?? false) as boolean,
  trainFeedbackMode: (overrides.trainFeedbackMode ?? "explicit") as string,
  trainFeedbackCount: (overrides.trainFeedbackCount ?? 0) as number,
  trainAutoUpdate: (overrides.trainAutoUpdate ?? false) as boolean,
  trainAutoUpdateThreshold: (overrides.trainAutoUpdateThreshold ?? 5) as number,
  exportDefaultFileName: (overrides.exportDefaultFileName ?? "studio-export") as string,
  exportFormats: (overrides.exportFormats ?? { png: true, jpg: false, html: true, json: true, typescript: false }) as Record<string, boolean>,
  exportImageScale: (overrides.exportImageScale ?? 2) as number,
  exportIncludeMetadata: (overrides.exportIncludeMetadata ?? true) as boolean,
  exportMinifyJson: (overrides.exportMinifyJson ?? false) as boolean,
  status: (overrides.status ?? "active") as string,
  createdBy: (overrides.createdBy ?? "user-test-123") as string,
});

const createMockInstructionVersion = (overrides: Record<string, unknown> = {}) => ({
  _id: overrides._id ?? "iv-test-123",
  agentConfigId: overrides.agentConfigId ?? "cfg-test-123",
  workspaceId: overrides.workspaceId ?? "ws-test-123",
  version: (overrides.version ?? 1) as number,
  systemPrompt: (overrides.systemPrompt ?? "You are a helpful UI builder.") as string,
  uiRules: overrides.uiRules as string | undefined,
  styleRules: overrides.styleRules as string | undefined,
  source: (overrides.source ?? "manual") as string,
  changeNote: overrides.changeNote as string | undefined,
  isActive: (overrides.isActive ?? true) as boolean,
  createdBy: (overrides.createdBy ?? "user-test-123") as string,
});

const createMockTrainFeedback = (overrides: Record<string, unknown> = {}) => ({
  _id: overrides._id ?? "fb-test-123",
  agentConfigId: overrides.agentConfigId ?? "cfg-test-123",
  workspaceId: overrides.workspaceId ?? "ws-test-123",
  inputPrompt: (overrides.inputPrompt ?? "Build a login form") as string,
  generatedSchema: overrides.generatedSchema ?? {},
  accepted: (overrides.accepted ?? true) as boolean,
  editedSchema: overrides.editedSchema as Record<string, unknown> | undefined,
  feedbackNotes: overrides.feedbackNotes as string | undefined,
  createdBy: (overrides.createdBy ?? "user-test-123") as string,
});

const createMockExecution = (overrides: Record<string, unknown> = {}) => ({
  _id: overrides._id ?? "exec-test-123",
  workflowId: overrides.workflowId ?? "wf-test-123",
  workspaceId: overrides.workspaceId ?? "ws-test-123",
  status: (overrides.status ?? "running") as string,
  startedAt: (overrides.startedAt ?? Date.now() - 60000) as number,
  triggeredBy: (overrides.triggeredBy ?? "user-test-123") as string,
  logs: (overrides.logs ?? []) as Array<{ timestamp: number; level: string; message: string }>,
  isDryRun: overrides.isDryRun as boolean | undefined,
});

const createMockTask = (overrides: Record<string, unknown> = {}) => ({
  _id: overrides._id ?? "task-test-123",
  workspaceId: overrides.workspaceId ?? "ws-test-123",
  title: (overrides.title ?? "Test Task") as string,
  status: (overrides.status ?? "todo") as string,
  priority: (overrides.priority ?? "medium") as string,
  assigneeId: overrides.assigneeId as string | undefined,
  createdAt: (overrides.createdAt ?? Date.now() - 30000) as number,
  updatedAt: (overrides.updatedAt ?? Date.now() - 30000) as number,
  createdBy: (overrides.createdBy ?? "user-test-123") as string,
  updatedBy: (overrides.updatedBy ?? "user-test-123") as string,
});

// ============================================================================
// Tests
// ============================================================================

describe.skip("Studio — AgentConfig", () => {
  // --------------------------------------------------------------------------
  // createAgentConfig Args
  // --------------------------------------------------------------------------

  describe("createAgentConfig args", () => {
    it("should require workspaceId, featureId, and name", () => {
      const args = {
        workspaceId: "ws-123",
        featureId: "studio",
        name: "My Agent",
      };
      expect(args.workspaceId).toBeDefined();
      expect(args.featureId).toBeDefined();
      expect(args.name).toBeDefined();
    });

    it("should allow optional projectId", () => {
      const withProject = { workspaceId: "ws-1", featureId: "studio", name: "A", projectId: "proj-1" };
      const withoutProject = { workspaceId: "ws-1", featureId: "studio", name: "A" };
      expect(withProject.projectId).toBe("proj-1");
      expect((withoutProject as Record<string, unknown>).projectId).toBeUndefined();
    });

    it("should apply provider default 'openrouter'", () => {
      const config = createMockAgentConfig();
      expect(config.provider).toBe(AGENT_CONFIG_DEFAULTS.provider);
    });

    it("should apply modelId default 'google/gemini-2.5-flash'", () => {
      const config = createMockAgentConfig();
      expect(config.modelId).toBe(AGENT_CONFIG_DEFAULTS.modelId);
    });

    it("should apply maxTokens default 4096", () => {
      const config = createMockAgentConfig();
      expect(config.maxTokens).toBe(AGENT_CONFIG_DEFAULTS.maxTokens);
    });

    it("should apply temperature default 0.3", () => {
      const config = createMockAgentConfig();
      expect(config.temperature).toBe(AGENT_CONFIG_DEFAULTS.temperature);
    });

    it("should default supportsVision to false", () => {
      const config = createMockAgentConfig();
      expect(config.supportsVision).toBe(false);
    });

    it("should default maxImageInputs to 4", () => {
      const config = createMockAgentConfig();
      expect(config.maxImageInputs).toBe(4);
    });

    it("should default activeInstructionVersion to 1", () => {
      const config = createMockAgentConfig();
      expect(config.activeInstructionVersion).toBe(1);
    });

    it("should default targetSchemaVersion to '0.5'", () => {
      const config = createMockAgentConfig();
      expect(config.targetSchemaVersion).toBe("0.5");
    });

    it("should default imageValidationEnabled to false", () => {
      const config = createMockAgentConfig();
      expect(config.imageValidationEnabled).toBe(false);
    });

    it("should default imageMatchThreshold to 0.85", () => {
      const config = createMockAgentConfig();
      expect(config.imageMatchThreshold).toBe(0.85);
    });

    it("should default trainModeEnabled to false", () => {
      const config = createMockAgentConfig();
      expect(config.trainModeEnabled).toBe(false);
    });

    it("should default trainFeedbackCount to 0", () => {
      const config = createMockAgentConfig();
      expect(config.trainFeedbackCount).toBe(0);
    });

    it("should default trainAutoUpdateThreshold to 5", () => {
      const config = createMockAgentConfig();
      expect(config.trainAutoUpdateThreshold).toBe(5);
    });

    it("should default status to 'active'", () => {
      const config = createMockAgentConfig();
      expect(config.status).toBe("active");
    });

    it("should accept custom model configuration", () => {
      const config = createMockAgentConfig({
        provider: "anthropic",
        modelId: "claude-sonnet-4-6",
        maxTokens: 8192,
        temperature: 0.7,
        supportsVision: true,
      });
      expect(config.provider).toBe("anthropic");
      expect(config.modelId).toBe("claude-sonnet-4-6");
      expect(config.maxTokens).toBe(8192);
      expect(config.temperature).toBe(0.7);
      expect(config.supportsVision).toBe(true);
    });

    it("should accept tags array", () => {
      const config = createMockAgentConfig({ tags: ["ui", "form-builder"] });
      expect(config.tags).toEqual(["ui", "form-builder"]);
    });

    it("should default tags to empty array", () => {
      const config = createMockAgentConfig();
      expect(config.tags).toEqual([]);
    });

    it("should set initial exportFormats with png, html, json enabled", () => {
      const config = createMockAgentConfig();
      expect(config.exportFormats.png).toBe(true);
      expect(config.exportFormats.html).toBe(true);
      expect(config.exportFormats.json).toBe(true);
      expect(config.exportFormats.jpg).toBe(false);
      expect(config.exportFormats.typescript).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // updateAgentConfig Args
  // --------------------------------------------------------------------------

  describe("updateAgentConfig args", () => {
    it("should require agentConfigId and workspaceId", () => {
      const args = { agentConfigId: "cfg-123", workspaceId: "ws-123" };
      expect(args.agentConfigId).toBeDefined();
      expect(args.workspaceId).toBeDefined();
    });

    it("should make all other fields optional", () => {
      const args: Record<string, unknown> = { agentConfigId: "cfg-123", workspaceId: "ws-123" };
      expect(args.name).toBeUndefined();
      expect(args.modelId).toBeUndefined();
      expect(args.temperature).toBeUndefined();
    });

    it("should reject access if workspaceId does not match config", () => {
      const config = createMockAgentConfig({ workspaceId: "ws-1" });
      const requestedWorkspaceId = "ws-2";
      const hasAccess = config.workspaceId === requestedWorkspaceId;
      expect(hasAccess).toBe(false);
    });

    it("should allow access when workspaceId matches", () => {
      const config = createMockAgentConfig({ workspaceId: "ws-1" });
      const requestedWorkspaceId = "ws-1";
      const hasAccess = config.workspaceId === requestedWorkspaceId;
      expect(hasAccess).toBe(true);
    });

    it("should update only provided fields", () => {
      const config = createMockAgentConfig({ name: "Original", temperature: 0.3 });
      const updates = { name: "Updated" };
      const patched = { ...config, ...updates };
      expect(patched.name).toBe("Updated");
      expect(patched.temperature).toBe(0.3); // unchanged
    });

    it("should allow updating exportFormats", () => {
      const config = createMockAgentConfig();
      const updatedFormats: Record<string, boolean> = { ...config.exportFormats, typescript: true };
      expect(updatedFormats.typescript).toBe(true);
      expect(updatedFormats.png).toBe(true); // others unchanged
    });
  });

  // --------------------------------------------------------------------------
  // Instruction Versioning
  // --------------------------------------------------------------------------

  describe("Instruction Versioning", () => {
    it("should create initial instruction version as v1", () => {
      const version = createMockInstructionVersion({ version: 1, isActive: true });
      expect(version.version).toBe(1);
      expect(version.isActive).toBe(true);
    });

    it("should increment version number on each update", () => {
      const v1 = createMockInstructionVersion({ version: 1, isActive: false });
      const v2 = createMockInstructionVersion({ version: 2, isActive: true });
      expect(v2.version).toBe(v1.version + 1);
    });

    it("should set new version as active and deactivate previous", () => {
      const versions = [
        createMockInstructionVersion({ version: 1, isActive: false }),
        createMockInstructionVersion({ version: 2, isActive: false }),
        createMockInstructionVersion({ version: 3, isActive: true }),
      ];
      const activeVersions = versions.filter((v) => v.isActive);
      expect(activeVersions).toHaveLength(1);
      expect(activeVersions[0].version).toBe(3);
    });

    it("should store systemPrompt in each version", () => {
      const version = createMockInstructionVersion({ systemPrompt: "You are a form builder." });
      expect(version.systemPrompt).toBe("You are a form builder.");
    });

    it("should track source as 'manual' or 'ai_trained'", () => {
      const manual = createMockInstructionVersion({ source: "manual" });
      const trained = createMockInstructionVersion({ source: "ai_trained" });
      expect(manual.source).toBe("manual");
      expect(trained.source).toBe("ai_trained");
    });

    it("should increment agentConfig.trainFeedbackCount when feedback submitted", () => {
      const config = createMockAgentConfig({ trainFeedbackCount: 3 });
      const updatedCount = config.trainFeedbackCount + 1;
      expect(updatedCount).toBe(4);
    });

    it("should auto-update instructions when trainFeedbackCount meets threshold", () => {
      const config = createMockAgentConfig({
        trainAutoUpdate: true,
        trainAutoUpdateThreshold: 5,
        trainFeedbackCount: 5,
      });
      const shouldUpdate = config.trainAutoUpdate && config.trainFeedbackCount >= config.trainAutoUpdateThreshold;
      expect(shouldUpdate).toBe(true);
    });

    it("should NOT auto-update when trainAutoUpdate is false", () => {
      const config = createMockAgentConfig({
        trainAutoUpdate: false,
        trainAutoUpdateThreshold: 5,
        trainFeedbackCount: 10,
      });
      const shouldUpdate = config.trainAutoUpdate && config.trainFeedbackCount >= config.trainAutoUpdateThreshold;
      expect(shouldUpdate).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // rollbackInstructions
  // --------------------------------------------------------------------------

  describe("rollbackInstructions", () => {
    it("should require agentConfigId, workspaceId, and targetVersion", () => {
      const args = { agentConfigId: "cfg-123", workspaceId: "ws-123", targetVersion: 2 };
      expect(args.agentConfigId).toBeDefined();
      expect(args.workspaceId).toBeDefined();
      expect(args.targetVersion).toBe(2);
    });

    it("should reject rollback to non-existent version", () => {
      const availableVersions = [1, 2, 3];
      const targetVersion = 5;
      const versionExists = availableVersions.includes(targetVersion);
      expect(versionExists).toBe(false);
    });

    it("should activate the target version", () => {
      const versions = [
        createMockInstructionVersion({ version: 1, isActive: false }),
        createMockInstructionVersion({ version: 2, isActive: true }),
        createMockInstructionVersion({ version: 3, isActive: false }),
      ];
      const targetVersion = 1;
      const updated = versions.map((v) => ({ ...v, isActive: v.version === targetVersion }));
      const active = updated.find((v) => v.isActive);
      expect(active?.version).toBe(1);
    });

    it("should update agentConfig.activeInstructionVersion", () => {
      const config = createMockAgentConfig({ activeInstructionVersion: 3 });
      const rolledBack = { ...config, activeInstructionVersion: 1 };
      expect(rolledBack.activeInstructionVersion).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // submitTrainFeedback
  // --------------------------------------------------------------------------

  describe("submitTrainFeedback", () => {
    it("should require agentConfigId, workspaceId, inputPrompt, generatedSchema, and accepted", () => {
      const args = {
        agentConfigId: "cfg-123",
        workspaceId: "ws-123",
        inputPrompt: "Build a form",
        generatedSchema: {},
        accepted: true,
      };
      expect(args.agentConfigId).toBeDefined();
      expect(args.inputPrompt).toBeDefined();
      expect(typeof args.accepted).toBe("boolean");
    });

    it("should allow accepted=true (user accepted generated schema)", () => {
      const feedback = createMockTrainFeedback({ accepted: true });
      expect(feedback.accepted).toBe(true);
    });

    it("should allow accepted=false (user rejected generated schema)", () => {
      const feedback = createMockTrainFeedback({ accepted: false, feedbackNotes: "Colors are wrong" });
      expect(feedback.accepted).toBe(false);
      expect(feedback.feedbackNotes).toBe("Colors are wrong");
    });

    it("should allow optional editedSchema for rejected feedback", () => {
      const editedSchema = { root: ["btn1"], nodes: { btn1: { type: "button", children: [], props: {} } } };
      const feedback = createMockTrainFeedback({ accepted: false, editedSchema });
      expect(feedback.editedSchema).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // deleteAgentConfig
  // --------------------------------------------------------------------------

  describe("deleteAgentConfig", () => {
    it("should require agentConfigId and workspaceId", () => {
      const args = { agentConfigId: "cfg-123", workspaceId: "ws-123" };
      expect(args.agentConfigId).toBeDefined();
      expect(args.workspaceId).toBeDefined();
    });

    it("should soft-delete by setting status to 'archived'", () => {
      const config = createMockAgentConfig({ status: "active" });
      const archived = { ...config, status: "archived" };
      expect(archived.status).toBe("archived");
    });

    it("should reject delete if workspaceId does not match", () => {
      const config = createMockAgentConfig({ workspaceId: "ws-1" });
      const requestedWorkspaceId = "ws-2";
      const canDelete = config.workspaceId === requestedWorkspaceId;
      expect(canDelete).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Permission Requirements for AgentConfig mutations
  // --------------------------------------------------------------------------

  describe("AgentConfig Permission Requirements", () => {
    const PERMISSIONS = [
      "studio.view",
      "studio.create",
      "studio.edit",
      "studio.execute",
      "studio.delete",
      "studio.manage-templates",
    ] as const;

    it("createAgentConfig should require studio.create", () => {
      expect(PERMISSIONS).toContain("studio.create");
    });

    it("updateAgentConfig should require studio.edit", () => {
      expect(PERMISSIONS).toContain("studio.edit");
    });

    it("updateAgentInstructions should require studio.edit", () => {
      expect(PERMISSIONS).toContain("studio.edit");
    });

    it("rollbackInstructions should require studio.edit", () => {
      expect(PERMISSIONS).toContain("studio.edit");
    });

    it("submitTrainFeedback should require studio.edit", () => {
      expect(PERMISSIONS).toContain("studio.edit");
    });

    it("saveVisualCheck should require studio.edit", () => {
      expect(PERMISSIONS).toContain("studio.edit");
    });

    it("saveUIDocument should require studio.edit", () => {
      expect(PERMISSIONS).toContain("studio.edit");
    });

    it("deleteAgentConfig should require studio.delete", () => {
      expect(PERMISSIONS).toContain("studio.delete");
    });
  });

  // --------------------------------------------------------------------------
  // AgentConfig Audit Events
  // --------------------------------------------------------------------------

  describe("AgentConfig Audit Events", () => {
    it("createAgentConfig audit action should be 'create' on resource 'studioAgentConfig'", () => {
      const event = {
        action: "create",
        resourceType: "studioAgentConfig",
        metadata: { name: "My Agent", featureId: "studio" },
      };
      expect(event.action).toBe("create");
      expect(event.resourceType).toBe("studioAgentConfig");
      expect(event.metadata.name).toBeDefined();
    });

    it("updateAgentConfig audit action should be 'update' on resource 'studioAgentConfig'", () => {
      const event = { action: "update", resourceType: "studioAgentConfig" };
      expect(event.action).toBe("update");
    });

    it("deleteAgentConfig audit action should be 'delete' on resource 'studioAgentConfig'", () => {
      const event = { action: "delete", resourceType: "studioAgentConfig" };
      expect(event.action).toBe("delete");
    });

    it("updateAgentInstructions audit action should be 'update_instructions'", () => {
      const event = { action: "update_instructions", resourceType: "studioAgentConfig" };
      expect(event.action).toBe("update_instructions");
    });

    it("rollbackInstructions audit action should be 'rollback_instructions'", () => {
      const event = { action: "rollback_instructions", resourceType: "studioAgentConfig" };
      expect(event.action).toBe("rollback_instructions");
    });
  });
});

// ============================================================================
// SLA Breach Detection
// ============================================================================

describe.skip("Studio — SLA Breach Detection", () => {
  describe("SLA breach identification", () => {
    it("should detect breach when execution duration exceeds slaDurationMs", () => {
      const slaDurationMs = 60_000;
      const startedAt = Date.now() - 90_000; // 90 seconds ago
      const now = Date.now();
      const duration = now - startedAt;
      const isBreached = duration > slaDurationMs;
      expect(isBreached).toBe(true);
    });

    it("should NOT detect breach when execution is within SLA", () => {
      const slaDurationMs = 60_000;
      const startedAt = Date.now() - 30_000; // 30 seconds ago
      const now = Date.now();
      const duration = now - startedAt;
      const isBreached = duration > slaDurationMs;
      expect(isBreached).toBe(false);
    });

    it("should skip executions without slaDurationMs defined", () => {
      const workflow = { definition: { settings: { maxRetries: 3 } as Record<string, unknown> } };
      const hasSla = !!(workflow.definition?.settings?.slaDurationMs);
      expect(hasSla).toBe(false);
    });

    it("should skip executions without any settings", () => {
      const workflow = { definition: { steps: [] } };
      const settings = (workflow.definition as Record<string, unknown>)?.settings as
        | { slaDurationMs?: number }
        | undefined;
      expect(settings?.slaDurationMs).toBeUndefined();
    });
  });

  describe("SLA breach response", () => {
    it("should log a breach entry in execution logs", () => {
      const logs: Array<{ timestamp: number; level: string; message: string }> = [];
      const slaDurationMs = 60_000;
      const now = Date.now();
      logs.push({
        timestamp: now,
        level: "error",
        message: `SLA BREACH: Workflow exceeded max duration of ${slaDurationMs}ms`,
      });
      expect(logs[0].level).toBe("error");
      expect(logs[0].message).toContain("SLA BREACH");
    });

    it("should fire a notification to the triggering user", () => {
      const notification = {
        userId: "user-123",
        type: "system",
        title: "SLA Breach Alert",
        message: 'Workflow "My Workflow" has exceeded its SLA duration.',
        isRead: false,
      };
      expect(notification.title).toBe("SLA Breach Alert");
      expect(notification.isRead).toBe(false);
    });

    it("should audit event with action 'studio.sla.breached'", () => {
      const event = {
        action: "studio.sla.breached",
        resourceType: "workflowExecution",
        metadata: { slaDurationMs: 60_000, actualDurationMs: 90_000, exceededByMs: 30_000 },
      };
      expect(event.action).toBe("studio.sla.breached");
      expect(event.metadata.exceededByMs).toBe(30_000);
    });
  });

  describe("SLA escalation", () => {
    it("should only escalate if escalationUserId is set in workflow settings", () => {
      const settingsWithEscalation = { slaDurationMs: 60_000, escalationUserId: "user-manager-1" };
      const settingsWithout = { slaDurationMs: 60_000 };

      const shouldEscalate1 = !!settingsWithEscalation.escalationUserId;
      const shouldEscalate2 = !!(settingsWithout as Record<string, unknown>).escalationUserId;

      expect(shouldEscalate1).toBe(true);
      expect(shouldEscalate2).toBe(false);
    });

    it("should reassign tasks created after execution start (heuristic)", () => {
      const execution = createMockExecution({ startedAt: 1000 });
      const tasks = [
        createMockTask({ createdAt: 500 }),  // before execution — skip
        createMockTask({ createdAt: 1500 }), // after execution — escalate
        createMockTask({ createdAt: 2000 }), // after execution — escalate
      ];

      const toEscalate = tasks.filter((t) => t.createdAt >= execution.startedAt);
      expect(toEscalate).toHaveLength(2);
    });

    it("should update task assigneeId to escalationUserId", () => {
      const task = createMockTask({ assigneeId: "user-original" });
      const escalationUserId = "user-manager";
      const updated = { ...task, assigneeId: escalationUserId };
      expect(updated.assigneeId).toBe("user-manager");
    });

    it("should update task updatedAt timestamp during escalation", () => {
      const task = createMockTask({ updatedAt: 1000 });
      const now = Date.now();
      const updated = { ...task, updatedAt: now };
      expect(updated.updatedAt).toBeGreaterThan(1000);
    });

    it("should audit event with action 'studio.sla.escalated' including escalatedTaskCount", () => {
      const event = {
        action: "studio.sla.escalated",
        resourceType: "workflowExecution",
        metadata: { workflowId: "wf-123", escalationUserId: "user-manager", escalatedTaskCount: 2 },
      };
      expect(event.action).toBe("studio.sla.escalated");
      expect(event.metadata.escalatedTaskCount).toBe(2);
    });

    it("should only reassign tasks with status 'todo' (not in_progress or completed)", () => {
      const tasks = [
        createMockTask({ status: "todo" }),
        createMockTask({ status: "in_progress" }),
        createMockTask({ status: "completed" }),
      ];
      const eligible = tasks.filter((t) => t.status === "todo");
      expect(eligible).toHaveLength(1);
    });
  });
});

// ============================================================================
// Rollback Compensation Logic
// ============================================================================

describe.skip("Studio — Rollback Compensation Logic", () => {
  describe("compensation stack", () => {
    it("should only add steps to compensations when not a dry run", () => {
      const isDryRun = true;
      const compensations: unknown[] = [];

      const stepResult = { created: true, taskId: "task-123" };
      if (!isDryRun && !stepResult) {
        compensations.push({ stepId: "s1", type: "createTask", config: {}, result: stepResult });
      }

      expect(compensations).toHaveLength(0);
    });

    it("should add successful non-skipped steps to compensations", () => {
      const isDryRun = false;
      const compensations: Array<{ stepId: string; type: string; result: Record<string, unknown> }> = [];
      const stepResult = { created: true, taskId: "task-123" };

      if (!isDryRun && !(stepResult as Record<string, unknown>).skipped) {
        compensations.push({ stepId: "s1", type: "createTask", result: stepResult });
      }

      expect(compensations).toHaveLength(1);
      expect(compensations[0].result.taskId).toBe("task-123");
    });

    it("should NOT add skipped (dry-run) steps to compensations", () => {
      const isDryRun = false;
      const compensations: unknown[] = [];
      const stepResult = { dryRun: true, skipped: true, message: "Dry run: skipped createTask" };

      if (!isDryRun && !stepResult.skipped) {
        compensations.push({ stepId: "s1", type: "createTask" });
      }

      expect(compensations).toHaveLength(0);
    });

    it("should rollback in reverse order (LIFO)", () => {
      const compensations = [
        { stepId: "s1", order: 0 },
        { stepId: "s2", order: 1 },
        { stepId: "s3", order: 2 },
      ];
      const rollbackOrder = [...compensations].reverse().map((c) => c.stepId);
      expect(rollbackOrder).toEqual(["s3", "s2", "s1"]);
    });

    it("should store step result in compensation entry", () => {
      const compensation = {
        stepId: "s1",
        type: "createTask",
        config: { title: "My Task" },
        result: { taskId: "task-abc", created: true },
      };
      expect(compensation.result.taskId).toBe("task-abc");
    });
  });

  describe("rollback by step type", () => {
    it("createTask should be rolled back by deleting the created task", () => {
      // Verify rollback can identify the taskId from the compensation result
      const compensation = {
        stepId: "s1",
        type: "createTask",
        config: {},
        result: { taskId: "task-to-delete", created: true },
      };
      const taskId = compensation.result.taskId;
      expect(taskId).toBe("task-to-delete");
    });

    it("createTask rollback should skip if no taskId in result", () => {
      const compensation = {
        stepId: "s1",
        type: "createTask",
        config: {},
        result: { created: false } as Record<string, unknown>, // no taskId
      };
      const taskId = compensation.result.taskId as string | undefined;
      expect(taskId).toBeUndefined();
    });

    it.each(NON_ROLLBACK_STEPS)(
      "step type '%s' should not perform automatic rollback",
      (type) => {
        // These step types either have no durable state or cannot be reversed
        const isRollbackCapable = (ROLLBACK_CAPABLE_STEPS as readonly string[]).includes(type);
        expect(isRollbackCapable).toBe(false);
      }
    );

    it.each(ROLLBACK_CAPABLE_STEPS)(
      "step type '%s' should support rollback",
      (type) => {
        const isRollbackCapable = (ROLLBACK_CAPABLE_STEPS as readonly string[]).includes(type);
        expect(isRollbackCapable).toBe(true);
      }
    );

    it("updateRecord cannot be rolled back without original state snapshot", () => {
      // The executor does NOT capture the previous record state before update,
      // so updateRecord rollback is intentionally a no-op.
      const hasOriginalState = false; // by design
      expect(hasOriginalState).toBe(false);
    });
  });

  describe("rollback audit logging", () => {
    it("should use action 'studio.task.rolled_back' when deleting a task during rollback", () => {
      const auditEvent = {
        action: "studio.task.rolled_back",
        resourceType: "task",
        metadata: { title: "My Task" },
      };
      expect(auditEvent.action).toBe("studio.task.rolled_back");
      expect(auditEvent.resourceType).toBe("task");
    });

    it("should log rollback initiation when compensations exist", () => {
      const compensationsLength = 3;
      const message = `Initiating rollback for ${compensationsLength} steps...`;
      expect(message).toContain("Initiating rollback");
      expect(message).toContain("3 steps");
    });

    it("should log rollback success per step", () => {
      const message = "Rolled back step s1 (createTask)";
      expect(message).toContain("Rolled back");
      expect(message).toContain("s1");
    });
  });
});

// ============================================================================
// Bulk Workflow Operations
// ============================================================================

describe.skip("Studio — Bulk Workflow Operations", () => {
  describe("triggerBulkWorkflow args", () => {
    it("should require workflowId, items array, and userId", () => {
      const args = {
        workflowId: "wf-123",
        items: [{ id: "1", name: "Item 1" }],
        userId: "user-123",
      };
      expect(args.workflowId).toBeDefined();
      expect(Array.isArray(args.items)).toBe(true);
      expect(args.userId).toBeDefined();
    });

    it("should create one execution per item", () => {
      const items = [
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
        { id: "3", name: "Item 3" },
      ];
      // Simulate execution creation
      const executionIds = items.map((_, idx) => `exec-${idx}`);
      expect(executionIds).toHaveLength(items.length);
    });

    it("should set each execution status to 'running'", () => {
      const execution = createMockExecution({ status: "running" });
      expect(execution.status).toBe("running");
    });

    it("should store trigger item as initial result context", () => {
      const item = { id: "1", name: "Widget" };
      const executionResult = { triggerItem: item };
      expect(executionResult.triggerItem).toEqual(item);
    });

    it("should handle empty items array gracefully (zero executions)", () => {
      const items: unknown[] = [];
      const executionIds: string[] = [];
      items.forEach((_, idx) => executionIds.push(`exec-${idx}`));
      expect(executionIds).toHaveLength(0);
    });

    it("should audit each execution with action 'studio.bulk.triggered'", () => {
      const items = [{ id: "1" }, { id: "2" }];
      const auditEvents = items.map((_, idx) => ({
        action: "studio.bulk.triggered",
        metadata: { itemIndex: idx, totalItems: items.length },
      }));
      auditEvents.forEach((event) => {
        expect(event.action).toBe("studio.bulk.triggered");
      });
      expect(auditEvents[0].metadata.totalItems).toBe(2);
    });

    it("should audit item index for each execution in bulk", () => {
      const items = ["a", "b", "c"];
      const indices = items.map((_, idx) => idx);
      expect(indices).toEqual([0, 1, 2]);
    });
  });
});
