// Pins the VP knob contract: knobs are shadcn Tabs, and a variant change
// REMOUNTS the widget — axes that only feed initial state (convex-auth's
// defaultPasswordMode → useState) silently no-op without the remount.
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Knob, LazyWidget } from "./variant-preview-widget";

describe("Knob", () => {
  it("renders one tab per value and fires onChange on click", () => {
    const onChange = vi.fn();
    render(<Knob label="layout" values={["grid", "list"]} value="grid" onChange={onChange} />);

    const grid = screen.getByRole("tab", { name: "grid" });
    const list = screen.getByRole("tab", { name: "list" });
    expect(grid.getAttribute("aria-selected")).toBe("true");
    expect(list.getAttribute("aria-selected")).toBe("false");

    fireEvent.mouseDown(list, { button: 0 });
    fireEvent.click(list);
    expect(onChange).toHaveBeenCalledWith("list");
  });
});

describe("LazyWidget", () => {
  it("remounts on variant change so initial-state axes take effect (convex-auth)", async () => {
    const variant = { methods: "password-google", defaultPasswordMode: "signin" };
    const { rerender } = render(
      <LazyWidget slug="convex-auth" component="AuthCard" variant={variant} />,
    );
    const signin = await screen.findByRole("tab", { name: "Sign in" }, { timeout: 8000 });
    expect(signin.getAttribute("aria-selected")).toBe("true");

    rerender(
      <LazyWidget
        slug="convex-auth"
        component="AuthCard"
        variant={{ ...variant, defaultPasswordMode: "signup" }}
      />,
    );
    const signup = await screen.findByRole("tab", { name: "Sign up" }, { timeout: 8000 });
    expect(signup.getAttribute("aria-selected")).toBe("true");
    // Cold dynamic-import of the convex-auth preview module is slow to transform
    // under full-suite load (~5s); give this test headroom past the 5s default.
  }, 20000);
});
