"use client";
// glass-desktop — contact-card (people, S). Initials avatar + name over four
// quick actions (message / call / video / mail). Each action pops on press
// (scale), gated by prefers-reduced-motion. Fictional person per §2 guardrail.
import { MessageSquare, Phone, Video, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  contactCardSeed,
  type ContactAction,
} from "@/features/glass-desktop/lib/seeds/social-people-2.seed";
import { cn } from "@/lib/utils";
import type { WidgetProps } from "@/features/glass-desktop/types";

const ACTIONS: Record<ContactAction, { label: string; Icon: typeof Phone }> = {
  message: { label: "Message", Icon: MessageSquare },
  call: { label: "Call", Icon: Phone },
  video: { label: "Video call", Icon: Video },
  mail: { label: "Email", Icon: Mail },
};

export function ContactCard(_props: WidgetProps) {
  const c = contactCardSeed;

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: c.accent }}
        >
          {c.initials}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold" style={{ color: "var(--color-ink-hi)" }}>
            {c.name}
          </div>
          <div className="truncate text-[11px]" style={{ color: "var(--color-ink-mid)" }}>
            {c.handle}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1">
        {c.actions.map((key) => {
          const { label, Icon } = ACTIONS[key];
          return (
            <Button
              key={key}
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`${label} ${c.name}`}
              className={cn(
                "size-9 rounded-full [background:var(--color-glass-solid)]",
                "transition-transform motion-safe:active:scale-90",
                "[transition-duration:var(--duration-micro)] [transition-timing-function:var(--ease-settle)]",
              )}
            >
              <Icon aria-hidden style={{ color: "var(--color-ink-mid)" }} />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
