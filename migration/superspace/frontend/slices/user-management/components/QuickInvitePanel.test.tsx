/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QuickInvitePanel } from "./QuickInvitePanel";

vi.mock("../api", () => ({
  useBulkInviteContacts: () => vi.fn(),
  useInviteToHierarchy: () => vi.fn(),
  useInviteTeamToWorkspaces: () => vi.fn(),
  useRoles: () => [
    {
      _id: "role-1",
      name: "Admin",
      color: "#22c55e",
      level: 10,
    },
  ],
  useUserWorkspaceMatrix: () => ({
    workspaces: [
      {
        _id: "workspace-1",
        name: "Workspace One",
        slug: "workspace-one",
      },
    ],
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe("QuickInvitePanel layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps a stacked layout by default and only enables the two-column rail at the explicit desktop threshold", () => {
    render(
      <QuickInvitePanel
        workspaceId={"workspace-1" as any}
        Contacts={[]}
        teams={[]}
      />,
    );

    const layout = screen.getByTestId("quick-invite-layout");
    const sideRail = screen.getByTestId("quick-invite-side-rail");

    expect(layout.className).toContain("grid-cols-1");
    expect(layout.className).toContain("overflow-x-hidden");
    expect(layout.className).toContain(
      "min-[1100px]:grid-cols-[minmax(0,1fr)_360px]",
    );
    expect(sideRail.className).toContain("min-[1100px]:w-[360px]");
  });
});

