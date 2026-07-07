"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useApps } from "../lib/registry";
import { useWindowOrder } from "../hooks/use-shell";
import { shellStore, closeWindow } from "../lib/store";
import { AppIcon } from "./app-icon";
import { PANEL_CLASS, PanelFooter, PanelHeader, shellKind } from "./force-quit-dialog-parts";
import type { AppDescriptor, WinId } from "../lib/types";

// macOS "Force Quit Applications" panel (⌥⌘Esc). Lists every open window; pick
// one and Force Quit closes it. A web OS has no frozen processes to reap, so
// Force Quit === closeWindow — honest local state, not a fake kill switch.
// ponytail: no "(not responding)" detection — a web window can't hang, so every
// row is shown live rather than faking a stuck state.
//
// Per-OS system-dialog anatomy (P5 critic: "shadcn card in every shell"): the
// panel's geometry, header alignment and Done/Force Quit footer branch on
// document.documentElement.dataset.shell (force-quit-dialog-parts.tsx) — same
// read-at-render pattern context-menu.tsx uses. List/selection/keyboard
// behavior below is unchanged; only chrome varies.
export function ForceQuitDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Mounts per open so selection resets without a reset effect (like Spotlight).
  return open ? <ForceQuitPanel onClose={onClose} /> : null;
}

type Row = { id: WinId; title: string; app?: AppDescriptor };

function ForceQuitPanel({ onClose }: { onClose: () => void }) {
  const apps = useApps();
  const order = useWindowOrder();
  const [sel, setSel] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog on open (so a background Spotlight/menu-bar stops
  // receiving the same keydowns) and restore it to the opener on close.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => panelRef.current?.focus());
    return () => { cancelAnimationFrame(id); prev?.focus(); };
  }, []);

  const rows = useMemo<Row[]>(
    () =>
      order.map((id) => {
        const win = shellStore.getWindow(id);
        const app = apps.find((a) => a.id === win?.app);
        return { id, title: win?.title || app?.title || "Untitled", app };
      }),
    [order, apps],
  );

  // Clamp the selection in render as the list shrinks — no clamp effect.
  const selIdx = Math.min(sel, Math.max(0, rows.length - 1));

  // Escape closes; arrows move; Enter force-quits the highlighted window.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((s) => (rows.length ? (s + 1) % rows.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((s) => (rows.length ? (s - 1 + rows.length) % rows.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const r = rows[selIdx];
        if (r) closeWindow(r.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rows, selIdx, onClose]);

  const kind = shellKind();

  return (
    <div
      className="absolute inset-0 z-[9100] flex items-start justify-center bg-black/25 pt-[16vh]"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Force Quit Applications"
        className={PANEL_CLASS[kind]}
        style={kind === "default" ? { background: "var(--glass-menu)" } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <PanelHeader kind={kind} />

        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No applications to force quit.
          </p>
        ) : (
          <ul role="listbox" aria-label="Open windows" className="max-h-64 overflow-y-auto p-1.5">
            {rows.map((r, i) => (
              <li key={r.id} role="option" aria-selected={i === selIdx}>
                <button
                  type="button"
                  onMouseMove={() => setSel(i)}
                  onClick={() => setSel(i)}
                  onDoubleClick={() => closeWindow(r.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm",
                    i === selIdx ? "bg-primary/15 text-foreground" : "text-foreground/85",
                  )}
                >
                  <span className="grid size-5 shrink-0">{r.app ? <AppIcon app={r.app} /> : null}</span>
                  <span className="flex-1 truncate">{r.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <PanelFooter
          kind={kind}
          done={{ label: "Done", onClick: onClose }}
          forceQuit={{
            label: "Force Quit",
            disabled: rows.length === 0,
            onClick: () => {
              const r = rows[selIdx];
              if (r) closeWindow(r.id);
            },
          }}
        />
      </div>
    </div>
  );
}
