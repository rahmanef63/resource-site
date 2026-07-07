// glass-desktop — inbox-count (people, S). Ported from Lucent v4 "inbox" square:
// mail glyph, the big unread count, and a per-category breakdown with accent
// dots. Pure/presentational — no hooks, no client boundary.
import { Mail } from "lucide-react";
import { inbox } from "@/features/glass-desktop/lib/seeds/people.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const NUM = { fontFamily: "var(--font-numeric)" } as const;

export function InboxCount(_props: WidgetProps) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <Mail aria-hidden size={20} style={{ color: "var(--color-accent-blue)" }} />
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-ink-mid)" }}>
          {inbox.label}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className="text-[2.5rem] leading-none font-semibold"
          style={{ ...NUM, color: "var(--color-ink-hi)" }}
        >
          {inbox.unread}
        </span>
        <span className="text-xs" style={{ color: "var(--color-ink-low)" }}>
          unread
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {inbox.categories.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: c.accent }}
            />
            <span className="flex-1 truncate text-[11px]" style={{ color: "var(--color-ink-mid)" }}>
              {c.label}
            </span>
            <span className="text-[11px]" style={{ ...NUM, color: "var(--color-ink-low)" }}>
              {c.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
