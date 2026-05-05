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
  ctaPrimary: { label: "Start free", href: "/preview/saas-marketing-os/public/pricing" },
  defaultLocale: "en-US",
  themeColor: "#0a0a0a",
};
