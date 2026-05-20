// Wirausaha OS — single source of brand identity.

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
export const TEMPLATE_SLUG = "wirausaha-os";
const paths = buildTemplatePaths(TEMPLATE_SLUG);

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandLetter: "W",
  brandName: "Wirausaha OS",
  tagline: "Operasional banyak unit usaha jadi satu — AI bantu narasi laporan.",
  ownerName: "Lorem Wirausaha",
  ownerRole: "founder",
  ownerInitials: "LW",
  description:
    "Wirausaha OS — operasional multi-unit untuk wirausaha Indonesia. Inventory, order, finance, staff dalam satu workspace.",
  baseUrl: "https://wirausaha.id",
  twitter: "@wirausahaos",
  email: "halo@wirausaha.id",
  bookCallHref: `${paths.publicBase}/contact`,
  defaultLocale: "id-ID",
  themeColor: "#0a0a0a",
};
