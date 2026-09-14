import type { AspectRatio, LandingSection, LandingSectionKind } from "../types";

export type LandingStore = {
  items: LandingSection[];
  publicBase: string;
  adminBase: string;
  create: (section: LandingSection) => void;
  update: (id: string, patch: Partial<Omit<LandingSection, "id">>) => void;
  remove: (id: string) => void;
};

export const LANDING_KIND_OPTIONS: Array<{ value: LandingSectionKind; label: string }> = [
  { value: "hero", label: "Hero" },
  { value: "features", label: "Features grid" },
  { value: "testimonials", label: "Testimonials" },
  { value: "pricing", label: "Pricing tiers" },
  { value: "blog", label: "Blog cards" },
  { value: "changelog", label: "Changelog feed" },
  { value: "faq", label: "FAQ accordion" },
  { value: "portfolio", label: "Portfolio grid" },
  { value: "services", label: "Services band" },
  { value: "stats", label: "Stats strip" },
  { value: "newsletter", label: "Newsletter signup" },
  { value: "cta", label: "Call-to-action" },
  { value: "custom", label: "Custom" },
];

export const LANDING_KIND_LABEL: Record<LandingSectionKind, string> = Object.fromEntries(
  LANDING_KIND_OPTIONS.map((item) => [item.value, item.label]),
) as Record<LandingSectionKind, string>;

export const LANDING_RATIO_OPTIONS: Array<{ value: AspectRatio; label: string }> = [
  { value: "16:9", label: "16:9 (widescreen, default)" },
  { value: "4:3", label: "4:3 (classic)" },
  { value: "1:1", label: "1:1 (square)" },
  { value: "3:2", label: "3:2 (photo)" },
  { value: "21:9", label: "21:9 (ultrawide)" },
  { value: "auto", label: "auto (natural ratio)" },
];

export function blankSection(lastOrder: number, id = `ls-${crypto.randomUUID().slice(0, 8)}`): LandingSection {
  return {
    id,
    order: Math.max(1, Math.floor(lastOrder) + 1),
    kind: "custom",
    title: "New section",
    subtitle: "",
    enabled: true,
    imageUrl: "",
    imageRatio: "16:9",
    bgImageUrl: "",
    className: "",
    config: "",
  };
}

export function sortedLandingSections(items: LandingSection[]): LandingSection[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function visibleLandingCount(items: LandingSection[]): number {
  return items.filter((item) => item.enabled).length;
}

export function moveLandingSection(store: LandingStore, id: string, delta: -1 | 1): boolean {
  const sorted = sortedLandingSections(store.items);
  const index = sorted.findIndex((item) => item.id === id);
  const next = index + delta;
  if (index < 0 || next < 0 || next >= sorted.length) return false;
  const current = sorted[index];
  const sibling = sorted[next];
  store.update(current.id, { order: sibling.order });
  store.update(sibling.id, { order: current.order });
  return true;
}
