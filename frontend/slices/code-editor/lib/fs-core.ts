import { createMockFs } from "./mock-fs";

export type FsEntry = { name: string; kind: "dir" | "file"; size?: number };
export type FsList = { path: string; entries: FsEntry[] };

export type CodeFsAdapter = {
  list: (path: string) => Promise<FsList>;
  read: (path: string) => Promise<string>;
  write: (path: string, content: string) => Promise<unknown>;
  mkdir: (path: string) => Promise<unknown>;
};

let adapter: CodeFsAdapter = createMockFs();

export function configureCodeFs(next: CodeFsAdapter): void {
  adapter = next;
}

// Stable delegating object: consumers may keep this in reactive deps while
// configureCodeFs() swaps the actual host implementation underneath it.
const fs: CodeFsAdapter = {
  list: (path) => adapter.list(path),
  read: (path) => adapter.read(path),
  write: (path, content) => adapter.write(path, content),
  mkdir: (path) => adapter.mkdir(path),
};

export function getCodeFs(): CodeFsAdapter {
  return fs;
}
