// Regression suite for the U7 sidebar bugs: dead branch toggles
// (tooltip-in-CollapsibleTrigger swallowed clicks), chevrons that never
// rotated (group/* class on an element without Radix data-state), and
// every section defaulting open. These are INTERACTION tests — the audit
// chain is structural and never caught a dead click.
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BranchItem, SectionGroup } from "./nav-parts";
import type { NavBranch, NavSection } from "./nav-types";

const branch: NavBranch = {
  kind: "branch",
  title: "Auth",
  items: [
    { kind: "leaf", title: "Convex Auth", href: "/slices/convex-auth" },
    { kind: "leaf", title: "RBAC", href: "/slices/rbac-roles" },
  ],
};

const section: NavSection = { label: "Slices", items: [branch] };

function mount(ui: React.ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

describe("SectionGroup", () => {
  it("starts open only when it contains the active path", () => {
    mount(<SectionGroup section={section} pathname="/slices/convex-auth" />);
    expect(screen.getByText("Auth")).toBeDefined();
  });

  it("starts collapsed when the active path is elsewhere", () => {
    mount(<SectionGroup section={section} pathname="/docs" />);
    expect(screen.queryByText("Auth")).toBeNull();
  });

  it("toggles on header click", () => {
    mount(<SectionGroup section={section} pathname="/docs" />);
    fireEvent.click(screen.getByText("Slices"));
    expect(screen.getByText("Auth")).toBeDefined();
    fireEvent.click(screen.getByText("Slices"));
    expect(screen.queryByText("Auth")).toBeNull();
  });

  it("keeps the chevron's group class on the data-state carrier", () => {
    const { container } = mount(
      <SectionGroup section={section} pathname="/docs" />,
    );
    // The group/section class must live on the SAME element Radix stamps
    // data-state on, or group-data-[state=open] selectors never fire —
    // exactly the U7 chevron bug.
    const carrier = container.querySelector(".group\\/section");
    expect(carrier).not.toBeNull();
    expect(carrier!.getAttribute("data-state")).toMatch(/^(open|closed)$/);
  });
});

describe("BranchItem", () => {
  function mountBranch(pathname: string) {
    return mount(
      <ul>
        <BranchItem branch={branch} pathname={pathname} />
      </ul>,
    );
  }

  it("expands and collapses on trigger click (the U7 dead-toggle bug)", () => {
    mountBranch("/docs");
    expect(screen.queryByText("Convex Auth")).toBeNull();
    fireEvent.click(screen.getByText("Auth"));
    expect(screen.getByText("Convex Auth")).toBeDefined();
    fireEvent.click(screen.getByText("Auth"));
    expect(screen.queryByText("Convex Auth")).toBeNull();
  });

  it("starts open when a child is active", () => {
    mountBranch("/slices/rbac-roles");
    expect(screen.getByText("RBAC")).toBeDefined();
  });

  it("keeps the chevron's group class on the data-state carrier", () => {
    const { container } = mountBranch("/docs");
    const carrier = container.querySelector(".group\\/branch");
    expect(carrier).not.toBeNull();
    expect(carrier!.getAttribute("data-state")).toMatch(/^(open|closed)$/);
  });
});
