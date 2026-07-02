/**
 * @vitest-environment jsdom
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { UserManagementPanel } from "./UserManagementPanel"

vi.mock("../api", () => ({
  useHierarchyMemberOverview: () => ({ totalMembers: 7 }),
  useWorkspaceTeams: () => [{ _id: "team-1" }],
}))

vi.mock("./MembersListPanel", () => ({
  MembersListPanel: () => <div>Members list</div>,
}))

vi.mock("./RoleExplorerPanel", () => ({
  RoleExplorerPanel: () => <div>Role explorer</div>,
}))

vi.mock("./TeamListPanel", () => ({
  TeamListPanel: () => <div>Team list</div>,
}))

vi.mock("@/frontend/shared/ui/components/invitations/PendingInvitationsCard", () => ({
  PendingInvitationsCard: (props: { id?: string }) => (
    <div data-testid="pending-invitations-card" id={props.id}>
      Pending invitations card
    </div>
  ),
}))

vi.mock("@/frontend/shared/ui/components/invitations/PendingContactRequestsCard", () => ({
  PendingContactRequestsCard: (props: { id?: string }) => (
    <div data-testid="pending-contact-requests-card" id={props.id}>
      Pending contact requests card
    </div>
  ),
}))

describe("UserManagementPanel", () => {
  it("renders the shared pending invitations + contact-requests cards above the tabs", () => {
    render(<UserManagementPanel workspaceId={"workspace-1" as any} />)

    expect(screen.getByTestId("pending-invitations-card")).toBeInTheDocument()
    expect(screen.getByTestId("pending-invitations-card")).toHaveAttribute("id", "pending-invitations")
    expect(screen.getByTestId("pending-contact-requests-card")).toBeInTheDocument()
    expect(screen.getByTestId("pending-contact-requests-card")).toHaveAttribute("id", "pending-contact-requests")
    expect(screen.getByText("Members")).toBeInTheDocument()
  })
})
