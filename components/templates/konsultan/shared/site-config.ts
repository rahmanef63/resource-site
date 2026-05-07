// Konsultan OS — single source of brand identity.

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
  brandLetter: "K",
  brandName: "Konsultan OS",
  tagline: "Workspace konsultan Indonesia — proposal AI, kontrak ID, PajakAware invoicing.",
  ownerName: "Lorem Konsultan",
  ownerRole: "principal consultant",
  ownerInitials: "LK",
  description:
    "Konsultan OS — workspace untuk konsultan independen & boutique firm Indonesia. Proposal AI, kontrak ID-aware, PPN-aware invoicing.",
  baseUrl: "https://konsultan.id",
  twitter: "@konsultanos",
  email: "halo@konsultan.id",
  bookCallHref: "/preview/konsultan-os/public/contact",
  defaultLocale: "id-ID",
  themeColor: "#0a0a0a",
};
