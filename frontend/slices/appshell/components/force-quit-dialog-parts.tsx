"use client";
/* Per-OS chrome for force-quit-dialog.tsx (P5 critic: "shadcn card in every
   shell" — companion split, same directory, 200-LOC gate). Panel geometry,
   header alignment and the Done/Force Quit footer branch on
   document.documentElement.dataset.shell — the same read-at-render pattern
   context-menu.tsx uses. No dialog logic lives here, only chrome. Force Quit
   has no single app icon to enlarge (it lists many), so the macOS "big icon
   on top" alert detail is skipped here on purpose — its "full-width stacked
   buttons" detail still applies. */
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ShellKind = "ios" | "macos" | "windows" | "android" | "default";
export function shellKind(): ShellKind {
  const s = document.documentElement.dataset.shell;
  return s === "ios" || s === "macos" || s === "windows" || s === "android" ? s : "default";
}

// iOS/macOS/Windows reuse the shell's own window-radius token; Android's M3
// dialog shape (28px) is its own scale (see sign-in-dialog-chrome.tsx for the
// same reasoning). Default keeps the original .glass + --glass-menu look.
export const PANEL_CLASS: Record<ShellKind, string> = {
  ios: "w-[270px] overflow-hidden rounded-[var(--radius-win)] border border-black/10 bg-popover/75 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 outline-none dark:border-white/15 dark:bg-popover/70",
  macos: "w-full max-w-sm overflow-hidden rounded-[var(--radius-win)] border border-border bg-card shadow-2xl outline-none",
  windows: "w-full max-w-sm overflow-hidden rounded-[var(--radius-win)] border border-border bg-card shadow-2xl outline-none",
  android: "w-full max-w-sm overflow-hidden rounded-[28px] border-0 bg-[var(--m3-surface-container)] shadow-2xl outline-none",
  default: "glass w-full max-w-sm overflow-hidden rounded-xl border border-border shadow-2xl outline-none",
};

export function PanelHeader({ kind }: { kind: ShellKind }) {
  return (
    <div className={cn("border-b border-border px-4 py-3", kind === "ios" && "text-center")}>
      <p className="text-sm font-semibold">Force Quit Applications</p>
      <p className="mt-1 text-xs text-muted-foreground">
        If an app doesn’t respond, select it and click Force Quit.
      </p>
    </div>
  );
}

type FooterAction = { label: string; onClick: () => void; disabled?: boolean };

// The Done / Force Quit row is the most OS-specific chrome here: iOS stacks
// full-width rows separated by a hairline with Force Quit in red, Windows
// pins a darker footer band with an accent-filled primary (Force Quit) beside
// an outline secondary (Done), Android uses right-aligned flat text buttons
// (M3's signature — no filled backgrounds), macOS stacks full-width buttons.
// Dashboard/unset keeps the exact original ghost+destructive row.
export function PanelFooter({ kind, done, forceQuit }: { kind: ShellKind; done: FooterAction; forceQuit: FooterAction }) {
  if (kind === "ios") {
    return (
      <div className="border-t border-black/10 dark:border-white/15">
        {[done, forceQuit].map((a, i) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            disabled={a.disabled}
            className={cn(
              "block w-full px-4 py-3 text-center text-[15px] disabled:opacity-40",
              i > 0 && "border-t border-black/10 dark:border-white/15",
              a === forceQuit ? "font-semibold text-destructive" : "text-[var(--os-accent)]",
            )}
          >
            {a.label}
          </button>
        ))}
      </div>
    );
  }
  if (kind === "windows") {
    return (
      <div className="flex items-center justify-end gap-2 border-t border-border bg-black/[0.035] px-3 py-2.5 dark:bg-white/[0.05]">
        <Button type="button" variant="outline" size="sm" onClick={done.onClick} disabled={done.disabled}>
          {done.label}
        </Button>
        <Button type="button" size="sm" onClick={forceQuit.onClick} disabled={forceQuit.disabled}>
          {forceQuit.label}
        </Button>
      </div>
    );
  }
  if (kind === "android") {
    return (
      <div className="flex items-center justify-end gap-1 px-3 py-2.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={done.onClick}
          disabled={done.disabled}
          className="rounded-full px-3 font-medium text-[var(--os-accent)] hover:bg-[var(--os-accent)]/10"
        >
          {done.label}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={forceQuit.onClick}
          disabled={forceQuit.disabled}
          className="rounded-full px-3 font-medium text-destructive hover:bg-destructive/10"
        >
          {forceQuit.label}
        </Button>
      </div>
    );
  }
  if (kind === "macos") {
    return (
      <div className="flex flex-col gap-2 border-t border-border px-3 py-2.5">
        <Button type="button" variant="destructive" className="w-full" onClick={forceQuit.onClick} disabled={forceQuit.disabled}>
          {forceQuit.label}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={done.onClick} disabled={done.disabled}>
          {done.label}
        </Button>
      </div>
    );
  }
  return (
    <div className="flex justify-end gap-2 border-t border-border px-3 py-2.5">
      <Button type="button" variant="ghost" size="sm" onClick={done.onClick} disabled={done.disabled}>
        {done.label}
      </Button>
      <Button type="button" variant="destructive" size="sm" onClick={forceQuit.onClick} disabled={forceQuit.disabled}>
        {forceQuit.label}
      </Button>
    </div>
  );
}
