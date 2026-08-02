"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { MarketingHeader } from "./components/MarketingHeader";
import { MarketingFooter } from "./components/MarketingFooter";
import type {
  Brand,
  FooterColumn,
  HeaderLayout,
  FooterLayout,
  NavLink,
  SocialLink,
} from "./lib/types";

const BRAND: Brand = { name: "Acme", href: "#" };

const NAV: NavLink[] = [
  { label: "Product", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Blog", href: "#" },
];

const COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
];

const SOCIAL: SocialLink[] = [
  { kind: "github", href: "#" },
  { kind: "x", href: "#" },
  { kind: "linkedin", href: "#" },
];

const LEGAL = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

const preview: SlicePreviewModule = {
  MarketingHeader: ({ variant }) => (
    <MarketingHeader
      brand={BRAND}
      nav={NAV}
      cta={{ label: "Get started", href: "#" }}
      secondaryCta={{ label: "Sign in", href: "#" }}
      layout={(variant.layout as HeaderLayout) ?? "split"}
    />
  ),
  MarketingFooter: ({ variant }) => (
    <MarketingFooter
      brand={BRAND}
      columns={COLUMNS}
      social={SOCIAL}
      legal={LEGAL}
      copyright="© 2026 Acme, Inc."
      layout={(variant.layout as FooterLayout) ?? "columns"}
    />
  ),
};
export default preview;
