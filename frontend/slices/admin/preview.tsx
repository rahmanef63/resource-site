"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import AdminPage from "./page";
import type { SliceAdminLabels } from "./lib";

const PRESETS: Record<string, SliceAdminLabels | undefined> = {
  default: undefined,
  saas: {
    title: "Console",
    subtitle: "Manage tenants, billing and team access for your SaaS.",
    emptyHeading: "No panels mounted",
    emptyBody: "Compose Tenants, Billing and Audit panels into this shell.",
  },
  blog: {
    title: "Studio",
    subtitle: "Author posts, manage authors and review comments.",
    emptyHeading: "Nothing here yet",
    emptyBody: "Wire your Posts, Authors and Moderation panels here.",
  },
};

const preview: SlicePreviewModule = {
  AdminPage: ({ variant }) => {
    const scenario = variant.scenario ?? "default";
    const labels = PRESETS[scenario];
    return (
      <div className="p-4">
        <div className="h-[360px] overflow-hidden rounded-lg border bg-background">
          <div className="h-full overflow-auto">
            <AdminPage labels={labels} />
          </div>
        </div>
      </div>
    );
  },
};

export default preview;
