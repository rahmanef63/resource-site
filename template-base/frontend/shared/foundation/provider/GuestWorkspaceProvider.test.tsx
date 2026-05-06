/**
 * @vitest-environment jsdom
 */

import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  GuestWorkspaceProvider,
  useGuestWorkspaceContext,
} from "./GuestWorkspaceProvider"

const mockSetActiveTheme = vi.fn()

vi.mock("@/frontend/shared/theme", () => ({
  DEFAULT_ACTIVE_THEME: "modern-minimal",
  useThemeConfig: () => ({
    activeTheme: "modern-minimal",
    setActiveTheme: mockSetActiveTheme,
  }),
}))

function GuestWorkspaceProbe() {
  const {
    workspaceId,
    currentWorkspace,
    currentThemePreset,
    setWorkspaceId,
    setCurrentWorkspaceThemePreset,
  } = useGuestWorkspaceContext()

  return (
    <div>
      <div data-testid="workspace-id">{workspaceId}</div>
      <div data-testid="workspace-name">{currentWorkspace?.name ?? "none"}</div>
      <div data-testid="theme-preset">{currentThemePreset}</div>
      <button type="button" onClick={() => setCurrentWorkspaceThemePreset("bold-tech")}>
        Set current override
      </button>
      <button type="button" onClick={() => setWorkspaceId("ws-corp-warehouse")}>
        Switch warehouse
      </button>
      <button type="button" onClick={() => setCurrentWorkspaceThemePreset("cyberpunk")}>
        Set warehouse override
      </button>
      <button type="button" onClick={() => setWorkspaceId("ws-corporate")}>
        Switch corporate
      </button>
    </div>
  )
}

describe("GuestWorkspaceProvider theme presets", () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockSetActiveTheme.mockReset()
  })

  it("applies workspace defaults and preserves guest overrides per workspace", async () => {
    const { unmount } = render(
      <GuestWorkspaceProvider>
        <GuestWorkspaceProbe />
      </GuestWorkspaceProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("workspace-id")).toHaveTextContent("ws-corporate")
      expect(screen.getByTestId("theme-preset")).toHaveTextContent("graphite")
    })

    expect(mockSetActiveTheme).toHaveBeenCalledWith("graphite")

    fireEvent.click(screen.getByText("Set current override"))

    await waitFor(() => {
      expect(screen.getByTestId("theme-preset")).toHaveTextContent("bold-tech")
    })

    fireEvent.click(screen.getByText("Switch warehouse"))

    await waitFor(() => {
      expect(screen.getByTestId("workspace-id")).toHaveTextContent("ws-corp-warehouse")
      expect(screen.getByTestId("theme-preset")).toHaveTextContent("caffeine")
    })

    fireEvent.click(screen.getByText("Set warehouse override"))

    await waitFor(() => {
      expect(screen.getByTestId("theme-preset")).toHaveTextContent("cyberpunk")
    })

    fireEvent.click(screen.getByText("Switch corporate"))

    await waitFor(() => {
      expect(screen.getByTestId("workspace-id")).toHaveTextContent("ws-corporate")
      expect(screen.getByTestId("theme-preset")).toHaveTextContent("bold-tech")
    })

    unmount()

    render(
      <GuestWorkspaceProvider>
        <GuestWorkspaceProbe />
      </GuestWorkspaceProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("workspace-id")).toHaveTextContent("ws-corporate")
      expect(screen.getByTestId("theme-preset")).toHaveTextContent("bold-tech")
    })
  })
})
