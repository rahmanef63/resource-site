import { describe, expect, it } from "vitest";
import { resolveApp } from "./run-dialog";
import type { AppDescriptor } from "../../../lib/types";

// resolveApp only reads id/title, so minimal stubs are enough.
const app = (id: string, title: string) => ({ id, title }) as AppDescriptor;
const apps = [
  app("files", "Files"),
  app("settings", "Settings"),
  app("appstore", "App Store"),
  app("terminal", "Terminal"),
];

describe("resolveApp (Win+R name → registered app)", () => {
  it("matches an exact id case-insensitively", () => {
    expect(resolveApp("FILES", apps)?.id).toBe("files");
  });

  it("matches an exact title (spaces and all)", () => {
    expect(resolveApp("app store", apps)?.id).toBe("appstore");
  });

  it("prefers a title prefix over a mid-string substring", () => {
    expect(resolveApp("set", apps)?.id).toBe("settings");
  });

  it("falls back to an id/title substring", () => {
    expect(resolveApp("erm", apps)?.id).toBe("terminal"); // 'erm' ⊂ 'terminal'
  });

  it("returns undefined for blank or unknown input", () => {
    expect(resolveApp("   ", apps)).toBeUndefined();
    expect(resolveApp("photoshop.exe", apps)).toBeUndefined();
  });
});
