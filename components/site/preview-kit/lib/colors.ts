// Deterministic HSL-pair gradient from a numeric seed. Used by blog
// thumbnails + slice mock previews so every card gets a distinct,
// stable-across-renders color signature without shipping image assets.

export type HueGradient = {
  bg: string;
  highlight: string;
};

export function hueGradient(hue: number, opacityFrom = 0.4, opacityTo = 0.2): HueGradient {
  const hueA = hue;
  const hueB = (hue + 60) % 360;
  return {
    bg: `linear-gradient(135deg, hsl(${hueA} 70% 55% / ${opacityFrom}), hsl(${hueB} 70% 55% / ${opacityTo}))`,
    highlight: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3), transparent 50%)`,
  };
}

export function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}
