// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const component = readFileSync(
  join(root, "frontend/slices/booking-svelte/components/Booking.svelte"),
  "utf8",
);
const indexSource = readFileSync(join(root, "frontend/slices/booking-svelte/index.ts"), "utf8");
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/booking/slice.json"), "utf8"));

describe("booking Svelte distribution contract", () => {
  it("keeps React as default and scopes Svelte dependencies to the Svelte descriptor", () => {
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toEqual({
      path: "frontend/slices/booking-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [] },
    });
  });

  it("uses current Svelte syntax without React UI leakage", () => {
    expect(component).toContain("$effect(");
    expect(component).toContain("onsubmit=");
    expect(component).not.toContain("export let");
    expect(component).not.toMatch(/\$:\s/);
    expect(component).not.toContain('from "react"');
    expect(component).not.toContain("lucide-react");
    expect(component).not.toContain("@/components/ui/");
  });

  it("preserves public form, owner inbox, triage actions, and accessible feedback", () => {
    expect(component).toContain("api.submit");
    expect(component).toContain("api.canManage");
    expect(component).toContain("api.list");
    expect(component).toContain("api.setStatus");
    expect(component).toContain('type="email"');
    expect(component).toContain("Confirm request from");
    expect(component).toContain("Decline request from");
    expect(component).toContain('role="alert"');
    expect(component).toContain('role="status"');
    expect(indexSource).toContain('icon: "calendar-check"');
  });
});
