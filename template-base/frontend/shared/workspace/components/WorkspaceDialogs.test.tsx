/**
 * @vitest-environment jsdom
 */

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CreateWorkspaceDialog } from "./WorkspaceDialogs"

vi.mock("@/frontend/shared/foundation/hooks/useWorkspaceExportImport", () => ({
  useWorkspaceExportImport: () => ({
    isExporting: false,
    isValidating: false,
    isImporting: false,
    validationResult: null,
    importSummary: null,
    error: null,
    fileName: null,
    fileContent: null,
    fileInputRef: { current: null },
    exportWorkspace: vi.fn(),
    readFile: vi.fn(),
    validateImportJson: vi.fn(),
    importWorkspace: vi.fn(),
    reset: vi.fn(),
    getShareableUrl: vi.fn(),
  }),
}))

vi.mock("@/frontend/shared/foundation/workspaces/components/ai/AiOnboardingFlow", () => ({
  AiOnboardingFlow: ({
    onCreateWorkspace,
  }: {
    onCreateWorkspace?: (draft: {
      name: string
      description?: string
      type: string
      icon?: string
      color?: string
      bundleId?: string | null
      enabledFeatures: string[]
      isPublic: boolean
      reasoning: string[]
    }) => Promise<void> | void
  }) => (
    <button
      type="button"
      onClick={() => onCreateWorkspace?.({
        name: "AI Workspace",
        description: "Generated from AI",
        type: "organization",
        icon: "Rocket",
        color: "#2563eb",
        bundleId: "startup",
        enabledFeatures: ["overview", "tasks"],
        isPublic: false,
        reasoning: ["Fit for launch teams"],
      })}
    >
      Generate via AI
    </button>
  ),
}))

vi.mock("@/frontend/shared/foundation/workspaces/components/IndustryTemplateCreatePanel", () => ({
  IndustryTemplateCreatePanel: ({
    onCreate,
  }: {
    onCreate?: (data: {
      name: string
      type: string
      templateId: string
    }) => Promise<void> | void
  }) => (
    <button
      type="button"
      onClick={() => onCreate?.({
        name: "Template Workspace",
        type: "group",
        templateId: "tmpl_123",
      })}
    >
      Create from Template
    </button>
  ),
}))

describe("CreateWorkspaceDialog", () => {
  it("routes AI create through the shared submit callback with the parent workspace id", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <CreateWorkspaceDialog
        open
        onOpenChange={() => {}}
        onSubmit={onSubmit}
        parentWorkspace={{ id: "parent-1", name: "Parent Workspace" } as any}
      />,
    )

    await user.click(screen.getByRole("tab", { name: /ai workspace/i }))
    await user.click(screen.getByRole("button", { name: /generate via ai/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: "AI Workspace",
        parentId: "parent-1",
        bundleId: "startup",
        enabledFeatures: ["overview", "tasks"],
      }))
    })
  })

  it("routes template create through the shared submit callback with the selected template id", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <CreateWorkspaceDialog
        open
        onOpenChange={() => {}}
        onSubmit={onSubmit}
        parentWorkspace={{ id: "parent-1", name: "Parent Workspace" } as any}
      />,
    )

    await user.click(screen.getByRole("tab", { name: /template/i }))
    await user.click(screen.getByRole("button", { name: /create from template/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Template Workspace",
        type: "group",
        templateId: "tmpl_123",
        parentId: "parent-1",
      })
    })
  })
})
