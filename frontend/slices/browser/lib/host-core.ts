import { createDemoBrowser } from "./demo-browser";

export type BrowserMode = { live: boolean; demo: boolean };
export type RemoteState = { url: string; title: string };
export type AgentLogEntry = { ts?: string; action: string; actor?: string; target?: string };

export type BrowserAdapter = {
  state: (tab: string) => Promise<RemoteState>;
  screenshot: (tab: string) => Promise<Blob | null>;
  act: (path: string, body: unknown, tab: string) => Promise<Partial<RemoteState>>;
  close: (tab: string) => Promise<void>;
  agentLog: () => Promise<AgentLogEntry[]>;
  saveShot: (tab: string) => Promise<{ path?: string; error?: string }>;
};

let modeSource: () => BrowserMode = () => ({ live: true, demo: true });
let adapter: BrowserAdapter | null = null;
let screencastUrl: (tab: string) => string | null = () => null;
let revision = 0;
const subs = new Set<() => void>();

function notify(): void {
  revision += 1;
  subs.forEach((fn) => fn());
}

function demo(): BrowserAdapter {
  if (!adapter) adapter = createDemoBrowser();
  return adapter;
}

export function configureBrowserMode(source: () => BrowserMode): void {
  modeSource = source;
  notify();
}

export function getBrowserMode(): BrowserMode {
  return modeSource();
}

export function configureBrowser(
  next: Pick<BrowserAdapter, "state" | "screenshot" | "act"> & Partial<BrowserAdapter>,
): void {
  const fallback = createDemoBrowser();
  adapter = { ...fallback, ...next };
  notify();
}

export const browserApi: BrowserAdapter = {
  state: (tab) => demo().state(tab),
  screenshot: (tab) => demo().screenshot(tab),
  act: (path, body, tab) => demo().act(path, body, tab),
  close: (tab) => demo().close(tab),
  agentLog: () => demo().agentLog(),
  saveShot: (tab) => demo().saveShot(tab),
};

export function configureScreencast(fn: (tab: string) => string | null): void {
  screencastUrl = fn;
  notify();
}

export function streamUrl(tab: string): string | null {
  return screencastUrl(tab);
}

export function subscribeBrowserConfig(fn: () => void): () => void {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function getBrowserConfigRevision(): number {
  return revision;
}
