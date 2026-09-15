import { describe, expect, it, vi } from "vitest";
import { createFsHistory } from "./history-core";
import { createFileOperations, TRASH_PATH } from "./ops-core";
import type { FileExplorerAdapter, FsEntry } from "../adapter/types";

const dir = (name: string): FsEntry => ({ name, kind: "dir", size: 0 });

function adapter(mode: FileExplorerAdapter["mode"] = "mock") {
  const calls: string[] = [];
  const entries: Record<string, FsEntry[]> = { "/": [dir("a")], "/dest": [], [TRASH_PATH]: [] };
  const api: FileExplorerAdapter = {
    mode,
    list: async (path) => ({ path, entries: entries[path] ?? [] }),
    mkdir: async (path) => { calls.push(`mkdir:${path}`); },
    remove: async (path) => { calls.push(`remove:${path}`); },
    move: async (from, to) => { calls.push(`move:${from}->${to}`); },
    copy: async (from, to) => { calls.push(`copy:${from}->${to}`); },
    upload: async (_dest, files) => ({ written: files.length }),
    usage: async () => ({ used: 1, total: 10 }),
    rawUrl: () => "",
  };
  return { api, calls };
}

describe("file explorer portable cores", () => {
  it("keeps browser-style path history deterministic", () => {
    const h = createFsHistory("/");
    h.navigate("/a"); h.navigate("/b");
    expect(h.getSnapshot()).toEqual({ path: "/b", canBack: true, canForward: false });
    h.goBack();
    expect(h.getSnapshot()).toEqual({ path: "/a", canBack: true, canForward: true });
    h.navigate("/c");
    expect(h.getSnapshot()).toEqual({ path: "/c", canBack: true, canForward: false });
  });

  it("runs shared mutations against the injected adapter and reloads", async () => {
    const { api, calls } = adapter();
    const after = vi.fn();
    const ops = createFileOperations({ adapter: api, getPath: () => "/", getTaken: () => new Set(["a"]), getClipboard: () => null, setClipboard: () => {}, afterMutation: after });
    expect(await ops.mkdir("folder")).toBe("folder");
    await ops.move(["a"], "/dest");
    await ops.trash(["a"]);
    expect(calls).toContain("mkdir:/folder");
    expect(calls).toContain("move:/a->/dest/a");
    expect(calls).toContain(`move:/a->${TRASH_PATH}/a`);
    expect(after).toHaveBeenCalledTimes(3);
  });

  it("blocks writes in readonly mode with a notice", async () => {
    const { api, calls } = adapter("readonly");
    const notice = vi.fn();
    const ops = createFileOperations({ adapter: api, getPath: () => "/", getTaken: () => new Set(), getClipboard: () => null, setClipboard: () => {}, onNotice: notice });
    expect(await ops.mkdir("x")).toBeNull();
    expect(calls).toEqual([]);
    expect(notice).toHaveBeenCalledWith("This backend is read-only");
  });
});
