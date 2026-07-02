import { STYLE_ID } from "./defaults";

// Hide Google's injected chrome (top banner, gadget combo, tooltip) so the
// consumer can drive the widget via its own dropdown. Reset `body`
// top/position so the page doesn't shift ~40px when the widget activates.
// The `font[style]` rule cancels broken inline styling Google sometimes
// leaves on translated text nodes.
export function ensureStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
.goog-te-banner-frame,
.goog-te-banner-frame.skiptranslate,
.goog-te-gadget-icon,
.goog-te-gadget-simple,
.goog-te-gadget,
.goog-te-balloon-frame,
#goog-gt-tt,
.goog-tooltip,
.goog-tooltip:hover,
.skiptranslate > iframe { display: none !important; }
body { top: 0 !important; position: static !important; }
.goog-text-highlight { background: transparent !important; box-shadow: none !important; }
font[style*="vertical-align"] { vertical-align: inherit !important; background-color: transparent !important; }
`;
  document.head.appendChild(s);
}
