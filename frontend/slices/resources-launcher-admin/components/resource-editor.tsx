"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ICON_NAMES } from "../lib/icons";
import { useResourcesApi, type Resource } from "../lib/host";

// Add / edit form for a single launcher link. `row` null = create a new link.
export function ResourceEditor({
  row,
  onDone,
  onCancel,
}: {
  row: Resource | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const api = useResourcesApi();
  const [label, setLabel] = useState(row?.label ?? "");
  const [icon, setIcon] = useState(row?.icon ?? ICON_NAMES[0]);
  const [url, setUrl] = useState(row?.url ?? "");
  const [group, setGroup] = useState(row?.group ?? "Links");
  const [order, setOrder] = useState(String(row?.order ?? 0));
  const [busy, setBusy] = useState(false);

  const valid = !!label.trim() && !!url.trim();

  async function save() {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await api.upsert({
        id: row?.id,
        label: label.trim(),
        icon,
        url: url.trim(),
        group: group.trim() || "Links",
        order: Number(order) || 0,
      });
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Docs" className="h-9" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Icon</Label>
          <NativeSelect value={icon} onChange={(e) => setIcon(e.target.value)} className="h-9">
            {ICON_NAMES.map((n) => (
              <NativeSelectOption key={n} value={n}>
                {n}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">URL</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https:// or mailto:" className="h-9" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Group</Label>
          <Input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Links" className="h-9" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Order</Label>
          <Input value={order} onChange={(e) => setOrder(e.target.value)} placeholder="0" type="number" className="h-9" />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={save} disabled={busy || !valid}>
          {busy ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
