// glass-desktop — social-count (social, W). One component, two instances
// (wavelength / loop) selected by the instanceId suffix, e.g.
// "social-count:wavelength". Presentational — headline follower tally, platform
// glyph, and a weekly delta. Fictional platforms only per §2 IP guardrail.
import { AudioLines, Play } from "lucide-react";
import {
  socialCountSeed,
  type SocialGlyph,
  type SocialPlatform,
} from "@/features/glass-desktop/lib/seeds/social-people-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const NUM = { fontFamily: "var(--font-numeric)" } as const;

const GLYPHS: Record<SocialGlyph, typeof AudioLines> = {
  "audio-lines": AudioLines,
  play: Play,
};

function resolvePlatform(props: WidgetProps): SocialPlatform {
  const fromProp = props.platform;
  if (typeof fromProp === "string" && fromProp in socialCountSeed) {
    return fromProp as SocialPlatform;
  }
  const suffix = props.instanceId.split(":")[1];
  if (suffix && suffix in socialCountSeed) return suffix as SocialPlatform;
  return "wavelength";
}

export function SocialCount(props: WidgetProps) {
  const s = socialCountSeed[resolvePlatform(props)];
  const Glyph = GLYPHS[s.glyph];

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <Glyph aria-hidden size={20} style={{ color: s.accent }} />
        <span
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--color-ink-mid)" }}
        >
          {s.platform}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span
          className="text-[2.75rem] leading-none font-semibold"
          style={{ ...NUM, color: "var(--color-ink-hi)" }}
        >
          {s.count}
        </span>
        <span className="text-xs" style={{ color: "var(--color-ink-low)" }}>
          {s.unit}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-6 w-1 shrink-0 rounded-full"
          style={{ background: s.accent }}
        />
        <span
          className="text-sm font-medium tabular-nums"
          style={{ ...NUM, color: "var(--tone-success)" }}
        >
          {s.delta}
        </span>
        <span className="text-[11px]" style={{ color: "var(--color-ink-low)" }}>
          this week
        </span>
      </div>
    </div>
  );
}
