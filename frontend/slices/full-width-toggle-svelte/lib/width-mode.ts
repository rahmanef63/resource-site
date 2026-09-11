export type WidthMode = "contained" | "wide" | "full";

export const WIDTH_MODE_STORAGE_KEY = "layout:widthMode";
export const DEFAULT_WIDTH_MODE: WidthMode = "contained";
export const WIDTH_MODES: readonly WidthMode[] = ["contained", "wide", "full"] as const;

export function isWidthMode(value: unknown): value is WidthMode {
  return value === "contained" || value === "wide" || value === "full";
}

export function readWidthMode(storage: Pick<Storage, "getItem"> | null | undefined): WidthMode {
  if (!storage) return DEFAULT_WIDTH_MODE;
  return normalizeWidthMode(storage.getItem(WIDTH_MODE_STORAGE_KEY));
}

export function writeWidthMode(
  mode: WidthMode,
  storage: Pick<Storage, "setItem"> | null | undefined,
  dispatchTarget?: Pick<Window, "dispatchEvent">,
): void {
  storage?.setItem(WIDTH_MODE_STORAGE_KEY, mode);
  dispatchTarget?.dispatchEvent(new StorageEvent("storage", {
    key: WIDTH_MODE_STORAGE_KEY,
    newValue: mode,
  }));
}

export function normalizeWidthMode(value: unknown): WidthMode {
  return isWidthMode(value) ? value : DEFAULT_WIDTH_MODE;
}

export function nextWidthMode(current: WidthMode): WidthMode {
  return WIDTH_MODES[(WIDTH_MODES.indexOf(current) + 1) % WIDTH_MODES.length];
}

export function widthClass(mode: WidthMode): string {
  switch (mode) {
    case "contained":
      return "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
    case "wide":
      return "mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8";
    case "full":
      return "w-full px-4 sm:px-6 lg:px-8";
  }
}
