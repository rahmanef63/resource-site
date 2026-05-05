import type { FooterColumn, NavItem } from "@/components/templates/_shared/types/common";
import { DEFAULT_SITE_CONFIG } from "./site-config";

export const PUBLIC_BASE = "/preview/saas-marketing-os/public";

export const PUBLIC_NAV: NavItem[] = [
  { label: "Features",  href: `${PUBLIC_BASE}/features` },
  { label: "Pricing",   href: `${PUBLIC_BASE}/pricing` },
  { label: "Blog",      href: `${PUBLIC_BASE}/blog` },
  { label: "Changelog", href: `${PUBLIC_BASE}/changelog` },
  { label: "About",     href: `${PUBLIC_BASE}/about` },
  { label: "Contact",   href: `${PUBLIC_BASE}/contact` },
];

export const PUBLIC_CTA = DEFAULT_SITE_CONFIG.ctaPrimary;

export const FOOTER_COLUMNS: FooterColumn[] = [
  { heading: "Product", items: PUBLIC_NAV.slice(0, 4) },
  { heading: "Company", items: PUBLIC_NAV.slice(4) },
  {
    heading: "Connect",
    items: [
      { label: DEFAULT_SITE_CONFIG.email,   href: `mailto:${DEFAULT_SITE_CONFIG.email}` },
      { label: DEFAULT_SITE_CONFIG.twitter, href: `https://twitter.com/${DEFAULT_SITE_CONFIG.twitter.replace("@", "")}` },
    ],
  },
];

export const FOOTER_TAGLINE = "Built with SaaS Marketing OS";
