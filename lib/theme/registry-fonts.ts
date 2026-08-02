// Lookup: first family name from a registry `font-*` value → Next.js
// font-variable name registered in `app/layout.tsx`.
//
// Kitab loads only Geist (sans + mono) by default. Add a font here +
// in layout.tsx if you want to self-host another preset family.

export const REGISTRY_FONT_VAR: Readonly<Record<string, string>> = {
  geist: "font-geist-sans",
  "geist mono": "font-geist-mono",
};

export function rewriteFontValue(rawValue: string): string {
  if (typeof rawValue !== "string") return rawValue;
  const trimmed = rawValue.trim();
  if (!trimmed) return rawValue;

  const parts = trimmed.split(",");
  const first = parts[0]
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase();

  const varName = REGISTRY_FONT_VAR[first];
  if (!varName) return rawValue;

  return `var(--${varName}), ${parts.map((p) => p.trim()).join(", ")}`;
}
