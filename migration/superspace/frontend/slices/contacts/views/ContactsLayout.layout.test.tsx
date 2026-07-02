// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const featureShellSpy = vi.fn((props: any) => (
  <div
    data-testid="layout"
    data-storage-key={props.storageKey}
    data-feature-id={props.featureId}
  >
    <div>{props.children}</div>
    {props.inspector}
  </div>
));

vi.mock("@/frontend/shared/ui/layout/feature-shell", () => ({
  FeatureShell: (props: any) => featureShellSpy(props),
}));

vi.mock("@/frontend/shared/communications", () => ({
  MemberInfoPanel: () => <div>Member Info</div>,
  useMemberInfo: () => ({
    profile: null,
    sharedMedia: [],
    sharedFiles: [],
    sharedLinks: [],
    commonGroups: [],
    loading: false,
    isFavorite: false,
    isBlocked: false,
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
    blockMember: vi.fn(),
    unblockMember: vi.fn(),
    reportMember: vi.fn(),
  }),
}));

vi.mock("@/frontend/slices/user-management/api", () => ({
  useContactsForQuickInvite: () => [],
}));

vi.mock("../components/InviteContactToWorkspaceDialog", () => ({
  InviteContactToWorkspaceDialog: () => null,
}));

import { ContactsLayout } from "./ContactsLayout";

describe("ContactsLayout layout contract", () => {
  beforeEach(() => {
    featureShellSpy.mockClear();
  });

  it("uses FeatureShell with canonical storage + featureId", () => {
    const { container } = render(
      <ContactsLayout
        workspaceId={"ws_1" as any}
        selectedContact={null}
        onCloseInspector={vi.fn()}
      >
        <div>Contacts Center</div>
      </ContactsLayout>,
    );

    const props = featureShellSpy.mock.calls.at(-1)?.[0];
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(props.storageKey).toBe("contacts-layout");
    expect(props.featureId).toBe("contacts");
    expect(container.firstChild).toHaveClass("h-full", "overflow-hidden");
  });
});
