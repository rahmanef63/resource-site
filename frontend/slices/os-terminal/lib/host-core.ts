import { createMockOsApi } from "./host-mock";

export type FsEntry = {
  name: string;
  kind: "dir" | "file";
  size?: number;
  ext?: string;
};

export type FsList = { path: string; entries: FsEntry[] };
export type ExecResult = { stdout: string; stderr: string; code: number };
export type SysStats = {
  cpu: { pct: number; cores: number };
  mem: { used: number; total: number };
  disk: { used: number; total: number };
  uptime: number;
};

export type TerminalOsApi = {
  mode: "mock" | "live";
  fs: {
    list: (path: string) => Promise<FsList>;
    read: (path: string) => Promise<string>;
    write: (path: string, content: string) => Promise<unknown>;
    mkdir: (path: string) => Promise<unknown>;
    remove: (path: string) => Promise<unknown>;
    move: (from: string, to: string) => Promise<unknown>;
    copy: (from: string, to: string) => Promise<unknown>;
  };
  exec: { run: (cmd: string, cwd?: string) => Promise<ExecResult> };
  sys: { stats: () => Promise<SysStats> };
};

const GiB = 1024 ** 3;

export function fmtGiBPair(used: number, total: number): string {
  return `${(used / GiB).toFixed(1)} / ${(total / GiB).toFixed(0)} GB`;
}

export function fmtUptime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

let adapter: TerminalOsApi | null = null;
const listeners = new Set<() => void>();
const current = (): TerminalOsApi => (adapter ??= createMockOsApi());

export function configureTerminal(next: TerminalOsApi): void {
  adapter = next;
  listeners.forEach((listener) => listener());
}

export function subscribeTerminal(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTerminalMode(): TerminalOsApi["mode"] {
  return current().mode;
}

const api: TerminalOsApi = {
  get mode() {
    return current().mode;
  },
  fs: {
    list: (path) => current().fs.list(path),
    read: (path) => current().fs.read(path),
    write: (path, content) => current().fs.write(path, content),
    mkdir: (path) => current().fs.mkdir(path),
    remove: (path) => current().fs.remove(path),
    move: (from, to) => current().fs.move(from, to),
    copy: (from, to) => current().fs.copy(from, to),
  },
  exec: { run: (cmd, cwd) => current().exec.run(cmd, cwd) },
  sys: { stats: () => current().sys.stats() },
};

export function getOsApi(): TerminalOsApi {
  return api;
}
