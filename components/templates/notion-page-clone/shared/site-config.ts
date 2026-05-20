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
export const TEMPLATE_SLUG = "notion-page-clone-os";
const paths = buildTemplatePaths(TEMPLATE_SLUG);

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandLetter: "N",
  brandName: "nosion",
  productName: "Nosion",
  tagline: "Block-based notes app with KaTeX + code + grid primitives.",
  description:
    "Notion-style writing surface. Drop in equation blocks (KaTeX), code blocks (highlight.js), per-page subscription bells, and drag-fill grid cells — each is a portable rr primitive (notion-blocks bundle).",
  baseUrl: "https://nosion.example.com",
  twitter: "@nosion",
  email: "hi@nosion.example.com",
  ctaPrimary: { label: "Start writing", href: paths.adminPanelBase },
  defaultLocale: "en-US",
  themeColor: "#0a0a0a",
};
