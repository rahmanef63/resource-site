// Preview-kit breakpoints. Aligns with PREVIEW_PRESETS canvas widths
// (lib/preview-presets.ts) so kit components break at the same widths
// the iframe canvases actually snap to.
//
//   mobile:  390
//   tablet:  768
//   desktop: 1440

export const PREVIEW_BREAKPOINTS = {
  mobile: 390,
  tablet: 768,
  desktop: 1440,
} as const;

export type PreviewBreakpoint = keyof typeof PREVIEW_BREAKPOINTS;

/** Tailwind utility class shortcuts so preview JSX stays terse. */
export const RESPONSIVE_GRID = {
  /** 1 col mobile, 2 col tablet, 3 col desktop. */
  cards3: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
  /** 1 col mobile, 2 col tablet, 4 col desktop. */
  cards4: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
  /** 2 col tablet, single col mobile. */
  cards2: "grid grid-cols-1 gap-4 sm:grid-cols-2",
} as const;
