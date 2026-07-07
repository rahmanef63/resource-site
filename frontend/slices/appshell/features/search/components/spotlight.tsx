"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass as Search } from "@phosphor-icons/react";
import {
  useApps,
  useCommands,
  useSpotlightOpen,
  useShellAppearance,
  useShellSearch,
  openWindow,
  setSpotlightOpen,
  setLauncherOpen,
  minimizeAll,
  closeAll,
  toast,
  type SearchHit,
} from "@/features/appshell";

import { matches, type Command } from "../lib";
import { evaluate } from "../lib/calc";
import { convert } from "../lib/convert";
import { SpotlightRow } from "./spotlight-parts";

// The panel MOUNTS per open (and unmounts on close), so query/selection state
// starts fresh every time without effect-driven resets (set-state-in-effect).
export function Spotlight() {
  const open = useSpotlightOpen();
  return open ? <SpotlightPanel /> : null;
}

function SpotlightPanel() {
  const apps = useApps();
  const dynamic = useCommands();
  const search = useShellSearch();
  const { theme, setTheme } = useShellAppearance();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced folder search under ~/projects (live) — opens Files at the hit.
  // Results are state, but "no query → no hits" is derived below (stale hits
  // stay visible during the debounce, matching the old behaviour).
  const [found, setFound] = useState<{ key: string; hits: SearchHit[] } | null>(null);
  const folderHits = useMemo(() => (q.trim() ? (found?.hits ?? []) : []), [q, found]);
  useEffect(() => {
    const query = q.trim();
    if (!query) return;
    let alive = true;
    const t = setTimeout(() => {
      search(query)
        .then((h) => alive && setFound({ key: query, hits: h }))
        .catch(() => alive && setFound({ key: query, hits: [] }));
    }, 150);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, search]);

  const commands = useMemo<Command[]>(() => {
    const appCmds: Command[] = apps.map((app) => ({
      id: `open:${app.id}`,
      label: app.title,
      hint: "App",
      app,
      run: () => openWindow(app.id, app.title, app.defaultSize, undefined, { multi: app.multi }),
    }));
    const actions: Command[] = [
      { id: "launchpad", label: "Open Launchpad", hint: "Action", run: () => setLauncherOpen(true) },
      { id: "minimize-all", label: "Minimize all windows", hint: "Action", run: minimizeAll },
      { id: "close-all", label: "Close all windows", hint: "Action", run: closeAll },
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        hint: "Action",
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
    ];
    // Registry-contributed commands (apps/features/shells register at runtime).
    const registered: Command[] = dynamic.map((c) => ({
      id: c.id,
      label: c.label,
      hint: c.hint ?? "Action",
      keywords: c.keywords,
      run: c.run,
    }));
    return [...appCmds, ...actions, ...registered];
  }, [apps, theme, setTheme, dynamic]);

  const results = useMemo(() => {
    const base = commands.filter((c) => matches(q, c.keywords ? `${c.label} ${c.keywords}` : c.label));
    const folderCmds: Command[] = folderHits.map((h) => ({ id: h.id, label: h.label, hint: h.hint ?? "Folder", run: h.run }));
    const ans = evaluate(q.trim()); // arithmetic query → synthetic "= <answer>" row on top; runAt's toast confirms it
    const calcCmds: Command[] = ans === null ? [] : [{ id: "calc", label: `= ${ans}`, hint: "Result", run: () => void navigator.clipboard?.writeText(String(ans)) }];
    const conv = convert(q.trim()); // unit query ("10 km to mi") → synthetic "= <result> <unit>" row, same pattern as calc
    const convCmds: Command[] = conv === null ? [] : [{ id: "convert", label: `= ${conv}`, hint: "Convert", run: () => void navigator.clipboard?.writeText(conv) }];
    // Web fallback pinned LAST (like macOS Spotlight) so a query never dead-ends —
    // opens a REAL search tab (the in-OS browser app is a mock, so don't route through it).
    const query = q.trim();
    const webCmds: Command[] = query
      ? [{ id: "web", label: `Search the web for “${query}”`, hint: "Web", run: () => window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer") }]
      : [];
    return [...convCmds, ...calcCmds, ...base, ...folderCmds, ...webCmds];
  }, [commands, q, folderHits]);

  // Focus after the open transition paints (mount = open); restore focus to the
  // element that opened Spotlight on close (cleanup runs on unmount = close).
  const prevFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      prevFocusRef.current?.focus();
    };
  }, []);

  // Clamp the selection in render when results shrink — no clamp effect.
  const selIdx = Math.min(sel, Math.max(0, results.length - 1));

  const close = () => setSpotlightOpen(false);
  const runAt = (i: number) => {
    const cmd = results[i];
    if (!cmd) return;
    cmd.run();
    toast(cmd.app ? `Opened ${cmd.label}` : cmd.label);
    close();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => (s + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => (s - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(selIdx);
    }
  };

  // Stable ids so the input can point aria-activedescendant at the active option.
  const listId = "spotlight-results";
  const activeId = results.length > 0 ? `spotlight-option-${selIdx}` : undefined;

  return (
    <div
      className="absolute inset-0 z-[9000] flex items-start justify-center bg-transparent pt-[18vh]"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight search"
        className="glass w-full max-w-[680px] overflow-hidden rounded-2xl border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-3">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search apps, folders, actions…"
            aria-label="Spotlight search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={activeId}
            className="w-full bg-transparent text-[22px] font-normal outline-none placeholder:text-muted-foreground"
          />
        </div>
        {results.length > 0 && (
          <ul id={listId} role="listbox" className="max-h-80 overflow-y-auto border-t border-border p-2">
            {results.map((c, i) => (
              <SpotlightRow
                key={c.id}
                cmd={c}
                index={i}
                selected={i === selIdx}
                onHover={() => setSel(i)}
                onRun={() => runAt(i)}
              />
            ))}
          </ul>
        )}
        {results.length === 0 && (
          <p className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
            No matches for “{q}”.
          </p>
        )}
      </div>
    </div>
  );
}
