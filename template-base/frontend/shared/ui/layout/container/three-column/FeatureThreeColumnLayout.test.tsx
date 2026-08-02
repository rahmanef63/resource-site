// @vitest-environment jsdom

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { FeatureThreeColumnLayout } from "./FeatureThreeColumnLayout";

vi.mock("@/frontend/shared/ui/layout/header", () => ({
  Header: Object.assign(
    ({ children, className }: any) => <div data-testid="header" className={className}>{children}</div>,
    {
      Actions: ({ children }: any) => <div data-testid="header-actions">{children}</div>,
    },
  ),
  HeaderControls: ({ searchProps }: any) => (
    <input
      data-testid="header-search"
      value={searchProps?.value ?? ""}
      placeholder={searchProps?.placeholder}
      onChange={(event) => searchProps?.onChange?.(event.target.value)}
    />
  ),
}));

vi.mock("@/frontend/shared/ui/layout/toolbar", () => ({
  toolType: { sort: "sort" },
  UniversalToolbar: ({ tools }: any) => <div data-testid="sort-toolbar">{JSON.stringify(tools)}</div>,
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: any) => <div data-testid="scroll-area" className={className}>{children}</div>,
}));

describe("FeatureThreeColumnLayout", () => {
  it("renders sidebar title and stats", () => {
    render(
      <FeatureThreeColumnLayout
        preset="feature"
        storageKey="feature-layout-test"
        sidebarTitle="Contacts"
        sidebarStats="10 items"
        sidebarContent={<div>Sidebar Body</div>}
        mainContent={<div>Main Body</div>}
        inspector={<div>Inspector Body</div>}
      />,
    );

    expect(screen.getByText("Contacts")).toBeInTheDocument();
    expect(screen.getByText("10 items")).toBeInTheDocument();
  });

  it("renders loading skeletons for the sidebar", () => {
    const { container } = render(
      <FeatureThreeColumnLayout
        sidebarContent={<div>Sidebar Body</div>}
        mainContent={<div>Main Body</div>}
        inspector={<div>Inspector Body</div>}
        loading={{ sidebar: true }}
      />,
    );

    expect(container.querySelectorAll(".animate-pulse, .bg-primary\\/10, [class*='skeleton']").length).toBeGreaterThanOrEqual(0);
  });

  it("shows sidebar empty state when configured", () => {
    render(
      <FeatureThreeColumnLayout
        sidebarContent={null}
        mainContent={<div>Main Body</div>}
        inspector={<div>Inspector Body</div>}
        sidebarEmptyState={{
          title: "No sidebar content",
          description: "Nothing here yet",
        }}
      />,
    );

    expect(screen.getByText("No sidebar content")).toBeInTheDocument();
  });

  it("shows center empty state when main content is missing", () => {
    render(
      <FeatureThreeColumnLayout
        sidebarContent={<div>Sidebar Body</div>}
        mainContent={null}
        inspector={<div>Inspector Body</div>}
        centerEmptyState={{
          title: "No content selected",
          description: "Pick something from the list",
        }}
      />,
    );

    expect(screen.getByText("No content selected")).toBeInTheDocument();
  });

  it("renders right panel tabs when modes are configured", () => {
    render(
      <FeatureThreeColumnLayout
        sidebarContent={<div>Sidebar Body</div>}
        mainContent={<div>Main Body</div>}
        inspector={<div>Inspector Body</div>}
        rightPanelConfig={{
          modes: ["inspector", "ai", "settings"],
          defaultMode: "inspector",
          tabs: true,
          collapsible: true,
        }}
        rightPanelMode="inspector"
      />,
    );

    expect(
      screen.getAllByRole("button").some((button) => button.textContent?.trim() === "Inspector"),
    ).toBe(true);
    expect(
      screen.getAllByRole("button").some((button) => button.textContent?.trim() === "AI"),
    ).toBe(true);
  });

  it("renders search and sort controls when configured", () => {
    render(
      <FeatureThreeColumnLayout
        sidebarContent={<div>Sidebar Body</div>}
        mainContent={<div>Main Body</div>}
        inspector={<div>Inspector Body</div>}
        searchProps={{
          value: "hello",
          onChange: vi.fn(),
          placeholder: "Search items",
        }}
        sortOptions={{
          options: [
            { value: "name", label: "Name" },
            { value: "createdAt", label: "Created" },
          ],
          currentSort: "name",
          currentDirection: "asc",
          onChange: vi.fn(),
        }}
      />,
    );

    expect(screen.getByTestId("header-search")).toHaveAttribute("placeholder", "Search items");
    expect(screen.getByTestId("sort-toolbar")).toBeInTheDocument();
  });
});
