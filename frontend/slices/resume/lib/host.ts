"use client";

// Single integration seam for the resume slice. In the rr catalog the slice is
// SELF-CONTAINED: it renders a GENERIC placeholder person so the catalog preview
// is fully alive with zero backend. Lifting into a real app: call
// configureResume(myProfile) once at boot with your own data (Convex query,
// CMS, a JSON file) — every other file imports ONLY this seam.

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

// ── Resume profile (the single injected data shape) ────────────────────────
export type ResumeContact = { label: string; href: string };
export type ResumeExperience = { role: string; org: string; period: string; points: string[] };
export type ResumeProject = { name: string; desc: string; url?: string };

export type ResumeProfile = {
  name: string;
  roles: string[];
  location: string;
  summary: string;
  contacts: ResumeContact[];
  skills: string[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
};

// Generic placeholder person so the slice renders fully alive with zero backend.
function createMockProfile(): ResumeProfile {
  return {
    name: "Alex Rivera",
    roles: ["Product Engineer", "Full-Stack Developer"],
    location: "Remote · GMT+1",
    summary:
      "Product-minded engineer with 8+ years shipping web apps end to end — from data model to pixels. Comfortable owning a feature from discovery through launch and the on-call that follows. I care about fast pages, clean APIs, and interfaces that get out of the way.",
    contacts: [
      { label: "alex@example.com", href: "mailto:alex@example.com" },
      { label: "example.com", href: "https://example.com" },
      { label: "github.com/alexrivera", href: "https://github.com/alexrivera" },
      { label: "linkedin.com/in/alexrivera", href: "https://www.linkedin.com/in/alexrivera" },
    ],
    skills: [
      "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "GraphQL",
      "Tailwind CSS", "AWS", "Docker", "CI/CD", "System Design", "Accessibility",
    ],
    experience: [
      {
        role: "Senior Product Engineer",
        org: "Northwind Labs",
        period: "2022 — Present",
        points: [
          "Led the rebuild of the checkout flow, lifting conversion 18%.",
          "Mentored four engineers and ran the frontend guild.",
          "Cut p95 page load from 3.1s to 0.9s via edge rendering.",
        ],
      },
      {
        role: "Full-Stack Developer",
        org: "Brightside",
        period: "2019 — 2022",
        points: [
          "Shipped a multi-tenant dashboard used by 200+ teams.",
          "Designed the public REST and webhook API.",
          "Owned the migration from a monolith to typed services.",
        ],
      },
      {
        role: "Frontend Developer",
        org: "Loop Studio",
        period: "2017 — 2019",
        points: [
          "Built a component library adopted across five products.",
          "Drove the WCAG AA accessibility pass.",
        ],
      },
    ],
    projects: [
      { name: "Tasklight", desc: "Open-source keyboard-first task manager.", url: "https://example.com/tasklight" },
      { name: "Palette", desc: "Design-token pipeline syncing variables to CSS.", url: "https://example.com/palette" },
      { name: "Driftwood", desc: "Static-site analytics with zero cookies." },
    ],
  };
}

let profile: ResumeProfile = createMockProfile();

/** Host wiring: swap the placeholder for your own profile (Convex, CMS, JSON…). */
export function configureResume(p: ResumeProfile): void {
  profile = p;
}

/** Returns the currently injected profile (mock until configureResume is called). */
export function useResumeProfile(): ResumeProfile {
  return profile;
}
