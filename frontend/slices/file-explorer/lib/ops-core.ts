import type { FileExplorerAdapter, UploadFile } from "../adapter/types";
import { joinPath, uniqueName } from "./format";
import type { Clipboard } from "./types";

export const TRASH_PATH = "/.Trash";
export const READ_ONLY_NOTICE = "This backend is read-only";

export type FileOpsContext = {
  adapter: FileExplorerAdapter;
  getPath: () => string;
  getTaken: () => Set<string>;
  getClipboard: () => Clipboard | null;
  setClipboard: (value: Clipboard | null) => void;
  afterMutation?: () => void | Promise<void>;
  onNotice?: (message: string) => void;
};

export function createFileOperations(ctx: FileOpsContext) {
  const guard = async (run: () => Promise<unknown>) => {
    if (ctx.adapter.mode === "readonly") {
      ctx.onNotice?.(READ_ONLY_NOTICE);
      return false;
    }
    try {
      await run();
      await ctx.afterMutation?.();
      return true;
    } catch (error) {
      ctx.onNotice?.(error instanceof Error ? error.message : String(error));
      return false;
    }
  };
  const mkdir = async (name = "untitled folder") => {
    const finalName = uniqueName(ctx.getTaken(), name);
    const ok = await guard(() => ctx.adapter.mkdir(joinPath(ctx.getPath(), finalName)));
    return ok ? finalName : null;
  };
  const upload = (files: UploadFile[], dest = ctx.getPath()) =>
    guard(() => ctx.adapter.upload(dest, files));
  const move = (names: string[], dest: string) => guard(async () => {
    const current = ctx.getPath();
    if (dest === current) return;
    const list = await ctx.adapter.list(dest);
    const seen = new Set(list.entries.map((entry) => entry.name));
    for (const name of names) {
      const next = uniqueName(seen, name);
      seen.add(next);
      await ctx.adapter.move(joinPath(current, name), joinPath(dest, next));
    }
  });
  const trash = (names: string[]) => guard(async () => {
    const list = await ctx.adapter.list(TRASH_PATH).catch(() => ({ entries: [] }));
    const seen = new Set(list.entries.map((entry) => entry.name));
    for (const name of names) {
      const next = uniqueName(seen, name);
      seen.add(next);
      await ctx.adapter.move(joinPath(ctx.getPath(), name), joinPath(TRASH_PATH, next));
    }
  });
  const emptyTrash = () => guard(async () => {
    const list = await ctx.adapter.list(TRASH_PATH).catch(() => ({ entries: [] }));
    await Promise.all(list.entries.map((entry) => ctx.adapter.remove(joinPath(TRASH_PATH, entry.name))));
  });
  const rename = (from: string, to: string) =>
    guard(() => ctx.adapter.move(joinPath(ctx.getPath(), from), joinPath(ctx.getPath(), to)));
  const remove = (names: string[]) =>
    guard(() => Promise.all(names.map((name) => ctx.adapter.remove(joinPath(ctx.getPath(), name)))));
  const paste = () => {
    const clip = ctx.getClipboard();
    if (!clip) return Promise.resolve(false);
    return guard(async () => {
      const op = clip.mode === "cut" ? ctx.adapter.move : ctx.adapter.copy;
      const taken = ctx.getTaken();
      for (const name of clip.names) {
        await op(joinPath(clip.from, name), joinPath(ctx.getPath(), uniqueName(taken, name)));
      }
      ctx.setClipboard(null);
    });
  };
  return { mkdir, upload, move, trash, emptyTrash, rename, remove, paste };
}
