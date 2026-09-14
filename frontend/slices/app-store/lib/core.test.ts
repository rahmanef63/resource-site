import { describe, expect, it } from "vitest";
import { appManifestJson, slugifyAppName } from "./create-core";
import { configureAppStoreExec, getAppStoreExecRevision, appStoreExecApi } from "./exec-core";
import { splitConsoleLines } from "./runtime-core";

describe("app-store portable cores", () => {
  it("normalizes app names and manifest output", () => {
    expect(slugifyAppName(" My Cool App ")).toBe("my-cool-app");
    expect(appManifestJson({ name: "My Cool App", runtime: "node", entry: "main.js", glyph: "code", gradient: "x" })).toContain('"appId": "my-cool-app"');
  });

  it("makes exec adapter replacement observable and callable", async () => {
    const before = getAppStoreExecRevision();
    configureAppStoreExec({ mode: "live", exec: { run: async () => ({ stdout: "ok", stderr: "", code: 0 }) } });
    expect(getAppStoreExecRevision()).toBe(before + 1);
    expect(appStoreExecApi.mode).toBe("live");
    await expect(appStoreExecApi.exec.run("echo ok")).resolves.toEqual({ stdout: "ok", stderr: "", code: 0 });
  });

  it("splits console output without synthetic blank rows", () => {
    expect(splitConsoleLines("a\nb\n", "out")).toEqual([{ kind: "out", text: "a" }, { kind: "out", text: "b" }]);
  });
});
