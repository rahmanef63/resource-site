export type ExecResult = { stdout: string; stderr: string; code: number };
export type AppStoreExec = {
  mode: "mock" | "live";
  exec: { run: (cmd: string, cwd?: string) => Promise<ExecResult> };
};

let adapter: AppStoreExec = {
  mode: "mock",
  exec: {
    run: async (cmd) => ({
      stdout: `demo exec — would run: ${cmd}\nWire configureAppStoreExec({ mode:"live", exec }) to hit a real shell.`,
      stderr: "",
      code: 0,
    }),
  },
};
let revision = 0;
const subs = new Set<() => void>();

export function configureAppStoreExec(next: AppStoreExec): void {
  adapter = next;
  revision += 1;
  subs.forEach((fn) => fn());
}

export function subscribeAppStoreExec(cb: () => void): () => void {
  subs.add(cb);
  return () => subs.delete(cb);
}

export function getAppStoreExecRevision(): number {
  return revision;
}

export const appStoreExecApi = {
  get mode(): AppStoreExec["mode"] {
    return adapter.mode;
  },
  exec: { run: (cmd: string, cwd?: string) => adapter.exec.run(cmd, cwd) },
};
