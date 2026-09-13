"use client";

import type { SlicePreviewModule } from "@/shared/preview/types";
import ResourcesAdmin from "./app";

const ResourcesAdminPreview: SlicePreviewModule["ResourcesAdmin"] = () => (
  <div className="h-[520px] w-full overflow-hidden rounded-xl border border-border bg-background">
    <ResourcesAdmin />
  </div>
);

const preview: SlicePreviewModule = { ResourcesAdmin: ResourcesAdminPreview };
export default preview;
