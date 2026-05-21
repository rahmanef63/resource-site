"use client";

/** MapView — SVG world projection with row pins. Reads lat/lng from
 *  view-config-named number properties (mapLatProp / mapLngProp). Optional
 *  mapPinColorProp = select/status property whose option color maps to
 *  pin hue. Mutations flow through onViewConfigChange / onRowAdd /
 *  onOpenRow. No leaflet — pure SVG, runs anywhere. */

import { useMemo, useState } from "react";
import { ChevronDown, MapPin, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Property } from "../../types";
import type { ViewProps } from "./types";
import { MAP_COLOR_HEX, MapSvg, projectLatLng, type MapPinData } from "./map-svg";

export function MapView({
  db, view, rows, onViewConfigChange, onOpenRow, onRowAdd, onRowRemove,
}: ViewProps) {
  const numProps = useMemo(() => db.properties.filter((p) => p.type === "number"), [db.properties]);
  const latProp = useMemo(
    () => db.properties.find((p) => p.id === view.mapLatProp && p.type === "number")
      ?? db.properties.find((p) => p.type === "number" && /lat/i.test(p.name))
      ?? numProps[0],
    [db.properties, view.mapLatProp, numProps],
  );
  const lngProp = useMemo(
    () => db.properties.find((p) => p.id === view.mapLngProp && p.type === "number")
      ?? db.properties.find((p) => p.type === "number" && /(lng|lon)/i.test(p.name))
      ?? numProps.find((p) => p.id !== latProp?.id),
    [db.properties, view.mapLngProp, numProps, latProp],
  );
  const colorProp = useMemo(
    () => db.properties.find((p) => p.id === view.mapPinColorProp && (p.type === "select" || p.type === "status")),
    [db.properties, view.mapPinColorProp],
  );

  const pins: MapPinData[] = useMemo(() => {
    if (!latProp || !lngProp) return [];
    const out: MapPinData[] = [];
    for (const r of rows) {
      const lat = Number(r.rowProps?.[latProp.id]);
      const lng = Number(r.rowProps?.[lngProp.id]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const { x, y } = projectLatLng(lat, lng);
      const opt = colorProp
        ? colorProp.options?.find((o) => o.id === r.rowProps?.[colorProp.id])
        : null;
      const color = (opt && MAP_COLOR_HEX[opt.color ?? "gray"]) ?? "hsl(var(--primary))";
      out.push({ row: r, x, y, lat, lng, color });
    }
    return out;
  }, [rows, latProp, lngProp, colorProp]);

  const showList = view.mapShowList ?? true;
  const set = (patch: Partial<typeof view>) => onViewConfigChange?.(patch);

  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <PropPicker label="Latitude" value={latProp?.name ?? "—"} props={numProps}
          onPick={(id) => set({ mapLatProp: id })} />
        <PropPicker label="Longitude" value={lngProp?.name ?? "—"}
          props={numProps.filter((p) => p.id !== latProp?.id)}
          onPick={(id) => set({ mapLngProp: id })} />
        <span className="ml-auto text-muted-foreground">{pins.length} of {rows.length} pinned</span>
        {onRowAdd && (
          <button
            type="button"
            onClick={onRowAdd}
            className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-muted-foreground hover:bg-accent"
          >
            <Plus className="h-3 w-3" /> New row
          </button>
        )}
      </div>

      {(!latProp || !lngProp) ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Add two number properties for latitude and longitude to plot rows on the map.
        </div>
      ) : (
        <MapSvg pins={pins} onPinClick={onOpenRow} />
      )}

      {showList && pins.length > 0 && (
        <div className="max-h-48 divide-y divide-border overflow-y-auto rounded-lg border border-border bg-card">
          {pins.map((p) => (
            <div key={p.row.id} className="group flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent/50">
              <button
                type="button"
                onClick={() => onOpenRow?.(p.row.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <MapPin className="h-3 w-3 shrink-0" style={{ color: p.color }} />
                <span className="flex-1 truncate">{p.row.icon} {p.row.title || "Untitled"}</span>
                <span className="tabular-nums text-muted-foreground">
                  {p.lat.toFixed(2)}, {p.lng.toFixed(2)}
                </span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted-foreground opacity-0 hover:bg-accent group-hover:opacity-100"
                    aria-label="Row actions"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onOpenRow?.(p.row.id)}>Open</DropdownMenuItem>
                  {onRowRemove && (
                    <DropdownMenuItem className="text-destructive" onClick={() => onRowRemove(p.row.id)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {colorProp && colorProp.options && colorProp.options.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <span>Legend:</span>
          {colorProp.options.map((o) => (
            <span key={o.id} className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: MAP_COLOR_HEX[o.color ?? "gray"] }} />
              {o.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PropPicker({ label, value, props, onPick }: {
  label: string; value: string; props: Property[]; onPick: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 hover:bg-accent">
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium">{value}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="text-xs">{label}</DropdownMenuLabel>
        {props.length === 0 ? (
          <DropdownMenuItem disabled>Add a number property first</DropdownMenuItem>
        ) : props.map((p) => (
          <DropdownMenuItem key={p.id} onClick={() => onPick(p.id)}>{p.name}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
