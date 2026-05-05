// Device viewport presets — Tailwind preview approximations.
//
// IMPORTANT distinction:
//   - `previewPresets`         → CSS px width/height for iframe canvas (preview UX)
//   - `realDeviceReferences`   → physical pixel resolutions sourced from
//                                official spec pages (Huawei, Samsung). Used
//                                only as reference badges. NOT what we render.
//
// Sources:
//   - Huawei Mate XT specs (consumer.huawei.com)
//   - Samsung Galaxy Z TriFold (news.samsung.com)
//   - iPhone Fold = rumor only (Reuters / Bloomberg reporting)

export type PreviewView =
  | "mobile"
  | "mobile-flip"
  | "fold-cover"
  | "fold-open"
  | "tri-fold-single"
  | "tri-fold-dual"
  | "tri-fold-triple"
  | "tablet"
  | "desktop"
  | "iphone-fold-rumor";

export type PreviewMode = "single" | "segmented";
/** Hinge axis. "vertical" hinge = panels SIDE-BY-SIDE (book spread).
 *  "horizontal" hinge = panels STACKED (clamshell). */
export type HingeAxis = "vertical" | "horizontal";

export type PreviewPreset = {
  id: PreviewView;
  label: string;
  shortLabel: string;
  description?: string;
  /** Tailwind preview canvas — NOT physical device resolution */
  width: number;
  height: number;
  mode: PreviewMode;
  /** segmented only */
  segments?: number;
  hingeAxis?: HingeAxis;
  hinge?: number;
  canRotate?: boolean;
  experimental?: boolean;
  note?: string;
  /** link to realDeviceReferences entry id */
  referenceId?: keyof typeof REAL_DEVICE_REFERENCES;
};

// ---------------------------------------------------------------------
// REAL device specs (badge data only — never rendered as canvas size)
// ---------------------------------------------------------------------

export const REAL_DEVICE_REFERENCES = {
  "huawei-mate-xt-single": {
    label: "Huawei Mate XT Single Screen",
    physicalResolution: "2232 × 1008",
    screenSize: "6.4 inch",
    status: "official" as const,
  },
  "huawei-mate-xt-dual": {
    label: "Huawei Mate XT Dual Screen",
    physicalResolution: "2232 × 2048",
    screenSize: "7.9 inch",
    status: "official" as const,
  },
  "huawei-mate-xt-triple": {
    label: "Huawei Mate XT Triple Screen",
    physicalResolution: "2232 × 3184",
    screenSize: "10.2 inch",
    status: "official" as const,
  },
  "samsung-z-trifold-cover": {
    label: "Samsung Galaxy Z TriFold Cover",
    physicalResolution: "2520 × 1080",
    screenSize: "6.5 inch",
    status: "official" as const,
  },
  "samsung-z-trifold-main": {
    label: "Samsung Galaxy Z TriFold Main",
    physicalResolution: "2160 × 1584",
    screenSize: "10.0 inch",
    status: "official" as const,
  },
  "samsung-z-fold": {
    label: "Samsung Galaxy Z Fold",
    physicalResolution: "2176 × 1812",
    screenSize: "7.6 inch",
    status: "official" as const,
  },
  "samsung-z-flip": {
    label: "Samsung Galaxy Z Flip",
    physicalResolution: "2640 × 1080",
    screenSize: "6.7 inch",
    status: "official" as const,
  },
  "iphone-fold-rumor": {
    label: "iPhone Fold (rumor)",
    physicalResolution: null,
    screenSize: null,
    status: "rumor" as const,
  },
} as const;

// ---------------------------------------------------------------------
// Tailwind preview presets
// ---------------------------------------------------------------------

