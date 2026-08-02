import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { WorkspaceIcon } from "./WorkspaceIcon"

const useQueryMock = vi.fn()

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}))

describe("WorkspaceIcon", () => {
  beforeEach(() => {
    useQueryMock.mockReset()
    useQueryMock.mockReturnValue(null)
  })

  it("falls back to the workspace initial when there is no logo or icon", () => {
    render(<WorkspaceIcon name="Alpha Space" />)

    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("renders the configured icon name before falling back to initials", () => {
    const { container } = render(
      <WorkspaceIcon
        name="Beta Space"
        iconName="Building2"
      />,
    )

    expect(container.querySelector("svg")).toBeTruthy()
  })
})
