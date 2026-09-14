import { getCodeFs, type CodeFsAdapter } from "./fs-core";
import { SEED_FILES } from "./seed";
import { baseName, joinPath } from "./util";

export type SaveState = "idle" | "saved" | "error";

export type EditorSnapshot = {
  disk: Record<string, string>;
  buffers: Record<string, string>;
  tabs: string[];
  active: string | null;
  saveState: SaveState;
};

export type EditorCore = {
  getSnapshot: () => EditorSnapshot;
  subscribe: (listener: () => void) => () => void;
  open: (path: string) => void;
  openPath: (path: string) => void;
  close: (path: string) => void;
  edit: (value: string) => void;
  create: (dir: string, name: string) => void;
  save: (path?: string | null) => Promise<void>;
  setActive: (path: string) => void;
};

export type CodeEditorContext = {
  readonly tabs: string[];
  readonly active: string | null;
  readonly value: string;
  readonly dirty: boolean;
  readonly saveState: SaveState;
  readonly buffers: Record<string, string>;
  readonly disk: Record<string, string>;
  open: (path: string) => void;
  openPath: (path: string) => void;
  close: (path: string) => void;
  edit: (value: string) => void;
  create: (dir: string, name: string) => void;
  save: (path?: string | null) => Promise<void>;
  setActive: (path: string) => void;
  label: (path: string) => string;
};

export function createEditorCore(fs: CodeFsAdapter = getCodeFs()): EditorCore {
  let state: EditorSnapshot = {
    disk: { ...SEED_FILES },
    buffers: {},
    tabs: [],
    active: null,
    saveState: "idle",
  };
  const listeners = new Set<() => void>();
  const set = (patch: Partial<EditorSnapshot>) => {
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
  };

  const open = (path: string) => {
    const tabs = state.tabs.includes(path) ? state.tabs : [...state.tabs, path];
    const buffers = path in state.buffers
      ? state.buffers
      : { ...state.buffers, [path]: state.disk[path] ?? SEED_FILES[path] ?? "" };
    set({ tabs, active: path, buffers });
    void fs.read(path).then((content) => {
      if (typeof content !== "string" || !content.length) return;
      const nextBuffers = state.buffers[path]
        ? state.buffers
        : { ...state.buffers, [path]: content };
      set({ disk: { ...state.disk, [path]: content }, buffers: nextBuffers });
    }).catch(() => {});
  };

  const openPath = (path: string) => {
    const tabs = state.tabs.includes(path) ? state.tabs : [...state.tabs, path];
    const buffers = path in state.buffers
      ? state.buffers
      : { ...state.buffers, [path]: state.disk[path] ?? "" };
    set({ tabs, active: path, buffers });
    void fs.read(path).then((content) => {
      if (typeof content !== "string") return;
      set({
        disk: { ...state.disk, [path]: content },
        buffers: { ...state.buffers, [path]: content },
        saveState: "idle",
      });
    }).catch(() => set({ saveState: "error" }));
  };

  const close = (path: string) => {
    const index = state.tabs.indexOf(path);
    const tabs = state.tabs.filter((item) => item !== path);
    const active = state.active === path
      ? (tabs[index] ?? tabs[index - 1] ?? null)
      : state.active;
    set({ tabs, active });
  };

  const edit = (value: string) => {
    if (state.active == null) return;
    set({ buffers: { ...state.buffers, [state.active]: value }, saveState: "idle" });
  };

  const core: EditorCore = {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    open,
    openPath,
    close,
    edit,
    create(dir, name) {
      const path = joinPath(dir, name.trim());
      if (!(path in state.disk)) set({ disk: { ...state.disk, [path]: "" } });
      open(path);
    },
    async save(path = state.active) {
      if (path == null) return;
      const value = state.buffers[path] ?? "";
      set({ disk: { ...state.disk, [path]: value } });
      try {
        await fs.write(path, value);
        set({ saveState: "saved" });
      } catch {
        set({ saveState: "error" });
      }
    },
    setActive(path) {
      if (state.tabs.includes(path)) set({ active: path });
    },
  };
  return core;
}

export function createEditorContext(core: EditorCore): CodeEditorContext {
  return {
    get tabs() { return core.getSnapshot().tabs; },
    get active() { return core.getSnapshot().active; },
    get value() {
      const { active, buffers } = core.getSnapshot();
      return active == null ? "" : (buffers[active] ?? "");
    },
    get dirty() {
      const { active, buffers, disk } = core.getSnapshot();
      return active != null && buffers[active] !== disk[active];
    },
    get saveState() { return core.getSnapshot().saveState; },
    get buffers() { return core.getSnapshot().buffers; },
    get disk() { return core.getSnapshot().disk; },
    open: core.open,
    openPath: core.openPath,
    close: core.close,
    edit: core.edit,
    create: core.create,
    save: core.save,
    setActive: core.setActive,
    label: baseName,
  };
}
