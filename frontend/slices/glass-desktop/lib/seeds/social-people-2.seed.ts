// glass-desktop — social-people-2 batch seed (Build Plan §7, LOC-exempt seed).
// social-count (×2 instances) + contact-card render only from these values.
// Fictional platforms/people only per §2 IP guardrail (Wavelength, Loop, Maya Okafor).

/** lucide glyph key resolved to a component in the widget (seeds stay data-only). */
export type SocialGlyph = "audio-lines" | "play";

export interface SocialCountSeed {
  platform: string;
  /** headline follower/subscriber tally, pre-formatted (e.g. "12.4K"). */
  count: string;
  /** metric noun under the count. */
  unit: string;
  /** weekly delta, pre-formatted (e.g. "+214/wk"). */
  delta: string;
  glyph: SocialGlyph;
  /** CSS custom-property reference for the glyph + accent line. */
  accent: string;
}

export type SocialPlatform = "wavelength" | "loop";

export const socialCountSeed: Record<SocialPlatform, SocialCountSeed> = {
  wavelength: {
    platform: "Wavelength",
    count: "12.4K",
    unit: "followers",
    delta: "+214/wk",
    glyph: "audio-lines",
    accent: "var(--color-accent-violet)",
  },
  loop: {
    platform: "Loop",
    count: "8.9K",
    unit: "subscribers",
    delta: "+96/wk",
    glyph: "play",
    accent: "var(--color-accent-coral)",
  },
};

export type ContactAction = "message" | "call" | "video" | "mail";

export interface ContactCardSeed {
  name: string;
  initials: string;
  /** short role/handle line under the name. */
  handle: string;
  /** CSS custom-property reference for the avatar fill. */
  accent: string;
  actions: ContactAction[];
}

export const contactCardSeed: ContactCardSeed = {
  name: "Maya Okafor",
  initials: "MO",
  handle: "Product design",
  accent: "var(--color-accent-blue)",
  actions: ["message", "call", "video", "mail"],
};
