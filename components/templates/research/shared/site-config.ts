// Riset Kit — single source of brand identity.

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

/** Canonical slug — rename here, all derived paths follow.
 *  NOTE: dir name "research" but sandbox slug "riset-kit". */
export const TEMPLATE_SLUG = "riset-kit";
const paths = buildTemplatePaths(TEMPLATE_SLUG);

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandLetter: "R",
  brandName: "Riset Kit",
  tagline: "Workspace riset — baca PDF, review literatur, draft tesis dalam satu tempat.",
  ownerName: "Lorem Peneliti",
  ownerRole: "principal investigator",
  ownerInitials: "LP",
  description:
    "Riset Kit — workspace riset akademik & think-tank. Document QA, lit review matrix, citation manager, dan AI Reader yang paham EYD.",
  baseUrl: "https://riset.dev",
  twitter: "@risetkit",
  email: "halo@riset.dev",
  bookCallHref: `${paths.publicBase}/about`,
  defaultLocale: "id-ID",
  themeColor: "#0a0a0a",
};
