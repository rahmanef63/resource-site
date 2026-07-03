// audit-allow-hex: hex lives inside inline SVG sample CONTENT (data URIs),
// not themable chrome.
// Offline demo images for new image layers — inline gradient SVG data URIs so
// the studio composes pictures with zero backend and zero network.

function gradientSvg(a: string, b: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
</linearGradient></defs>
<rect width="800" height="800" fill="url(#g)"/>
<circle cx="230" cy="220" r="150" fill="rgba(255,255,255,0.16)"/>
<circle cx="600" cy="560" r="210" fill="rgba(0,0,0,0.12)"/>
<text x="400" y="740" fill="rgba(255,255,255,0.85)" font-family="monospace"
 font-size="34" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Bundled image pool for the mock host adapter (lib/host.ts). */
export const SAMPLE_IMAGES: string[] = [
  gradientSvg("#1dd1a1", "#5f27cd", "aurora"),
  gradientSvg("#ff9a6b", "#ee5a6f", "sunset"),
  gradientSvg("#0a3d62", "#3aa0ff", "deep-sea"),
];
