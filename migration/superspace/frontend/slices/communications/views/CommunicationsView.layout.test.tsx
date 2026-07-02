// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const advancedLayoutSpy = vi.fn((props: any) => (
  <div data-testid="layout" data-storage-key={props.storageKey} data-preset={props.preset ?? "feature"}>
    <div>{props.sidebarContent}</div>
    <div>{props.mainContent}</div>
    <div>{props.inspector}</div>
  </div>
));

vi.mock("@/frontend/shared/ui/layout/container", () => ({
  FeatureThreeColumnLayout: (props: any) => advancedLayoutSpy(props),
}));

vi.mock("../shared", () => ({
  useCommunicationsStore: (selector: any) => selector({ setViewMode: vi.fn() }),
  useSelectedChannelId: () => "channel_1",
  useSelectedDirectId: () => null,
  useActiveCall: () => null,
  useViewMode: () => "channel",
  useRightPanelOpen: () => true,
}));

vi.mock("../sections/CommunicationSidebar", () => ({ CommunicationSidebar: () => <div>Sidebar</div> }));
vi.mock("../sections/MessageArea", () => ({ MessageArea: () => <div>Messages</div> }));
vi.mock("../sections/InspectorPanel", () => ({ InspectorPanel: () => <div>Inspector</div> }));
vi.mock("../sections/CallView", () => ({ CallView: () => <div>Call</div> }));

import CommunicationsView from "./CommunicationsView";

describe("CommunicationsView layout contract", () => {
  beforeEach(() => {
    advancedLayoutSpy.mockClear();
  });

  it("uses the advanced shared layout with feature preset and storage", () => {
    render(<CommunicationsView />);

    const props = advancedLayoutSpy.mock.calls.at(-1)?.[0];
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(props.storageKey).toBe("communications-layout");
    expect(props.preset).toBe("feature");
  });
});
