"use client";

/** Variant preview (VP wave) — rr-internal, stripped on `rr add`.
 *  template-base is tsc-excluded; this file imports ONLY site-compiled code
 *  (the panel's real overview + section blocks live at
 *  components/templates/_shared/admin-panel, mounted by every OS template). */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { AdminPanelOverview } from "@/components/templates/_shared/admin-panel/AdminPanelOverview";

const preview: SlicePreviewModule = {
  AdminPanelOverview: ({ variant }) => {
    const compact = variant.density === "compact";
    return (
      <div className="p-4">
        <div
          className={
            compact
              ? "h-[360px] overflow-auto rounded-lg border border-border p-4 text-[13px]"
              : "h-[440px] overflow-auto rounded-lg border border-border p-5"
          }
        >
          {/* hrefs stay inert inside the builder card */}
          <AdminPanelOverview adminBase="#" />
        </div>
      </div>
    );
  },
};

export default preview;
