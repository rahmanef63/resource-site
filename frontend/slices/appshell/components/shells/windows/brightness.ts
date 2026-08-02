// Working brightness control (P5 critic: "Brightness/volume controls are inert").
// A direct DOM style write — no store, no context, no persistence — the
// slider IS the state; deliberately not built into a bigger brightness-state
// system per the task scope. Floors at BRIGHTNESS_FLOOR so the viewport never
// goes fully black from a stray drag to 0.
export const BRIGHTNESS_FLOOR = 35;

/** Dim (or restore) the whole viewport for the given slider value (0-100). */
export function applyBrightness(value: number): number {
  const pct = Math.max(BRIGHTNESS_FLOOR, Math.min(100, value));
  const root = document.documentElement;
  root.style.setProperty("--os-brightness", String(pct / 100));
  root.style.filter = pct >= 100 ? "" : "brightness(var(--os-brightness))";
  return pct;
}
