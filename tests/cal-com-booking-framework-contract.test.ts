// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/cal-com-booking/slice.json"), "utf8"));
const react = readFileSync(join(root, "frontend/slices/cal-com-booking/components/embed.tsx"), "utf8");
const svelte = readFileSync(join(root, "frontend/slices/cal-com-booking-svelte/components/CalEmbed.svelte"), "utf8");
const backend = readFileSync(join(root, "convex/features/bookings/_schema.ts"), "utf8");
const preview = readFileSync(join(root, "app/preview/slices/cal-com-booking/page.tsx"), "utf8");

describe("cal-com-booking framework contract", () => {
  it("keeps React default and selects native Svelte over the shared core/backend", () => {
    expect(slice.version).toBe("0.3.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].path).toBe("frontend/slices/cal-com-booking-svelte");
    expect(slice.frontend.frameworks["svelte-sveltekit"].aliases).toEqual(["svelte", "sveltekit"]);
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.npm).toEqual(["svelte@^5"]);
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual([
      "frontend/slices/cal-com-booking/lib/embed-core.ts",
      "frontend/slices/cal-com-booking/lib/tools.ts",
    ]);
  });

  it("ships real embed wiring without fake account defaults or React leakage into Svelte", () => {
    expect(react).toContain('from "@calcom/embed-react"');
    expect(react).toContain("Configure a Cal.com");
    expect(react).not.toContain("your-handle");
    expect(svelte).toContain('from "svelte"');
    expect(svelte).toContain("onMount(");
    expect(svelte).toContain("bind:this={host}");
    expect(svelte).toContain("mountCalInline");
    expect(svelte).not.toContain("@calcom/embed-react");
    expect(svelte).not.toContain('from "react"');
    expect(svelte).not.toContain("@/components/ui/");
    expect(preview).toContain("<CalEmbed />");
    expect(preview).not.toContain("Rahman");
    expect(preview).not.toContain("Booking widget — mock");
  });

  it("describes the real bookings mirror and keeps cancel/reschedule as adapters", () => {
    expect(backend).toContain("bookings: defineTable");
    expect(slice.contract.provides.convex.tables).toEqual(["bookings"]);
    expect(slice.contract.requires.convex).toBeUndefined();
    expect(slice.contract.requires.env).toEqual(["CALCOM_WEBHOOK_SECRET"]);
    expect(slice.deps.env.map((entry: { name: string }) => entry.name)).toEqual(["CALCOM_WEBHOOK_SECRET"]);
    expect(slice.contract.generalization).toEqual({
      level: "needs-adapter",
      requiredProps: ["calLink", "list", "cancel", "reschedule"],
    });
    expect(JSON.stringify(slice)).not.toContain("cal_com_booking_bookings");
    expect(JSON.stringify(slice)).not.toContain("NEXT_PUBLIC_CALCOM_USERNAME");
  });
});
