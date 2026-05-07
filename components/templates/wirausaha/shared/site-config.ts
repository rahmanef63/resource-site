// Wirausaha OS — single source of brand identity.

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
  bookCallHref: "/preview/wirausaha-os/public/contact",
  defaultLocale: "id-ID",
  themeColor: "#0a0a0a",
};
