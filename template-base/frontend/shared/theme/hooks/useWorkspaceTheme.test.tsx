/**
 * @vitest-environment jsdom
 */

import React from "react"
import { render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useWorkspaceTheme } from "./useWorkspaceTheme"

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    user: {
      preferences: {
        getUserPreferences: "user.preferences.getUserPreferences",
      },
    },
    workspace: {
      storage: {
        getWorkspaceEffectiveTheme: "workspace.storage.getWorkspaceEffectiveTheme",
      },
    },
  },
}))

const mockSetActiveTheme = vi.fn()
let mockActiveTheme = "cookie-theme"
let mockEffectiveTheme: any = undefined
let mockUserPreferences: any = null

vi.mock("@/convex/_generated/api", () => ({
  api: mockApi,
}))

vi.mock("convex/react", () => ({
  useQuery: (query: string) => {
    if (query === mockApi.user.preferences.getUserPreferences) {
      return mockUserPreferences
    }

    if (query === mockApi.workspace.storage.getWorkspaceEffectiveTheme) {
      return mockEffectiveTheme
    }

    return undefined
  },
}))

vi.mock("../components/layout/active-theme", () => ({
  useThemeConfig: () => ({
    activeTheme: mockActiveTheme,
    setActiveTheme: mockSetActiveTheme,
  }),
}))

function WorkspaceThemeProbe() {
  useWorkspaceTheme({
    workspaceId: "k1234567890123456789012345678901" as never,
    autoApply: true,
  })

  return null
}

describe("useWorkspaceTheme", () => {
  beforeEach(() => {
    mockActiveTheme = "cookie-theme"
    mockEffectiveTheme = undefined
    mockUserPreferences = null
    mockSetActiveTheme.mockReset()
  })

  it("bootstraps the active theme from the authenticated user preference", async () => {
    mockUserPreferences = {
      themePreset: "bubblegum",
    }

    render(<WorkspaceThemeProbe />)

    await waitFor(() => {
      expect(mockSetActiveTheme).toHaveBeenCalledWith("bubblegum")
    })
  })

  it("prefers the effective workspace theme over the user default", async () => {
    mockUserPreferences = {
      themePreset: "bubblegum",
    }
    mockEffectiveTheme = {
      inheritedFrom: null,
      source: "workspace",
      themePreset: "graphite",
    }

    render(<WorkspaceThemeProbe />)

    await waitFor(() => {
      expect(mockSetActiveTheme).toHaveBeenCalledWith("graphite")
    })
  })
})
