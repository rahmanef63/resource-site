// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const featureLayoutSpy = vi.fn((props: any) => (
  <div data-testid="layout" data-storage-key={props.storageKey} data-preset={props.preset ?? "feature"}>
    <div>{props.sidebarContent}</div>
    <div>{props.mainContent}</div>
    <div>{props.inspector}</div>
  </div>
));

vi.mock("@/frontend/shared/ui/layout/container/three-column/FeatureThreeColumnLayout", () => ({
  FeatureThreeColumnLayout: (props: any) => featureLayoutSpy(props),
}));

vi.mock("../hooks/useCalendar", () => ({
  useCalendar: () => ({
    isLoading: false,
    events: [],
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
  }),
}));

vi.mock("../components/panels/CalendarLeftPanel", () => ({ CalendarLeftPanel: () => <div>Calendar Left</div> }));
vi.mock("../components/panels/CalendarCenterPanel", () => ({ CalendarCenterPanel: () => <div>Calendar Center</div> }));
vi.mock("../components/CalendarSidebar", () => ({ CalendarSidebar: () => <div>Calendar Right</div> }));
vi.mock("../components/EventFormDialog", () => ({ EventFormDialog: () => null }));
vi.mock("../components/EventDetailsDialog", () => ({ EventDetailsDialog: () => null }));

import CalendarPage from "./CalendarPage";

describe("CalendarPage layout contract", () => {
  beforeEach(() => {
    featureLayoutSpy.mockClear();
  });

  it("passes canonical feature layout props", () => {
    render(<CalendarPage workspaceId={"ws_1" as any} />);

    const props = featureLayoutSpy.mock.calls.at(-1)?.[0];
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(props.storageKey).toBe("calendar-layout");
    expect(props.preset ?? "feature").toBe("feature");
  });
});
