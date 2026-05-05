// Personal Brand OS — single source of brand identity.
// All UI (nav, footer, sidebar, metadata, og-image, sitemap) reads from here.
// Edit-driven: SettingsView writes patches via store; values fall back to these defaults.

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

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandLetter: "L",
  brandName: "lorem.dev",
  tagline: "Personal brand operating system",
  ownerName: "Lorem Dolor",
  ownerRole: "owner",
  ownerInitials: "LD",
  description:
    "Lorem ipsum dolor sit amet — strategist, writer, and educator. Public site + admin dashboard powered by Personal Brand OS.",
  baseUrl: "https://lorem.dev",
  twitter: "@loremdev",
  email: "halo@lorem.dev",
  bookCallHref: "/preview/personal-brand-os/public/services",
  defaultLocale: "id-ID",
  themeColor: "#0a0a0a",
};
