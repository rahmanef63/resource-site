"use client";

// Single integration seam for the about-profile slice. In the rr catalog the
// slice is SELF-CONTAINED: it renders a GENERIC mock person so the preview is
// fully alive with zero backend. Lifting into a real app: call
// configureAbout(myProfile) with your own identity data — every other file in
// the slice imports ONLY this seam.

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

// ── Shell inspector bus — inert outside a shell ────────────────────────────
export type InspectorInfo = {
  subject?: string;
  props?: { label: string; value: string }[];
  actions?: { id: string; label: string; run: () => void }[];
  context?: string;
  suggestions?: string[];
};
export function usePublishInspector(_appId: string, _info: InspectorInfo, _deps: unknown[]): void {}

// ── App descriptor (appshell-compatible subset the barrel uses) ────────────
export type AppDescriptor = {
  id: string;
  slug?: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  load: () => Promise<{ default: ComponentType }>;
  defaultSize?: { w: number; h: number };
};

// ── Profile model (the injected identity) ──────────────────────────────────
export type AboutLink = { label: string; href: string };
export type AboutFaq = { q: string; a: string };
export type AboutProfile = {
  name: string;
  roles: string[];
  location?: string;
  description: string;
  links: AboutLink[];
  faq: AboutFaq[];
  avatarUrl?: string;
};

// In-browser mock so the card is fully populated with zero backend. Generic
// placeholder person — no real identity is shipped with the slice.
function createMockProfile(): AboutProfile {
  return {
    name: "Alex Rivera",
    roles: ["Product Engineer", "Design Technologist"],
    location: "Remote · GMT+7",
    description:
      "I build small, fast web tools and ship them end to end — from the data model to the pixels. I like systems that stay simple as they grow.",
    links: [
      { label: "Portfolio", href: "https://example.com" },
      { label: "Source", href: "https://example.com/code" },
      { label: "Email", href: "mailto:hello@example.com" },
    ],
    faq: [
      {
        q: "What do you work on?",
        a: "Front-of-stack product work: interfaces, design systems, and the glue that wires them to a backend.",
      },
      {
        q: "Are you available for work?",
        a: "Open to focused collaborations. The fastest way to reach me is the email link above.",
      },
      {
        q: "What is your stack?",
        a: "TypeScript, React, and whatever data layer fits — usually a thin, reactive one.",
      },
    ],
  };
}

let profile: AboutProfile = createMockProfile();

/** Host wiring: swap the mock for your real identity data. */
export function configureAbout(p: AboutProfile): void {
  profile = p;
}

/** Read the currently-configured profile (mock until configureAbout runs). */
export function useAboutProfile(): AboutProfile {
  return profile;
}
