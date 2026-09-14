// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/resend-newsletter/slice.json"), "utf8"));
const react = readFileSync(join(root, "frontend/slices/resend-newsletter/components/subscribe-form.tsx"), "utf8");
const svelte = readFileSync(join(root, "frontend/slices/resend-newsletter-svelte/components/SubscribeForm.svelte"), "utf8");
const mutation = readFileSync(join(root, "convex/features/newsletter/mutation.ts"), "utf8");
const query = readFileSync(join(root, "convex/features/newsletter/query.ts"), "utf8");
const send = readFileSync(join(root, "convex/features/newsletter/actions/send.ts"), "utf8");

describe("resend-newsletter framework contract", () => {
  it("keeps React default and selects native Svelte over shared public core/host", () => {
    expect(slice.version).toBe("0.3.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.shadcn).toEqual([]);
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual([
      "frontend/slices/resend-newsletter/lib/core.ts",
      "frontend/slices/resend-newsletter/lib/host.ts",
      "frontend/slices/resend-newsletter/lib/tools.ts",
    ]);
    expect(react).toContain("newsletterPublicApi.subscribe");
    expect(react).not.toContain("setTimeout(");
    expect(svelte).toContain("newsletterPublicApi.subscribe");
    for (const token of ['from "react"', "@/components/ui/", "lucide-react", "on:submit", "on:click"]) {
      expect(svelte).not.toContain(token);
    }
  });

  it("describes the real three-table backend and truthful single opt-in behavior", () => {
    expect(slice.contract.provides.convex.tables).toEqual([
      "newsletterSubscribers",
      "newsletterIssues",
      "newsletterSubscribeAttempts",
    ]);
    expect(slice.contract.requires.convex).toBeUndefined();
    expect(JSON.stringify(slice)).not.toContain("newsletter_subscribers");
    expect(JSON.stringify(slice)).not.toContain("newsletter_broadcasts");
    expect(mutation).toContain('status: "active"');
    expect(mutation).toContain("export const unsubscribe = mutation");
    expect(query).toContain("export const listSubscribersPublic = query");
    expect(send).toContain("export const sendCampaignPublic = action");
  });

  it("keeps actual email delivery behind the internal Resend worker", () => {
    expect(send).toContain('await import("resend")');
    expect(send).toContain("export const broadcast = internalAction");
    expect(send).toContain("admin role required");
    expect(react).not.toContain("resend.emails.send");
    expect(svelte).not.toContain("resend.emails.send");
  });
});
