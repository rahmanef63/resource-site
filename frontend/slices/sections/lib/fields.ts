import { LANDING_KIND_OPTIONS, LANDING_RATIO_OPTIONS } from "./core";
import type { LandingSection } from "../types";

export type LandingFieldDef =
  | { kind: "text" | "image"; key: keyof LandingSection & string; label: string; placeholder?: string; hint?: string; mono?: boolean; wide?: boolean }
  | { kind: "textarea"; key: keyof LandingSection & string; label: string; placeholder?: string; hint?: string; mono?: boolean; rows?: number }
  | { kind: "select"; key: keyof LandingSection & string; label: string; options: Array<{ value: string; label: string }>; hint?: string; wide?: boolean }
  | { kind: "position" | "switch"; key: keyof LandingSection & string; label: string; hint?: string; wide?: boolean };

export const LANDING_FIELDS_CORE: LandingFieldDef[] = [
  { kind: "select", key: "kind", label: "Kind", options: LANDING_KIND_OPTIONS, hint: "Decides which renderer the template picks for this section." },
  { kind: "position", key: "order", label: "Order", hint: "1 = top of the page. Reordering auto-shifts siblings." },
  { kind: "switch", key: "enabled", label: "Visible on /", hint: "Hide from public without deleting." },
  { kind: "text", key: "title", label: "Title", wide: true, placeholder: "Section heading" },
  { kind: "textarea", key: "subtitle", label: "Subtitle / lead paragraph", rows: 3 },
  { kind: "image", key: "imageUrl", label: "Foreground image", wide: true, placeholder: "https://… or /covers/hero.jpg" },
  { kind: "select", key: "imageRatio", label: "Image aspect ratio", options: LANDING_RATIO_OPTIONS },
  { kind: "image", key: "bgImageUrl", label: "Background image", wide: true, placeholder: "https://…" },
  { kind: "text", key: "className", label: "Custom style (Tailwind classNames)", mono: true, wide: true, placeholder: "py-24 bg-muted/40" },
  { kind: "textarea", key: "config", label: "Kind-specific config (JSON)", rows: 5, mono: true, placeholder: '{ "badge": "New", "columns": 3 }' },
];
