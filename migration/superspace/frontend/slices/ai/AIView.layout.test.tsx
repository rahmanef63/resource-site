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

const mockUseIsMobile = vi.fn(() => false);

vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => mockUseIsMobile() }));
vi.mock("@/frontend/shared/ui/layout/container", () => ({
  FeatureThreeColumnLayout: (props: any) => advancedLayoutSpy(props),
}));
vi.mock("./stores", () => ({
  useAIStore: (selector: any) =>
    selector({
      selectedSessionId: null,
      selectedSession: null,
      knowledgeEnabled: false,
      setKnowledgeEnabled: vi.fn(),
    }),
}));
vi.mock("./hooks", () => ({
  useInitializeAI: vi.fn(),
  useAIActions: () => ({ selectSession: vi.fn() }),
}));
vi.mock("./panels", () => ({
  AILeftPanel: () => <div>AI Left</div>,
  AICenterPanel: () => <div>AI Center</div>,
  AIRightPanel: () => <div>AI Right</div>,
}));
vi.mock("./components/AISessionInfoDrawer", () => ({
  AISessionInfoDrawer: () => <div>AI Drawer</div>,
}));
vi.mock("@/frontend/shared/ui/layout/header", () => ({
  MobileHeader: () => <div>Mobile Header</div>,
}));

import { AIView } from "./AIView";

describe("AIView layout contract", () => {
  beforeEach(() => {
    advancedLayoutSpy.mockClear();
    mockUseIsMobile.mockReturnValue(false);
  });

  it("uses feature preset with persistent storage on desktop", () => {
    const { container } = render(<AIView />);

    const props = advancedLayoutSpy.mock.calls.at(-1)?.[0];
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(props.storageKey).toBe("ai-layout");
    expect(props.preset).toBe("feature");
    expect(container.firstChild).toHaveClass("h-full", "overflow-hidden");
  });

  it("renders mobile view without crashing", () => {
    mockUseIsMobile.mockReturnValue(true);
    render(<AIView />);
    expect(screen.getByText("Mobile Header")).toBeInTheDocument();
  });
});
