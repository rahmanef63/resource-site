/**
 * @vitest-environment jsdom
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { IndustryTemplateCreatePanel } from "./IndustryTemplateCreatePanel"

const useTemplatesMock = vi.fn()

vi.mock("@/frontend/slices/industry-templates/hooks/useIndustryTemplates", () => ({
  featureModules: {
    crm: { name: "CRM", description: "CRM", icon: "users" },
    inventory: { name: "Inventory", description: "Inventory", icon: "package" },
    projects: { name: "Projects", description: "Projects", icon: "folder" },
  },
  hasIndustryTemplatesQueryApi: true,
  useTemplates: (...args: unknown[]) => useTemplatesMock(...args),
}))

vi.mock("@/frontend/shared/foundation/workspaces/constants/bundles", () => ({
  getAllBundles: () => [
    {
      id: "startup",
      name: "Startup",
      description: "Bundle fallback",
      category: "business",
      features: {
        core: ["overview"],
        recommended: ["crm", "projects"],
        optional: ["inventory"],
      },
    },
  ],
  getBundleEnabledFeatures: () => ["crm", "projects"],
}))

describe("IndustryTemplateCreatePanel", () => {
  beforeEach(() => {
    useTemplatesMock.mockReset()
  })

  it("shows a loading state while templates are unresolved", () => {
    useTemplatesMock.mockReturnValue(undefined)

    render(<IndustryTemplateCreatePanel onCreate={vi.fn()} />)

    expect(screen.getByText(/loading templates/i)).toBeInTheDocument()
  })

  it("shows bundle fallback cards when no public templates are available", () => {
    useTemplatesMock.mockReturnValue([])

    render(<IndustryTemplateCreatePanel onCreate={vi.fn()} />)

    expect(screen.getByTestId("industry-template-fallback")).toBeInTheDocument()
    expect(screen.getByText("Startup")).toBeInTheDocument()
  })

  it("renders template cards when public templates are available", () => {
    useTemplatesMock.mockReturnValue([
      {
        _id: "tmpl_1",
        name: "Restaurant Pro",
        description: "Operational workspace for restaurants",
        category: "restaurant",
        features: ["crm", "inventory", "projects"],
      },
    ])

    render(<IndustryTemplateCreatePanel onCreate={vi.fn()} />)

    expect(screen.getByText("Restaurant Pro")).toBeInTheDocument()
    expect(screen.getByTestId("industry-template-card")).toBeInTheDocument()
  })
})
