import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

import { ContentFiltersBar } from "./ContentFilters"

describe("ContentFiltersBar", () => {
  it("toggles quick boolean filters", () => {
    const onUpdateFilters = vi.fn()

    render(
      <ContentFiltersBar
        filters={{
          sortBy: "createdAt",
          sortOrder: "desc",
          favoriteOnly: false,
          aiGeneratedOnly: false,
          unusedOnly: false,
          recentOnly: false,
        }}
        onUpdateFilters={onUpdateFilters}
        onClearFilters={vi.fn()}
      />,
    )

    // Filters live inside a popover — open it first
    fireEvent.click(screen.getByRole("button", { name: /^filters/i }))

    fireEvent.click(screen.getByRole("button", { name: /favorites/i }))
    fireEvent.click(screen.getByRole("button", { name: /ai only/i }))
    fireEvent.click(screen.getByRole("button", { name: /unused/i }))
    fireEvent.click(screen.getByRole("button", { name: /recent/i }))

    expect(onUpdateFilters).toHaveBeenCalledWith({ favoriteOnly: true })
    expect(onUpdateFilters).toHaveBeenCalledWith({ aiGeneratedOnly: true })
    expect(onUpdateFilters).toHaveBeenCalledWith({ unusedOnly: true })
    expect(onUpdateFilters).toHaveBeenCalledWith({ recentOnly: true })
  })
})
