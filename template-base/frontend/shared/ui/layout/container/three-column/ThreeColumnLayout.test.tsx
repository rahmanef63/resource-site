// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ThreeColumnLayoutAdvanced } from "./ThreeColumnLayout";
import { useThreeColumnLayout } from "./context";

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

function ContextProbe() {
  const layout = useThreeColumnLayout();
  return (
    <button onClick={layout.toggleLeft} data-testid="context-probe">
      {layout.leftCollapsed ? "collapsed" : "expanded"}
    </button>
  );
}

describe("ThreeColumnLayoutAdvanced", () => {
  beforeEach(() => {
    localStorage.clear();
    setViewport(1280);
  });

  it("renders all three panels with aria labels", () => {
    render(
      <ThreeColumnLayoutAdvanced
        left={<div>Left Content</div>}
        center={<div>Center Content</div>}
        right={<div>Right Content</div>}
        leftLabel="Left Panel"
        centerLabel="Center Panel"
        rightLabel="Right Panel"
      />,
    );

    expect(screen.getByLabelText("Left Panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Center Panel")).toBeInTheDocument();
    expect(screen.getByLabelText("Right Panel")).toBeInTheDocument();
  });

  it("shows collapsed indicators when left and right panels are collapsed", () => {
    render(
      <ThreeColumnLayoutAdvanced
        left={<div>Left Content</div>}
        center={<div>Center Content</div>}
        right={<div>Right Content</div>}
        leftLabel="Left Panel"
        centerLabel="Center Panel"
        rightLabel="Right Panel"
        leftCollapsed
        rightCollapsed
      />,
    );

    expect(screen.getByRole("button", { name: /expand left panel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /expand right panel/i })).toBeInTheDocument();
  });

  it("hides panels when leftHidden or rightHidden are set", () => {
    render(
      <ThreeColumnLayoutAdvanced
        left={<div>Left Content</div>}
        center={<div>Center Content</div>}
        right={<div>Right Content</div>}
        leftHidden
        rightHidden
        centerLabel="Center Panel"
      />,
    );

    expect(screen.queryByText("Left Content")).not.toBeInTheDocument();
    expect(screen.queryByText("Right Content")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Center Panel")).toBeInTheDocument();
  });

  it("fires collapse callbacks when toggles are used", () => {
    const onLeftCollapsedChange = vi.fn();
    const onRightCollapsedChange = vi.fn();

    render(
      <ThreeColumnLayoutAdvanced
        left={<div>Left Content</div>}
        center={<div>Center Content</div>}
        right={<div>Right Content</div>}
        leftLabel="Left Panel"
        rightLabel="Right Panel"
        onLeftCollapsedChange={onLeftCollapsedChange}
        onRightCollapsedChange={onRightCollapsedChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /collapse left panel/i }));
    fireEvent.click(screen.getByRole("button", { name: /collapse right panel/i }));

    expect(onLeftCollapsedChange).toHaveBeenCalledWith(true);
    expect(onRightCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("exposes layout context through useThreeColumnLayout", () => {
    render(
      <ThreeColumnLayoutAdvanced
        left={<div>Left Content</div>}
        center={<ContextProbe />}
        right={<div>Right Content</div>}
        leftLabel="Left Panel"
      />,
    );

    expect(screen.getByTestId("context-probe")).toHaveTextContent("expanded");
    fireEvent.click(screen.getByTestId("context-probe"));
    expect(screen.getByTestId("context-probe")).toHaveTextContent("collapsed");
  });

  it("persists collapse state to localStorage", async () => {
    render(
      <ThreeColumnLayoutAdvanced
        left={<div>Left Content</div>}
        center={<div>Center Content</div>}
        right={<div>Right Content</div>}
        leftLabel="Left Panel"
        persistState
        storageKey="layout-persist-test"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /collapse left panel/i }));

    await waitFor(() => {
      expect(localStorage.getItem("layout-persist-test")).toContain('"leftCollapsed":true');
    });
  });

  it("supports keyboard shortcut Ctrl+B for the left panel", () => {
    render(
      <ThreeColumnLayoutAdvanced
        left={<div>Left Content</div>}
        center={<div>Center Content</div>}
        right={<div>Right Content</div>}
        leftLabel="Left Panel"
      />,
    );

    fireEvent.keyDown(document, { key: "b", ctrlKey: true });

    expect(screen.getByRole("button", { name: /expand left panel/i })).toBeInTheDocument();
  });

  it("renders stacked mobile layout with overscroll and touch-friendly buttons", async () => {
    setViewport(375);

    const { container } = render(
      <ThreeColumnLayoutAdvanced
        left={<div>Left Content</div>}
        center={<div>Center Content</div>}
        right={<div>Right Content</div>}
        leftHidden
        leftLabel="Navigation"
        centerLabel="Workspace"
        rightLabel="Inspector"
        stackAt={480}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Workspace")).toBeInTheDocument();
    });

    expect(container.firstChild).toHaveClass("overscroll-none");
    const inspectorButton = screen.getByRole("button");
    expect(inspectorButton.className).toContain("touch-manipulation");
  });
});
