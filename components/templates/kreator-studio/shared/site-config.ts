// Kreator Studio — single source of brand identity.

import { buildTemplatePaths } from "@/components/templates/_shared/config/template-paths";

export type SiteConfig = {
  brandLetter: string;
  brandName: string;
  tagline: string;
  ownerName: string;
  ownerRole: string;
  ownerInitials: string;
  description: string;
  baseUrl: string;
  twitter: string;
  email: string;
  bookCallHref: string;
  defaultLocale: "id-ID" | "en-US";
  themeColor: string;
};

/** Canonical slug — rename here, all derived paths follow. */
export const TEMPLATE_SLUG = "kreator-studio-os";
const paths = buildTemplatePaths(TEMPLATE_SLUG);

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandLetter: "K",
  brandName: "Kreator Studio",
  tagline: "Multi-channel content planner + voice trainer + repurposing engine.",
  ownerName: "Lorem Kreator",
  ownerRole: "creator",
  ownerInitials: "LK",
  description:
    "Kreator Studio — workspace untuk content creator Indonesia. Plan multi-channel, train brand voice, repurpose otomatis dari satu source.",
  baseUrl: "https://kreator.dev",
  twitter: "@kreatorstudio",
  email: "halo@kreator.dev",
  bookCallHref: `${paths.publicBase}/posts`,
  defaultLocale: "id-ID",
  themeColor: "#0a0a0a",
};
