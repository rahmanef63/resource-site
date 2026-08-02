/**
 * @vitest-environment jsdom
 */

import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AiOnboardingFlow } from "./AiOnboardingFlow"

vi.mock("@/frontend/shared/ai/settings/useAISettings", () => ({
  getProviderModels: () => [{ id: "mock-model" }],
  useAISettingsStorage: () => ({
    settings: {
      defaultProvider: "openrouter",
      defaultModel: "mock-model",
      apiKeys: [],
    },
  }),
}))

vi.mock("@/frontend/shared/foundation/workspaces/hooks/useBundles", () => ({
  getMergedBundleEnabledFeatures: () => ["overview", "tasks"],
  usePublicBundles: () => ({
    bundles: [
      {
        id: "custom",
        name: "Custom",
        category: "general",
        recommendedFor: ["general"],
        theme: { primaryColor: "#2563eb" },
      },
    ],
  }),
}))

vi.mock("@/frontend/shared/foundation/workspaces/constants", () => ({
  CORE_FEATURES: ["overview"],
}))

vi.mock("@/frontend/shared/lib/features/registry", () => ({
  getAllFeatures: () => [
    { id: "overview", name: "Overview", description: "Overview" },
    { id: "tasks", name: "Tasks", description: "Tasks" },
    { id: "projects", name: "Projects", description: "Projects" },
    { id: "calendar", name: "Calendar", description: "Calendar" },
  ],
}))

vi.mock("@/frontend/shared/communications/components/grok-chat", () => ({
  GrokAIMessage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  GrokUserMessage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  GrokTypingIndicator: () => <div>Typing…</div>,
  GrokChatContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

describe("AiOnboardingFlow presets", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders presets inside a horizontal scroll area with a horizontal scrollbar", async () => {
    render(<AiOnboardingFlow />)

    act(() => {
      vi.runAllTimers()
    })

    expect(screen.getByTestId("ai-onboarding-presets-scroll")).toBeInTheDocument()
    expect(screen.getByTestId("ai-onboarding-presets-row").className).toMatch(/w-max/)
    expect(screen.getByRole("button", { name: "Operations Hub" })).toBeInTheDocument()
  })

  it("keeps preset selection working for single-select and multi-select questions", async () => {
    render(<AiOnboardingFlow />)

    act(() => {
      vi.runAllTimers()
    })

    fireEvent.click(screen.getByRole("button", { name: "Operations Hub" }))
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement
    expect(textarea.value).toBe("Operations Hub")
    fireEvent.click(screen.getByRole("button", { name: /send answer/i }))

    act(() => {
      vi.runAllTimers()
    })

    for (const preset of ["Project Alpha", "Solo", "Task & project tracking"]) {
      fireEvent.click(screen.getByRole("button", { name: preset }))
      fireEvent.click(screen.getByRole("button", { name: /send answer/i }))
      act(() => {
        vi.runAllTimers()
      })
    }

    const tasksChip = screen.getByRole("button", { name: "Tasks" })
    const projectsChip = screen.getByRole("button", { name: "Projects" })

    fireEvent.click(tasksChip)
    fireEvent.click(projectsChip)

    expect(tasksChip.className).toMatch(/bg-primary\/20/)
    expect(projectsChip.className).toMatch(/bg-primary\/20/)
  })
})
