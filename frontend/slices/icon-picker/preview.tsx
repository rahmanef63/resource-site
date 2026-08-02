"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import * as React from "react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { cn } from "@/lib/utils";
import { IconPickerInline } from "./components/IconPickerInline";
import { DynamicIcon } from "./components/DynamicIcon";
import { setIconStyle, type Style } from "./lib/style-pref";

const SEED = "lucide:Rocket";
const { useDemoStore } = createDemoStore<string>({ slug: "icon-picker", seed: SEED });

const IconPreview: SlicePreviewModule["IconPickerInline"] = ({ variant }) => {
  const style = (variant.style as Style) === "native" ? "native" : "twemoji";
  const [value, setValue, { ready }] = useDemoStore();

  React.useEffect(() => {
    setIconStyle(style);
  }, [style]);

  if (!ready) return null;

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-3">
        <DynamicIcon value={value} size={40} />
        <div className="text-xs text-muted-foreground">
          stored value: <span className="font-mono text-foreground">{value || "—"}</span>
          <div className="mt-0.5">
            render style: <span className="font-medium text-foreground">{style}</span>
          </div>
        </div>
      </div>
      <div className={cn("h-[360px] overflow-hidden rounded-md border border-border")}>
        <IconPickerInline value={value} onChange={(next) => setValue(next)} />
      </div>
    </div>
  );
};

const preview: SlicePreviewModule = { IconPickerInline: IconPreview };
export default preview;
