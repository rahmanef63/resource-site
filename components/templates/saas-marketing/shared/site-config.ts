import { buildTemplatePaths } from "@/components/templates/_shared/config/template-paths";

export type SiteConfig = {
  brandLetter: string;
  brandName: string;
  productName: string;
  tagline: string;
  description: string;
  baseUrl: string;
  twitter: string;
  email: string;
  ctaPrimary: { label: string; href: string };
  defaultLocale: "id-ID" | "en-US";
  themeColor: string;
};

/** Canonical slug — rename here, all derived paths follow. */
export const TEMPLATE_SLUG = "saas-marketing-os";
const paths = buildTemplatePaths(TEMPLATE_SLUG);

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandLetter: "L",
  brandName: "lumen",
  productName: "Lumen",
  tagline: "The fastest way to ship signed PDFs from your app.",
  description:
    "Lumen is a developer-first PDF signing API. Drop in a webhook, get back a signed document. Generous free tier, EU + US data residency.",
  baseUrl: "https://lumen.dev",
  twitter: "@lumendev",
  email: "hi@lumen.dev",
  ctaPrimary: { label: "Start free", href: `${paths.publicBase}/pricing` },
  defaultLocale: "en-US",
  themeColor: "#0a0a0a",
};
