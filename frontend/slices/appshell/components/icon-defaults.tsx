"use client";
/* Global phosphor icon defaults for the whole OS shell.

   1. weight="fill" (solid, not outline) — set ONCE via phosphor's IconContext
      instead of a `weight` prop on every one of the ~90 icon call sites.
   2. COLOR = the theme accent. The `.os-accent-icons` wrapper below scopes a
      base-layer CSS rule (appshell.css) that sets `color: var(--os-accent)` on
      every phosphor glyph — so icons recolor with the theme preset AND a custom
      brand hex (both drive --os-accent). Phosphor renders fill=currentColor, so
      colouring is done in CSS (universal) rather than the context `color` prop
      (which would set a `fill="var()"` ATTRIBUTE — only Chromium resolves that).
      An icon that must stay white/neutral (a glyph on a coloured tile, an error
      glyph) opts out with a Tailwind text-utility ON the glyph itself
      (text-inherit / text-white / text-destructive) — a utility beats the
      base-layer rule. display:contents keeps the wrapper out of layout.

   Caveat: icons imported from "@phosphor-icons/react/ssr" (the RSC-safe entry,
   used only in true Server Components like app/join/[token]/page.tsx) do NOT
   read this context for weight — those set weight explicitly; the CSS colour
   rule still applies to them since it keys off the rendered SVG. */
import { IconContext } from "@phosphor-icons/react";
import type { ReactNode } from "react";

// Stable reference so context consumers don't re-render on every parent render.
const ICON_DEFAULTS = { weight: "fill" as const };

export function IconDefaults({ children }: { children: ReactNode }) {
  return (
    <IconContext.Provider value={ICON_DEFAULTS}>
      <div className="os-accent-icons" style={{ display: "contents" }}>
        {children}
      </div>
    </IconContext.Provider>
  );
}
