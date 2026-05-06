/**
 * KanbanBlock persistence tests — pure logic, no React rendering.
 * Tests the localStorage load/save/reset behavior in isolation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ─── Minimal re-implementation of useKanbanPersistence for unit testing ───────
// We test the persistence logic directly without mounting the component.

type KanbanItem = { id: string; title: string };
type KanbanColumn = { id: string; title: string; items: KanbanItem[] };

function loadFromStorage(key: string, fallback: KanbanColumn[]): KanbanColumn[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as KanbanColumn[];
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage(key: string, columns: KanbanColumn[]): void {
  try { localStorage.setItem(key, JSON.stringify(columns)); } catch { /* quota errors */ }
}

function resetStorage(key: string): void {
  localStorage.removeItem(key);
}

// ─── Test setup ───────────────────────────────────────────────────────────────

const TEST_KEY = "test-kanban-board";

const INITIAL_COLS: KanbanColumn[] = [
  { id: "todo", title: "To Do", items: [{ id: "t1", title: "Task 1" }] },
  { id: "done", title: "Done", items: [] },
];

let localStorageMock: Record<string, string> = {};

beforeEach(() => {
  localStorageMock = {};
  const storageMock = {
    getItem: (k: string) => localStorageMock[k] ?? null,
    setItem: (k: string, v: string) => { localStorageMock[k] = v; },
    removeItem: (k: string) => { delete localStorageMock[k]; },
    clear: () => { localStorageMock = {}; },
  };
  Object.defineProperty(globalThis, "localStorage", { value: storageMock, writable: true });
});

afterEach(() => {
  resetStorage(TEST_KEY);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("KanbanBlock — localStorage persistence logic", () => {
  it("loads initial columns when no persisted state exists", () => {
    const cols = loadFromStorage(TEST_KEY, INITIAL_COLS);
    expect(cols).toEqual(INITIAL_COLS);
  });

  it("saves and reloads columns across sessions", () => {
    const updated: KanbanColumn[] = [
      { id: "todo", title: "To Do", items: [{ id: "t1", title: "Task 1" }, { id: "t2", title: "Task 2" }] },
      { id: "done", title: "Done", items: [{ id: "t3", title: "Moved task" }] },
    ];
    saveToStorage(TEST_KEY, updated);
    const reloaded = loadFromStorage(TEST_KEY, INITIAL_COLS);
    expect(reloaded).toEqual(updated);
    expect(reloaded[0].items).toHaveLength(2);
    expect(reloaded[1].items[0].title).toBe("Moved task");
  });

  it("falls back to initial columns after reset", () => {
    saveToStorage(TEST_KEY, [{ id: "custom", title: "Custom", items: [] }]);
    resetStorage(TEST_KEY);
    const cols = loadFromStorage(TEST_KEY, INITIAL_COLS);
    expect(cols).toEqual(INITIAL_COLS);
  });

  it("returns initial when localStorage has invalid JSON", () => {
    localStorageMock[TEST_KEY] = "not valid json {{";
    const cols = loadFromStorage(TEST_KEY, INITIAL_COLS);
    expect(cols).toEqual(INITIAL_COLS);
  });

  it("returns initial when localStorage value is not an array", () => {
    localStorageMock[TEST_KEY] = JSON.stringify({ not: "an array" });
    const cols = loadFromStorage(TEST_KEY, INITIAL_COLS);
    expect(cols).toEqual(INITIAL_COLS);
  });

  it("persists cross-column move correctly", () => {
    // Simulate moving t1 from todo to done
    const initial: KanbanColumn[] = [
      { id: "todo", title: "To Do", items: [{ id: "t1", title: "Task 1" }] },
      { id: "done", title: "Done", items: [] },
    ];
    const afterMove: KanbanColumn[] = [
      { id: "todo", title: "To Do", items: [] },
      { id: "done", title: "Done", items: [{ id: "t1", title: "Task 1" }] },
    ];
    saveToStorage(TEST_KEY, afterMove);
    const reloaded = loadFromStorage(TEST_KEY, initial);
    expect(reloaded[0].items).toHaveLength(0);
    expect(reloaded[1].items[0].id).toBe("t1");
  });

  it("persists reorder within column correctly", () => {
    const initial: KanbanColumn[] = [
      {
        id: "todo", title: "To Do",
        items: [{ id: "t1", title: "Task 1" }, { id: "t2", title: "Task 2" }, { id: "t3", title: "Task 3" }],
      },
    ];
    const reordered: KanbanColumn[] = [
      {
        id: "todo", title: "To Do",
        // Moved t3 to position 0
        items: [{ id: "t3", title: "Task 3" }, { id: "t1", title: "Task 1" }, { id: "t2", title: "Task 2" }],
      },
    ];
    saveToStorage(TEST_KEY, reordered);
    const reloaded = loadFromStorage(TEST_KEY, initial);
    expect(reloaded[0].items[0].id).toBe("t3");
    expect(reloaded[0].items[1].id).toBe("t1");
    expect(reloaded[0].items[2].id).toBe("t2");
  });

  it("does not throw when localStorage throws (quota error)", () => {
    const throwingStorage = {
      getItem: (_k: string) => null,
      setItem: (_k: string, _v: string) => { throw new Error("QuotaExceededError"); },
      removeItem: (_k: string) => {},
    };
    Object.defineProperty(globalThis, "localStorage", { value: throwingStorage, writable: true });
    expect(() => saveToStorage(TEST_KEY, INITIAL_COLS)).not.toThrow();
  });
});
