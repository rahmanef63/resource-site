/**
 * @vitest-environment jsdom
 */

import React from "react"
import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ActiveThemeProvider, useThemeConfig } from "./active-theme"

function ThemeProbe() {
  const {
    activeTheme,
    previewTheme,
    resolvedTheme,
    setActiveTheme,
    startThemePreview,
    clearThemePreview,
  } = useThemeConfig()

  return (
    <div>
      <div data-testid="active-theme">{activeTheme}</div>
      <div data-testid="preview-theme">{previewTheme ?? "none"}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button type="button" onClick={() => startThemePreview("green")}>
        preview green
      </button>
      <button type="button" onClick={() => clearThemePreview()}>
        clear preview
      </button>
      <button type="button" onClick={() => setActiveTheme("green")}>
        save green
      </button>
    </div>
  )
}

describe("ActiveThemeProvider", () => {
  beforeEach(() => {
    document.cookie = ""
    document.body.className = ""
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))
  })

  it("keeps preview theme transient until the persisted theme changes", async () => {
    render(
      <ActiveThemeProvider initialTheme="modern-minimal">
        <ThemeProbe />
      </ActiveThemeProvider>,
    )

    expect(screen.getByTestId("active-theme")).toHaveTextContent("modern-minimal")
    expect(screen.getByTestId("preview-theme")).toHaveTextContent("none")
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("modern-minimal")
    expect(document.cookie).toContain("active_theme=modern-minimal")

    await act(async () => {
      screen.getByRole("button", { name: /preview green/i }).click()
    })

    expect(screen.getByTestId("active-theme")).toHaveTextContent("modern-minimal")
    expect(screen.getByTestId("preview-theme")).toHaveTextContent("green")
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("green")
    expect(document.body.className).toContain("theme-green")
    expect(document.cookie).toContain("active_theme=modern-minimal")

    await act(async () => {
      screen.getByRole("button", { name: /clear preview/i }).click()
    })

    expect(screen.getByTestId("preview-theme")).toHaveTextContent("none")
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("modern-minimal")

    await act(async () => {
      screen.getByRole("button", { name: /save green/i }).click()
    })

    expect(screen.getByTestId("active-theme")).toHaveTextContent("green")
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("green")
    expect(document.cookie).toContain("active_theme=green")
  })
})
