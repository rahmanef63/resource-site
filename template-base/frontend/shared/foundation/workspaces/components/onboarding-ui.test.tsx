/**
 * @vitest-environment jsdom
 */

import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { OnboardingChecklistPanel } from "./OnboardingChecklistPanel"
import { OnboardingProgress } from "./OnboardingProgress"

describe("workspace onboarding UI", () => {
  it("renders the 3-step progress labels from the supplied step metadata", () => {
    render(
      <OnboardingProgress
        currentStep={1}
        steps={[
          { id: "details", label: "Details" },
          { id: "template", label: "Template" },
          { id: "features", label: "Features" },
        ]}
      />,
    )

    expect(screen.getByText("Details")).toBeInTheDocument()
    expect(screen.getByText("Template")).toBeInTheDocument()
    expect(screen.getByText("Features")).toBeInTheDocument()
  })

  it("renders a pulse-line progress bar with width proportional to current step", () => {
    render(
      <OnboardingProgress
        variant="pulse-line"
        currentStep={1}
        steps={[
          { id: "details", label: "Details" },
          { id: "template", label: "Template" },
          { id: "features", label: "Features" },
        ]}
      />,
    )

    const progressbar = screen.getByRole("progressbar", { name: "Step 2 of 3" })
    expect(progressbar).toBeInTheDocument()
    expect(progressbar).toHaveAttribute("aria-valuenow", "2")
    expect(progressbar).toHaveAttribute("aria-valuemax", "3")

    const fill = progressbar.querySelector(".animate-pulse-glow") as HTMLElement | null
    expect(fill).not.toBeNull()
    expect(fill?.style.width).toBe(`${(2 / 3) * 100}%`)

    const activeLabel = screen.getByText("Template")
    expect(activeLabel).toHaveClass("text-primary")
  })

  it("keeps the mobile summary collapsed by default and expands on demand", () => {
    render(
      <OnboardingChecklistPanel
        mode="mobile-summary"
        currentStepId="workspace"
      />,
    )

    expect(screen.getByText("Getting started")).toBeInTheDocument()
    expect(screen.getByText("Current: Create your workspace")).toBeInTheDocument()
    expect(screen.queryByText(/create your first database/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /view steps/i }))

    expect(screen.getByText(/create your first database/i)).toBeInTheDocument()
    expect(screen.getByText(/add your first row/i)).toBeInTheDocument()
  })
})
