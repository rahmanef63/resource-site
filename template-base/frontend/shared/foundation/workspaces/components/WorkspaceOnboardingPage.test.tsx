/**
 * @vitest-environment jsdom
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import WorkspaceOnboardingPage from "@/app/dashboard/workspace/page"

const mockReplace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/dashboard/workspace",
}))

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
}))

vi.mock("@/frontend/shared/foundation/auth/hooks/useAuthed", () => ({
  useAuthed: () => ({
    isAuthed: true,
    isLoading: false,
    isAuthSignedIn: true,
  }),
}))

vi.mock("@/frontend/shared/foundation/workspaces/components/RobustOnboardingFlow", () => ({
  RobustOnboardingFlow: () => <div>Manual Onboarding Panel</div>,
}))

vi.mock("@/frontend/shared/foundation/workspaces/components/IndustryTemplateCreatePanel", () => ({
  IndustryTemplateCreatePanel: () => <div>Template Library Panel</div>,
}))

vi.mock("@/frontend/shared/foundation/workspaces/components/ai/AiOnboardingFlow", () => ({
  AiOnboardingFlow: () => <div>AI Beta Panel</div>,
}))

vi.mock("@/frontend/shared/foundation/workspaces/components/ImportWorkspacePanel", () => ({
  ImportWorkspacePanel: () => <div>Import Panel</div>,
}))

vi.mock("@/frontend/shared/foundation/workspaces/components/JoinWorkspacePanel", () => ({
  JoinWorkspacePanel: () => <div>Join Panel</div>,
}))

describe("WorkspaceOnboardingPage", () => {
  it("switches between manual, template, and ai tabs deterministically", async () => {
    const user = userEvent.setup()

    render(<WorkspaceOnboardingPage />)

    // Page uses next/dynamic for each tab's flow — findByText waits for the
    // async import to resolve instead of snapshotting the Skeleton placeholder.
    expect(await screen.findByText("Manual Onboarding Panel")).toBeVisible()
    expect(screen.queryByText("Template Library Panel")).not.toBeInTheDocument()
    expect(screen.queryByText("AI Beta Panel")).not.toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: /template/i }))
    expect(await screen.findByText("Template Library Panel")).toBeVisible()
    expect(screen.queryByText("Manual Onboarding Panel")).not.toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: /ai/i }))
    expect(await screen.findByText("AI Beta Panel")).toBeVisible()
    expect(screen.queryByText("Template Library Panel")).not.toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: /manual/i }))
    expect(await screen.findByText("Manual Onboarding Panel")).toBeVisible()
    expect(screen.queryByText("AI Beta Panel")).not.toBeInTheDocument()
  })
})
