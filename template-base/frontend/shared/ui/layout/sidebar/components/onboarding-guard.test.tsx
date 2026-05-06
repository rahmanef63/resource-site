/**
 * @vitest-environment jsdom
 */

import React from "react"
import { render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { OnboardingGuard } from "./onboarding-guard"

const {
  mockReplace,
  mockBackfillMemberships,
} = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockBackfillMemberships: vi.fn(),
}))

let mockPathname = "/dashboard/overview"
let mockSearchParams = new URLSearchParams()
let mockUserWorkspaces: Array<{ _id: string; name: string }> | undefined = []

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}))

vi.mock("convex/react", () => ({
  useQuery: () => mockUserWorkspaces,
  useMutation: () => mockBackfillMemberships,
}))

vi.mock("@/frontend/shared/foundation", () => ({
  useAuthed: () => ({
    isAuthed: true,
    isLoading: false,
  }),
}))

describe("OnboardingGuard", () => {
  beforeEach(() => {
    mockPathname = "/dashboard/overview"
    mockSearchParams = new URLSearchParams()
    mockUserWorkspaces = []
    mockReplace.mockReset()
    mockBackfillMemberships.mockReset()
    mockBackfillMemberships.mockResolvedValue({ found: 0 })
  })

  it("treats only the exact onboarding route as exempt", () => {
    mockPathname = "/dashboard/workspace"

    render(<OnboardingGuard />)

    expect(mockBackfillMemberships).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it("does not exempt workspace-store routes that only share the prefix", async () => {
    mockPathname = "/dashboard/workspace-store"

    render(<OnboardingGuard />)

    await waitFor(() => {
      expect(mockBackfillMemberships).toHaveBeenCalledTimes(1)
      expect(mockReplace).toHaveBeenCalledWith("/dashboard/workspace")
    })
  })

  it("redirects immediately when workspaces transition from some to none", async () => {
    mockUserWorkspaces = [{ _id: "ws_1", name: "Alpha" }]
    const view = render(<OnboardingGuard />)

    expect(mockBackfillMemberships).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()

    mockUserWorkspaces = []
    view.rerender(<OnboardingGuard />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard/workspace")
    })

    expect(mockBackfillMemberships).not.toHaveBeenCalled()
  })
})
