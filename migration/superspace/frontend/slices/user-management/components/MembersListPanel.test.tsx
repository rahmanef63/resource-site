/**
 * @vitest-environment jsdom
 */

import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MembersListPanel } from "./MembersListPanel";

let mockIsMobile = false;

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => mockIsMobile,
}));

vi.mock("@/components/ui/dialog", async () => {
  const React = await import("react");
  const DialogContext = React.createContext(false);

  return {
    Dialog: ({
      children,
      open,
    }: {
      children: React.ReactNode;
      open: boolean;
    }) => (
      <DialogContext.Provider value={open}>{children}</DialogContext.Provider>
    ),
    DialogContent: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => {
      const open = React.useContext(DialogContext);
      return open ? (
        <div data-testid="dialog-content" className={className}>
          {children}
        </div>
      ) : null;
    },
    DialogDescription: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock("@/components/ui/drawer", async () => {
  const React = await import("react");
  const DrawerContext = React.createContext(false);

  return {
    Drawer: ({
      children,
      open,
    }: {
      children: React.ReactNode;
      open: boolean;
    }) => (
      <DrawerContext.Provider value={open}>{children}</DrawerContext.Provider>
    ),
    DrawerContent: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => {
      const open = React.useContext(DrawerContext);
      return open ? (
        <div data-testid="drawer-content" className={className}>
          {children}
        </div>
      ) : null;
    },
    DrawerDescription: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DrawerHeader: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DrawerTitle: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock("@/components/ui/sheet", async () => {
  const React = await import("react");
  const SheetContext = React.createContext(false);

  return {
    Sheet: ({
      children,
      open,
    }: {
      children: React.ReactNode;
      open: boolean;
    }) => <SheetContext.Provider value={open}>{children}</SheetContext.Provider>,
    SheetContent: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => {
      const open = React.useContext(SheetContext);
      return open ? (
        <div data-testid="sheet-content" className={className}>
          {children}
        </div>
      ) : null;
    },
    SheetDescription: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SheetHeader: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SheetTitle: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock("../api", () => ({
  useMembers: () => [
    {
      _id: "membership-1",
      _creationTime: Date.now(),
      userId: "user-1",
      roleId: "role-1",
      workspaceId: "workspace-1",
      status: "active",
      user: {
        _id: "user-1",
        name: "Jane Workspace",
        email: "jane@example.com",
      },
      role: {
        _id: "role-1",
        name: "Admin",
        color: "#22c55e",
        level: 10,
      },
    },
  ],
  useRoles: () => [
    {
      _id: "role-1",
      name: "Admin",
      color: "#22c55e",
      level: 10,
    },
  ],
  useRemoveMember: () => vi.fn(),
  useUpdateMemberRole: () => vi.fn(),
  useWorkspaceInvitations: () => [],
  useCancelInvitation: () => vi.fn(),
  useResendInvitation: () => vi.fn(),
  useContactsForQuickInvite: () => [],
  useWorkspaceTeams: () => [],
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("./QuickInvitePanel", () => ({
  QuickInvitePanel: () => <div data-testid="quick-invite-panel">Quick invite panel</div>,
}));

describe("MembersListPanel invite overlay", () => {
  beforeEach(() => {
    mockIsMobile = false;
  });

  it("opens the invite flow in a wide desktop dialog", async () => {
    render(<MembersListPanel workspaceId={"workspace-1" as any} />);

    fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

    await waitFor(() => {
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    });

    expect(screen.getByTestId("dialog-content").className).toContain(
      "sm:max-w-[1100px]",
    );
    expect(screen.getByTestId("quick-invite-panel")).toBeInTheDocument();
  });

  it("opens the invite flow in a mobile drawer", async () => {
    mockIsMobile = true;

    render(<MembersListPanel workspaceId={"workspace-1" as any} />);

    fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

    await waitFor(() => {
      expect(screen.getByTestId("drawer-content")).toBeInTheDocument();
    });

    expect(screen.getByTestId("drawer-content").className).toContain(
      "h-[90dvh]",
    );
    expect(screen.getByTestId("quick-invite-panel")).toBeInTheDocument();
  });
});

