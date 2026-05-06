import { describe, expect, it } from "vitest";

import {
  getAllWorkspacesFlat,
  getEnabledFeaturesForWorkspace,
  getMenuForWorkspace,
  getWorkspaceById,
} from "./index";

describe("mock workspace data", () => {
  it("resolves exact child workspaces instead of falling back to the parent template", () => {
    const workspace = getWorkspaceById("ws-corp-finance");

    expect(workspace?.name).toBe("Finance Dept");
    expect(workspace?.parentId).toBe("ws-corporate");
    expect(workspace?.menuItems.map((item) => item.slug)).toEqual([
      "overview",
      "accounting",
      "approvals",
      "reports",
      "analytics",
      "documents",
      "tasks",
    ]);
  });

  it("returns workspace-specific menus for sibling departments", () => {
    const hrMenu = getMenuForWorkspace("ws-corp-hr").map((item) => item.slug);
    const financeMenu = getMenuForWorkspace("ws-corp-finance").map((item) => item.slug);

    expect(hrMenu[0]).toBe("overview");
    expect(financeMenu[0]).toBe("overview");
    expect(hrMenu).toContain("user-management");
    expect(financeMenu).toContain("accounting");
    expect(hrMenu).not.toEqual(financeMenu);
  });

  it("keeps enabled features aligned with each workspace menu", () => {
    const enabledFeatures = getEnabledFeaturesForWorkspace("ws-creative-production");

    expect(enabledFeatures).toEqual([
      "overview",
      "projects",
      "content",
      "calendar",
      "documents",
      "communications",
      "approvals",
    ]);
  });

  it("includes parent and child workspaces in the flattened registry", () => {
    const workspaceIds = getAllWorkspacesFlat().map((workspace) => workspace.id);

    expect(workspaceIds).toContain("ws-retail");
    expect(workspaceIds).toContain("ws-retail-warehouse");
    expect(workspaceIds).toContain("ws-acad-research");
  });

  it("keeps theme presets scoped to the exact selected workspace", () => {
    const rootWorkspace = getWorkspaceById("ws-corporate");
    const childWorkspace = getWorkspaceById("ws-corp-warehouse");

    expect(rootWorkspace?.themePreset).toBe("graphite");
    expect(childWorkspace?.themePreset).toBe("caffeine");
    expect(childWorkspace?.themePreset).not.toBe(rootWorkspace?.themePreset);
  });
});
