"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LUCIDE_GROUPS } from "../../lib/lucide-catalog";
import type { Style } from "../../lib/style-pref";
import type { IconValue } from "../../lib/parse";
import { LucideCell, Grid, Empty } from "./cells";
import { RecentsSection, Section } from "./Sections";

export interface LucideTabProps {
  filtered: string[] | null;
  parsed: IconValue;
  iconStyle: Style;
  currentColor: string | undefined;
  recents: readonly string[];
  activeValue: string;
  onPickLucide: (n: string) => void;
  onPickRecent: (v: string) => void;
}

export function LucideTab({
  filtered,
  parsed,
  iconStyle,
  currentColor,
  recents,
  activeValue,
  onPickLucide,
  onPickRecent,
}: LucideTabProps) {
  return (
    <ScrollArea className="h-64 pr-2">
      {filtered ? (
        <Grid>
          {filtered.length === 0 ? <Empty /> : filtered.map((n, i) => (
            <LucideCell
              key={`f-${n}`}
              name={n}
              color={currentColor}
              style={iconStyle}
              active={parsed.kind === "lucide" && parsed.name === n}
              onClick={() => onPickLucide(n)}
              tabIndex={i === 0 ? 0 : -1}
              index={i}
            />
          ))}
        </Grid>
      ) : (
        <div className="space-y-3">
          {recents.length > 0 && (
            <RecentsSection
              recents={recents}
              style={iconStyle}
              activeValue={activeValue}
              onPick={onPickRecent}
            />
          )}
          {LUCIDE_GROUPS.map((g) => (
            <Section key={g.id} label={g.label}>
              {g.items.map((n) => (
                <LucideCell
                  key={`${g.id}-${n}`}
                  name={n}
                  color={currentColor}
                  style={iconStyle}
                  active={parsed.kind === "lucide" && parsed.name === n}
                  onClick={() => onPickLucide(n)}
                />
              ))}
            </Section>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
