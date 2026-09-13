import { describe, expect, it } from "vitest";
import {
  buildOnboardingSavePayload,
  createOnboardingStore,
  groupPresetOptions,
  isValidOptionalEmail,
  normalizePresetOptions,
} from "./core";

describe("site setup wizard core", () => {
  it("owns bounded step and field state without a framework", () => {
    const store = createOnboardingStore("#123456");
    expect(store.getSnapshot().fields.brandColor).toBe("#123456");
    store.goto(99);
    expect(store.getSnapshot().step).toBe(3);
    store.prev();
    expect(store.getSnapshot().step).toBe(2);
    store.setField("siteName", "Studio");
    store.markSeeded();
    expect(store.getSnapshot()).toMatchObject({ justSeeded: true, fields: { siteName: "Studio" } });
  });

  it("normalizes and groups preset options in stable input order", () => {
    const normalized = normalizePresetOptions([
      "plain",
      { name: "ocean", group: "Dark" },
      { name: "cosmic", group: "Dark" },
      { name: "warm", group: "Warm" },
    ]);
    expect(normalized[0]).toEqual({ name: "plain" });
    expect(groupPresetOptions(normalized).map((g) => [g.group, g.items.map((i) => i.name)])).toEqual([
      ["", ["plain"]],
      ["Dark", ["ocean", "cosmic"]],
      ["Warm", ["warm"]],
    ]);
  });

  it("validates optional email and strips empty fields from save payload semantics", () => {
    expect(isValidOptionalEmail("")).toBe(true);
    expect(isValidOptionalEmail("bad@")).toBe(false);
    expect(isValidOptionalEmail("hello@example.com")).toBe(true);
    const fields = createOnboardingStore().getSnapshot().fields;
    fields.siteName = "Site";
    const payload = buildOnboardingSavePayload(fields);
    expect(payload.siteName).toBe("Site");
    expect(payload.tagline).toBeUndefined();
    expect(payload.markOnboarded).toBe(true);
  });
});
