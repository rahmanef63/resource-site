"use client";
// glass-desktop — contacts-row (people, WP). Ported from Lucent v4 "contacts"
// pill: a row of initials avatars (selectable) plus call / chat / video quick
// actions that target the selected contact. Selection is local UI state.
import { useState } from "react";
import { Phone, MessageSquare, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contacts } from "@/features/glass-desktop/lib/seeds/people.seed";
import { cn } from "@/lib/utils";
import type { WidgetProps } from "@/features/glass-desktop/types";

const ACTIONS = [
  { key: "call", label: "Call", Icon: Phone },
  { key: "chat", label: "Message", Icon: MessageSquare },
  { key: "video", label: "Video call", Icon: Video },
] as const;

export function ContactsRow(_props: WidgetProps) {
  const [selected, setSelected] = useState(0);
  const active = contacts[selected] ?? contacts[0];

  return (
    <div className="flex h-full items-center justify-between gap-2">
      <div className="flex min-w-0 items-center -space-x-1.5">
        {contacts.map((c, i) => (
          <Button
            key={c.name}
            type="button"
            variant="ghost"
            aria-label={c.name}
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
            className={cn(
              "size-8 shrink-0 rounded-full p-0 text-[11px] font-semibold text-white hover:opacity-90",
              i === selected && "ring-2 ring-offset-0",
            )}
            style={{
              background: c.accent,
              zIndex: i === selected ? contacts.length : contacts.length - i,
              ["--tw-ring-color" as string]: "var(--color-ink-hi)",
            }}
          >
            {c.initials}
          </Button>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {ACTIONS.map(({ key, label, Icon }) => (
          <Button
            key={key}
            type="button"
            size="icon"
            variant="ghost"
            aria-label={`${label} ${active.name}`}
            className="size-7 rounded-full [background:var(--color-glass-solid)]"
          >
            <Icon aria-hidden style={{ color: "var(--color-ink-mid)" }} />
          </Button>
        ))}
      </div>
    </div>
  );
}
