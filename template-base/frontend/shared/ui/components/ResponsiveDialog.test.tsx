/**
 * @vitest-environment jsdom
 */

import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResponsiveDialog } from "./ResponsiveDialog";

let mockIsMobile = false;

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => mockIsMobile,
}));

vi.mock("@/components/ui/dialog", async () => {
  const React = await import("react");
  const DialogContext = React.createContext(false);

  return {
    Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
      <DialogContext.Provider value={open}>{children}</DialogContext.Provider>
    ),
    DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => {
      const open = React.useContext(DialogContext);
      return open ? (
        <div data-testid="dialog-content" className={className}>
          {children}
        </div>
      ) : null;
    },
    DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="dialog-header" className={className}>
        {children}
      </div>
    ),
    DialogFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="dialog-footer" className={className}>
        {children}
      </div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

vi.mock("@/components/ui/drawer", async () => {
  const React = await import("react");
  const DrawerContext = React.createContext(false);

  return {
    Drawer: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
      <DrawerContext.Provider value={open}>{children}</DrawerContext.Provider>
    ),
    DrawerContent: ({ children, className }: { children: React.ReactNode; className?: string }) => {
      const open = React.useContext(DrawerContext);
      return open ? (
        <div data-testid="drawer-content" className={className}>
          {children}
        </div>
      ) : null;
    },
    DrawerDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DrawerHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="drawer-header" className={className}>
        {children}
      </div>
    ),
    DrawerFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="drawer-footer" className={className}>
        {children}
      </div>
    ),
    DrawerTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

vi.mock("@/components/ui/sheet", async () => {
  const React = await import("react");
  const SheetContext = React.createContext(false);

  return {
    Sheet: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
      <SheetContext.Provider value={open}>{children}</SheetContext.Provider>
    ),
    SheetContent: ({ children, className }: { children: React.ReactNode; className?: string }) => {
      const open = React.useContext(SheetContext);
      return open ? (
        <div data-testid="sheet-content" className={className}>
          {children}
        </div>
      ) : null;
    },
    SheetDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SheetHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="sheet-header" className={className}>
        {children}
      </div>
    ),
    SheetFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="sheet-footer" className={className}>
        {children}
      </div>
    ),
    SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

vi.mock("@/components/ui/alert-dialog", async () => {
  const React = await import("react");
  const AlertContext = React.createContext(false);

  return {
    AlertDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
      <AlertContext.Provider value={open}>{children}</AlertContext.Provider>
    ),
    AlertDialogContent: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => {
      const open = React.useContext(AlertContext);
      return open ? (
        <div data-testid="alert-content" className={className}>
          {children}
        </div>
      ) : null;
    },
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogHeader: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <div data-testid="alert-header" className={className}>
        {children}
      </div>
    ),
    AlertDialogFooter: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <div data-testid="alert-footer" className={className}>
        {children}
      </div>
    ),
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

const renderDialog = (
  props: Partial<React.ComponentProps<typeof ResponsiveDialog>> = {},
) =>
  render(
    <ResponsiveDialog open onOpenChange={() => {}} variant="modal" {...props}>
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Title</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>Desc</ResponsiveDialog.Description>
      </ResponsiveDialog.Header>
      <ResponsiveDialog.Body>Body</ResponsiveDialog.Body>
      <ResponsiveDialog.Footer>
        <button>Cancel</button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>,
  );

describe("ResponsiveDialog", () => {
  beforeEach(() => {
    mockIsMobile = false;
  });

  it("renders Dialog on desktop for modal variant with correct size class", async () => {
    renderDialog({ size: "xl" });

    await waitFor(() => {
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    });

    expect(screen.getByTestId("dialog-content").className).toContain("sm:max-w-4xl");
    expect(screen.getByTestId("dialog-content").className).toContain("h-[80vh]");
    expect(screen.queryByTestId("drawer-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("dialog-footer")).toBeInTheDocument();
  });

  it("renders Drawer on mobile for modal variant", async () => {
    mockIsMobile = true;
    renderDialog();

    await waitFor(() => {
      expect(screen.getByTestId("drawer-content")).toBeInTheDocument();
    });

    expect(screen.getByTestId("drawer-content").className).toContain("h-[90dvh]");
    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("drawer-header")).toBeInTheDocument();
    expect(screen.getByTestId("drawer-footer")).toBeInTheDocument();
  });

  it("renders Sheet on desktop for panel variant", async () => {
    renderDialog({ variant: "panel" });

    await waitFor(() => {
      expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("drawer-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("sheet-footer")).toBeInTheDocument();
  });

  it("renders Drawer on mobile for panel variant", async () => {
    mockIsMobile = true;
    renderDialog({ variant: "panel" });

    await waitFor(() => {
      expect(screen.getByTestId("drawer-content")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("sheet-content")).not.toBeInTheDocument();
  });

  it("renders AlertDialog on desktop for alert variant", async () => {
    renderDialog({ variant: "alert" });

    await waitFor(() => {
      expect(screen.getByTestId("alert-content")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("alert-footer")).toBeInTheDocument();
  });

  it("renders Drawer on mobile for alert variant", async () => {
    mockIsMobile = true;
    renderDialog({ variant: "alert" });

    await waitFor(() => {
      expect(screen.getByTestId("drawer-content")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("alert-content")).not.toBeInTheDocument();
  });

  it("throws when sub-components are used outside the root", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>X</ResponsiveDialog.Title>
        </ResponsiveDialog.Header>,
      ),
    ).toThrow(/must be rendered inside <ResponsiveDialog>/);
    spy.mockRestore();
  });
});
