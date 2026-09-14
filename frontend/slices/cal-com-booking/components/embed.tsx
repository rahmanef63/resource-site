"use client";

import Cal from "@calcom/embed-react";
import {
  DEFAULT_CAL_ORIGIN,
  normalizeCalLink,
  normalizeCalOrigin,
  type CalEmbedConfig,
} from "../lib/embed-core";

export type CalEmbedProps = {
  calLink?: string;
  calOrigin?: string;
  config?: CalEmbedConfig;
};

export default function CalEmbed({
  calLink,
  calOrigin = DEFAULT_CAL_ORIGIN,
  config,
}: CalEmbedProps) {
  const link = normalizeCalLink(calLink);
  if (!link) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <div
          className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground"
          role="status"
        >
          Configure a Cal.com <code>calLink</code> such as <code>team/event-type</code> to render booking.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[650px] max-w-5xl p-4 sm:p-8">
      <Cal
        calLink={link}
        calOrigin={normalizeCalOrigin(calOrigin)}
        config={{ layout: "month_view", ...config }}
        style={{ width: "100%", height: "100%", overflow: "auto" }}
      />
    </main>
  );
}
