export type ResumeContact = { label: string; href: string };
export type ResumeExperience = {
  role: string;
  org: string;
  period: string;
  points: string[];
};
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

export function createMockResumeProfile(): ResumeProfile {
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

export function createMockAboutProfile(): AboutProfile {
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

let resumeProfile = createMockResumeProfile();
let aboutProfile = createMockAboutProfile();

export function configureResume(profile: ResumeProfile): void {
  resumeProfile = profile;
}

export function readResumeProfile(): ResumeProfile {
  return resumeProfile;
}

export function configureAbout(profile: AboutProfile): void {
  aboutProfile = profile;
}

export function readAboutProfile(): AboutProfile {
  return aboutProfile;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
