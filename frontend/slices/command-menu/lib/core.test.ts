import { describe, expect, it, vi } from "vitest";
import {
  filterCommandGroups,
  isCommandMenuHotkey,
  runCommandSelection,
  searchView,
  visibleCommandGroups,
  type CommandGroupBase,
} from "./core";

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => { data.delete(key); },
    setItem: (key, value) => { data.set(key, value); },
  };
}

const groups: CommandGroupBase[] = [
  { id: "recent", heading: "Recent", hideOnQuery: true, items: [{ id: "r", value: "recent roadmap", label: "Roadmap", onSelect() {} }] },
  { id: "search", heading: "Search", showOnQueryOnly: true, items: [{ id: "s", value: "settings preferences", label: "Settings", onSelect() {} }] },
  { id: "empty", heading: "Empty", items: [] },
];

describe("command-menu portable core", () => {
  it("keeps hotkey + group visibility/filter semantics outside React", () => {
    expect(isCommandMenuHotkey({ key: "K", metaKey: true })).toBe(true);
    expect(isCommandMenuHotkey({ key: "k" })).toBe(false);
    expect(visibleCommandGroups(groups, "").map((g) => g.id)).toEqual(["recent"]);
    expect(visibleCommandGroups(groups, "set").map((g) => g.id)).toEqual(["search"]);
    expect(filterCommandGroups(groups, "pref")[0]?.items[0]?.label).toBe("Settings");
  });

  it("closes, persists tracked MRU, and then runs the selected command", async () => {
    const storage = memoryStorage();
    const close = vi.fn();
    const run = vi.fn();
    const history = await runCommandSelection(
      { id: "new", value: "new", label: "New", track: { id: "new", label: "New" }, onSelect: run },
      { close, storage },
    );
    expect(close).toHaveBeenCalledOnce();
    expect(run).toHaveBeenCalledOnce();
    expect(history).toEqual([{ id: "new", label: "New" }]);
  });

  it("derives recent and empty/no-results search states consistently", () => {
    const base = {
      isLoading: false,
      pages: [],
      databases: [],
      recents: Array.from({ length: 7 }, (_, i) => ({ id: String(i), title: `Recent ${i}` })),
      onQueryChange() {},
      onSelectPage() {},
      onSelectDatabase() {},
    };
    expect(searchView("", base).recent).toHaveLength(5);
    expect(searchView("missing", base).showNoResults).toBe(true);
  });
});
