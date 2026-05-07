// Kreator Studio — single source of brand identity.

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
  bookCallHref: "/preview/kreator-studio-os/public/posts",
  defaultLocale: "id-ID",
  themeColor: "#0a0a0a",
};
