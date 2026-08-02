"use client";
import { useMemo } from "react";
import { useApps } from "../lib/registry";
import { openWindow } from "../lib/store";
import type { AppDescriptor } from "../lib/types";
import type { WidgetOption, WidgetSize } from "../lib/widget-types";
import { WIDGET_DIMS } from "../lib/widget-types";

// Widget registry — aggregates every app's optional `widgets` manifest from the
// app registry (useApps) into a flat, dynamic list. Add a widget = add an option
// to an AppDescriptor; it appears on every surface with no extra wiring.

export type RegisteredWidget = { appId: string; app: AppDescriptor; option: WidgetOption; synthesized: boolean };

// Apps that never get a synthesized default widget (internal/launcher-only).
const NO_DEFAULT = new Set<string>();

/** The generic "app tile" widget every dockable app gets for free (DRY): icon +
 *  name (+ description at medium/large) and tap-to-open. Apps override by
 *  declaring their own `widgets`. */
function AppTile({ app, size, openApp }: { app: AppDescriptor; size: WidgetSize; openApp: (id: string, p?: unknown) => void }) {
  const Icon = app.icon;
  return (
    <button onClick={() => openApp(app.id)} className="flex size-full flex-col items-start gap-2 p-4 text-left transition-colors hover:bg-white/5">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl text-white shadow" style={{ background: app.gradient }}>
        <Icon className="size-6" />
      </span>
      <div className="mt-auto min-w-0">
        <div className="truncate text-sm font-semibold">{app.title}</div>
        {size !== "small" && app.description && <div className="line-clamp-2 text-xs text-muted-foreground">{app.description}</div>}
      </div>
    </button>
  );
}

function defaultWidget(app: AppDescriptor): WidgetOption {
  return {
    id: "app",
    label: app.title,
    icon: app.icon,
    defaultSize: "small",
    render: (p) => <AppTile app={app} size={p.size} openApp={p.openApp} />,
  };
}

export function useWidgetRegistry(): RegisteredWidget[] {
  const apps = useApps();
  return useMemo(
    () =>
      apps.flatMap<RegisteredWidget>((app) => {
        // Explicit manifest wins; otherwise synthesize a default tile so EVERY
        // dockable app has a widget view with no per-app code.
        if (app.widgets && app.widgets.length) return app.widgets.map((option) => ({ appId: app.id, app, option, synthesized: false }));
        if (app.noDock || NO_DEFAULT.has(app.id)) return [];
        return [{ appId: app.id, app, option: defaultWidget(app), synthesized: true }];
      }),
    [apps],
  );
}

/** Glance surfaces (desktop wallpaper layer, Notification Center) show only the
 *  explicitly-declared widgets — the synthesized per-app tiles are shortcuts the
 *  dock/launcher already cover and would only clutter a glance. The Widgets app
 *  gallery + the mobile Today page still list everything. */
export function useFeaturedWidgets(): RegisteredWidget[] {
  const all = useWidgetRegistry();
  return useMemo(
    () => all.filter((w) => !w.synthesized).sort((a, b) => (b.option.priority ?? 0) - (a.option.priority ?? 0)),
    [all],
  );
}

/** Bound app-opener for tap-through from a widget (resolves title/size from the
 *  registry so the window opens with proper chrome). */
export function useOpenApp(): (appId: string, payload?: unknown) => void {
  const apps = useApps();
  return useMemo(
    () => (appId: string, payload?: unknown) => {
      const a = apps.find((x) => x.id === appId);
      if (a) openWindow(a.id, a.title, a.defaultSize, payload);
    },
    [apps],
  );
}

const sizesOf = (o: WidgetOption): readonly WidgetSize[] => o.sizes ?? ["small", "medium", "large"];
export const defaultSizeOf = (o: WidgetOption): WidgetSize => o.defaultSize ?? sizesOf(o)[0] ?? "small";

/** The framed widget host — sizes the glass card, renders the option body. */
export function WidgetView({
  option,
  size,
  openApp,
  className,
}: {
  option: WidgetOption;
  size: WidgetSize;
  openApp: (appId: string, payload?: unknown) => void;
  className?: string;
}) {
  const dims = WIDGET_DIMS[size];
  const Body = option.render;
  return (
    <div
      className={"shrink-0 overflow-hidden rounded-[22px] border border-white/15 text-foreground shadow-lg backdrop-blur-xl " + (className ?? "")}
      style={{ width: dims.w, height: dims.h, background: "var(--glass-menu)" }}
    >
      <Body size={size} openApp={openApp} />
    </div>
  );
}

export { sizesOf as widgetSizesOf };
