"use client";
// glass-desktop — widget gallery (Build Plan T14). Renders every registered
// widget at its natural cell size, grouped by family — a QA + visual-review
// surface reached via /preview/slices/glass-desktop?gallery=1.
import { ClockProvider } from "@/features/glass-desktop/hooks/use-clock";
import { WidgetShell } from "@/features/glass-desktop/components/engine/widget-shell";
import { WidgetErrorBoundary } from "@/features/glass-desktop/components/engine/widget-error-boundary";
import { widgetRegistry } from "@/features/glass-desktop/lib/widget-registry";
import { GRID, SIZE_CELLS } from "@/features/glass-desktop/config/constants";
import type { WidgetFamily } from "@/features/glass-desktop/types";
import { LucentTheme } from "@/features/glass-desktop/components/engine/lucent-theme";

const FAMILY_ORDER: WidgetFamily[] = [
  "time", "timers", "calendar", "weather", "media", "system", "utilities", "social", "people", "finance", "analytics",
];

function cellPx(c: number, r: number) {
  return { width: c * GRID.cellW + (c - 1) * GRID.gap, height: r * GRID.cellH + (r - 1) * GRID.gap };
}

export function WidgetGallery() {
  const groups = FAMILY_ORDER
    .map((family) => ({ family, defs: Object.values(widgetRegistry).filter((d) => d.family === family) }))
    .filter((g) => g.defs.length > 0);
  const total = Object.keys(widgetRegistry).length;

  return (
    <ClockProvider>
      <div
        className="lc-wallpaper min-h-dvh overflow-auto p-6"
        style={{ background: "var(--color-canvas)", color: "var(--color-ink-hi)", fontFamily: "var(--font-ui)" }}
      >
        <LucentTheme />
        <header className="mb-6">
          <h1 className="text-xl font-semibold">Lucent widget gallery</h1>
          <p className="text-sm" style={{ color: "var(--color-ink-mid)" }}>
            {total} components · {groups.length} families
          </p>
        </header>
        <div className="flex flex-col gap-8">
          {groups.map(({ family, defs }) => (
            <section key={family} className="flex flex-col gap-3">
              <h2 className="text-xs font-medium tracking-wider uppercase" style={{ color: "var(--color-ink-low)" }}>
                {family} · {defs.length}
              </h2>
              <div className="flex flex-wrap gap-4">
                {defs.map((def) => {
                  const cells = SIZE_CELLS[def.size];
                  const { width, height } = cellPx(cells.c, cells.r);
                  const Widget = def.component;
                  return (
                    <figure key={def.id} className="flex flex-col gap-1.5">
                      <div style={{ width, height }}>
                        <WidgetErrorBoundary instanceId={def.id}>
                          <WidgetShell title={def.title} pill={cells.r === 1} className="h-full w-full">
                            <Widget instanceId={`gallery:${def.id}`} {...def.defaultProps} />
                          </WidgetShell>
                        </WidgetErrorBoundary>
                      </div>
                      <figcaption
                        className="text-[11px]"
                        style={{ color: "var(--color-ink-low)", fontFamily: "var(--font-numeric)" }}
                      >
                        {def.id} · {def.size}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </ClockProvider>
  );
}
