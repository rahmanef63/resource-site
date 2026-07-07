"use client";
/* Brand-accent DOM helpers for the appearance store (lib/appearance). Pure
   functions — take args, mutate the passed root only. */

// One brand hex → re-skin the primary accent (used app-wide via var(--primary))
// + the --brand* tokens (Android home gradient etc.) + --os-accent (the
// appshell chrome accent — Spotlight/Inspector/HUD/desktop-icon tints — which
// a theme PRESET already re-derives from its own primary but, until this,
// only a brand-hex-with-no-preset never touched, leaving chrome stuck on the
// stock blue while every app-content surface had already re-skinned). Null
// restores the theme.
export function applyBrand(root: HTMLElement, hex: string | null) {
  const props = ["--primary", "--ring", "--sidebar-primary", "--brand", "--brand-soft", "--brand-strong", "--primary-foreground", "--os-accent"];
  if (!hex) { props.forEach((p) => root.style.removeProperty(p)); return; }
  const { r, g, b } = hexRgb(hex);
  const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6; // perceived luminance
  root.style.setProperty("--primary", hex);
  root.style.setProperty("--ring", hex);
  root.style.setProperty("--sidebar-primary", hex);
  root.style.setProperty("--primary-foreground", light ? "#111111" : "#ffffff");
  root.style.setProperty("--brand", hex);
  root.style.setProperty("--brand-soft", `rgba(${r},${g},${b},0.16)`);
  root.style.setProperty("--brand-strong", `rgb(${Math.round(r * 0.8)},${Math.round(g * 0.8)},${Math.round(b * 0.8)})`);
  root.style.setProperty("--os-accent", hex);
}

function hexRgb(hex: string) {
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
}
