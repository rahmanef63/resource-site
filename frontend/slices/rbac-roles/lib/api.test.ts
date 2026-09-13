import { describe, expect, it } from "vitest";
import { createPermissionsApi } from "./api";

describe("createPermissionsApi", () => {
  it("keeps exact and wildcard checks framework-neutral", () => {
    const api = createPermissionsApi(["content.*", "members.view"]);
    expect(api.can("content.edit")).toBe(true);
    expect(api.can("billing.view")).toBe(false);
    expect(api.canAny(["billing.view", "members.view"])).toBe(true);
    expect(api.canAll(["content.view", "content.publish"])).toBe(true);
  });
});