export const PREVIEW_PRESETS: Record<PreviewView, PreviewPreset> = {
  mobile: {
    id: "mobile",
    label: "Mobile",
    shortLabel: "Mobile",
    description: "iPhone / Android phone class",
    width: 390,
    height: 844,
    mode: "single",
    canRotate: true,
  },
  "mobile-flip": {
    id: "mobile-flip",
    label: "Mobile Landscape",
    shortLabel: "Landscape",
    description: "Mobile rotated landscape — not a foldable",
    width: 844,
    height: 390,
    mode: "single",
    canRotate: true,
    note: "mobile landscape, not foldable",
  },
  "fold-cover": {
    id: "fold-cover",
    label: "Fold Cover",
    shortLabel: "Cover",
    description: "Galaxy Z Fold cover screen — phone-like",
    width: 390,
    height: 844,
    mode: "single",
    canRotate: true,
    referenceId: "samsung-z-fold",
  },
  "fold-open": {
    id: "fold-open",
    label: "Fold Open",
    shortLabel: "Fold",
    description: "Book-style fold open — almost square tablet mode",
    width: 768,
    height: 820,
    mode: "single",
    canRotate: true,
    referenceId: "samsung-z-fold",
  },
  "tri-fold-single": {
    id: "tri-fold-single",
    label: "TriFold Single",
    shortLabel: "Tri 1",
    description: "Huawei Mate XT / Z TriFold — 1 panel",
    width: 390,
    height: 844,
    mode: "segmented",
    segments: 1,
    hingeAxis: "vertical",
    hinge: 24,
    canRotate: true,
    referenceId: "huawei-mate-xt-single",
  },
  "tri-fold-dual": {
    id: "tri-fold-dual",
    label: "TriFold Dual",
    shortLabel: "Tri 2",
    description: "Huawei Mate XT / Z TriFold — 2 panels w/ hinge",
    width: 768,
    height: 844,
    mode: "segmented",
    segments: 2,
    hingeAxis: "vertical",
    hinge: 24,
    canRotate: true,
    referenceId: "huawei-mate-xt-dual",
  },
  "tri-fold-triple": {
    id: "tri-fold-triple",
    label: "TriFold Triple",
    shortLabel: "Tri 3",
    description: "Huawei Mate XT — 3 panels w/ dual hinge",
    width: 1024,
    height: 844,
    mode: "segmented",
    segments: 3,
    hingeAxis: "vertical",
    hinge: 24,
    canRotate: true,
    referenceId: "huawei-mate-xt-triple",
  },
  tablet: {
    id: "tablet",
    label: "Tablet",
    shortLabel: "Tablet",
    description: "iPad / Android tablet",
    width: 768,
    height: 1024,
    mode: "single",
    canRotate: true,
  },
  desktop: {
    id: "desktop",
    label: "Desktop",
    shortLabel: "Desktop",
    description: "Laptop / desktop",
    width: 1440,
    height: 900,
    mode: "single",
    canRotate: false,
  },
  "iphone-fold-rumor": {
    id: "iphone-fold-rumor",
    label: "iPhone Fold (rumor)",
    shortLabel: "iFold?",
    description: "Rumor only — no official Apple resolution",
    width: 768,
    height: 820,
    mode: "single",
    canRotate: true,
    experimental: true,
    note: "rumor only, no official spec",
    referenceId: "iphone-fold-rumor",
  },
};

export const PREVIEW_VIEW_ORDER: PreviewView[] = [
  "mobile",
  "mobile-flip",
  "fold-cover",
  "fold-open",
  "tri-fold-single",
  "tri-fold-dual",
  "tri-fold-triple",
  "tablet",
  "desktop",
  "iphone-fold-rumor",
];

export function isPreviewView(s: string | null | undefined): s is PreviewView {
  return !!s && (s as PreviewView) in PREVIEW_PRESETS;
}

export type PreviewOrientation = "portrait" | "landscape";

/** Apply rotation. Swaps width/height + flips hinge axis. */
export function applyRotation(
  preset: PreviewPreset,
  orientation: PreviewOrientation,
): PreviewPreset {
  if (orientation === "portrait") return preset;
  return {
    ...preset,
    width: preset.height,
    height: preset.width,
    hingeAxis:
      preset.hingeAxis === "vertical"
        ? "horizontal"
        : preset.hingeAxis === "horizontal"
          ? "vertical"
          : preset.hingeAxis,
  };
}
