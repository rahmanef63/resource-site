import type { AppDescriptor, ShellManifest } from "../types";
export const APPSHELL_CONTEXT = Symbol("appshell-svelte");
export type AppShellContext = { apps: AppDescriptor[]; manifest: ShellManifest };
