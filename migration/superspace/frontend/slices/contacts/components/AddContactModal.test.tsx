import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AddContactModal } from "./AddContactModal"

const sendContactRequestMock = vi.fn()
const useWorkspaceMembersMock = vi.fn()

vi.mock("convex/react", () => ({
  useMutation: () => sendContactRequestMock,
}))

vi.mock("@/frontend/shared/foundation/workspaces/api", () => ({
  useWorkspaceMembers: (...args: unknown[]) => useWorkspaceMembersMock(...args),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe("AddContactModal", () => {
  beforeEach(() => {
    sendContactRequestMock.mockReset()
    useWorkspaceMembersMock.mockReset()
  })

  it("renders enriched workspace member details from the shared summary contract", () => {
    useWorkspaceMembersMock.mockReturnValue([
      {
        membershipId: "membership-1",
        userId: "user-1",
        name: "Jane Workspace",
        email: "jane@example.com",
        image: "https://example.com/jane.png",
        status: "active",
        role: {
          name: "Admin",
          color: "#22c55e",
          level: 10,
        },
      },
    ])

    render(
      <AddContactModal
        workspaceId={"workspace-1" as any}
        onClose={() => {}}
      />,
    )

    expect(screen.getByText("Jane Workspace")).toBeInTheDocument()
    expect(screen.getByText("jane@example.com")).toBeInTheDocument()
    expect(screen.getByText("Admin")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument()
  })
})
