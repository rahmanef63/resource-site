import { buildTemplatePaths } from "@/components/templates/_shared/config/template-paths";

export type SiteConfig = {
  brandLetter: string;
  brandName: string;
  tagline: string;
  studioName: string;
  studioFounded: string;
  description: string;
  baseUrl: string;
  twitter: string;
  email: string;
  bookCallHref: string;
  defaultLocale: "id-ID" | "en-US";
  themeColor: string;
};

/** Canonical slug — rename here, all derived paths follow. */
export const TEMPLATE_SLUG = "agency-studio-os";
const paths = buildTemplatePaths(TEMPLATE_SLUG);

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandLetter: "A",
  brandName: "atelier.studio",
  tagline: "Brand systems for ambitious teams",
  studioName: "Atelier Studio",
  studioFounded: "2019",
  description:
    "We help ambitious B2B teams ship brand systems that scale — strategy, identity, and design ops. Inspired by saudivisuals.com + cescadesigns.",
  baseUrl: "https://atelier.studio",
  twitter: "@atelierstudio",
  email: "halo@atelier.studio",
  bookCallHref: `${paths.publicBase}/contact`,
  defaultLocale: "id-ID",
  themeColor: "#0a0a0a",
};
