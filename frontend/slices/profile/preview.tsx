"use client";

import type { SlicePreviewModule } from "@/shared/preview/types";
import { AboutProfile, Resume } from "./index";

const preview: SlicePreviewModule = {
  Resume: () => (
    <div className="h-[720px] overflow-hidden rounded-lg border bg-card">
      <Resume />
    </div>
  ),
  AboutProfile: () => (
    <div className="mx-auto h-[640px] max-w-md overflow-hidden rounded-lg border bg-background">
      <AboutProfile />
    </div>
  ),
};

export default preview;
