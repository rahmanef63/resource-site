"use client";

import type { SlicePreviewModule } from "@/shared/preview/types";
import HtmlStudio from "./app";

const HtmlStudioPreview: SlicePreviewModule["HtmlStudio"] = () => (
  <div className="h-[560px] w-full overflow-hidden rounded-xl border border-border bg-background">
    <HtmlStudio />
  </div>
);

const preview: SlicePreviewModule = { HtmlStudio: HtmlStudioPreview };
export default preview;
