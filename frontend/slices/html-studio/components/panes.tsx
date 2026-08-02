"use client";
/* Editor + sandboxed PreviewPane for the HTML Studio. Presentational: explicit
   props, no hooks. The preview iframe runs user HTML in an opaque origin (no
   allow-same-origin) — see HTML_SANDBOX. */
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cx, DEVICE_W, HTML_SANDBOX } from "../lib/util";
import type { Device } from "../lib/util";

export function Editor({ html, onChange, showPreview }: { html: string; onChange: (v: string) => void; showPreview: boolean }) {
  return (
    <Textarea
      value={html}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      placeholder="<!doctype html> …"
      className={cx(
        "h-full min-h-0 min-w-0 resize-none rounded-none border-0 bg-muted p-3 font-mono text-xs leading-relaxed text-foreground shadow-none focus-visible:ring-0",
        showPreview ? "w-1/2 border-r border-border" : "flex-1",
      )}
    />
  );
}

export function PreviewPane({
  preview,
  showEditor,
  device,
  deviceIcon: DeviceIcon,
  onCycleDevice,
}: {
  preview: string;
  showEditor: boolean;
  device: Device;
  deviceIcon: LucideIcon;
  onCycleDevice: () => void;
}) {
  return (
    <section className={cx("flex min-h-0 min-w-0 flex-col bg-muted", showEditor ? "w-1/2" : "flex-1")}>
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1">
        {showEditor ? (
          <span className="font-mono text-[10px] text-muted-foreground">preview</span>
        ) : (
          <>
            <Button type="button" size="sm" variant="ghost" onClick={onCycleDevice} title="Preview width" className="h-6 gap-1 px-1.5 text-[11px] capitalize">
              <DeviceIcon className="size-3.5" /> {device}
            </Button>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              {device === "full" ? "responsive" : `${DEVICE_W[device]}px`}
            </span>
          </>
        )}
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-background">
        <iframe
          sandbox={HTML_SANDBOX}
          srcDoc={preview}
          title="HTML preview"
          style={!showEditor && DEVICE_W[device] ? { maxWidth: DEVICE_W[device] } : undefined}
          className="h-full w-full border-0"
        />
      </div>
    </section>
  );
}
