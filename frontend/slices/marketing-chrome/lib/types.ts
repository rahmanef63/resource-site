import type * as React from "react";
import type {
  BrandBase,
  Cta,
  FooterColumn,
  FooterLayout,
  HeaderLayout,
  LegalLink,
  NavLink,
  SocialKind,
  SocialLink,
} from "./core";

export type {
  BrandBase,
  Cta,
  FooterColumn,
  FooterLayout,
  HeaderLayout,
  LegalLink,
  NavLink,
  SocialKind,
  SocialLink,
} from "./core";

/** React default adapter adds a ReactNode logo to the portable brand identity. */
export interface Brand extends BrandBase {
  logo?: React.ReactNode;
}

export interface MarketingHeaderProps {
  brand: Brand;
  nav: NavLink[];
  cta?: Cta;
  secondaryCta?: Cta;
  layout?: HeaderLayout;
  sticky?: boolean;
  className?: string;
}

export interface MarketingFooterProps {
  brand: Brand;
  columns?: FooterColumn[];
  social?: SocialLink[];
  legal?: LegalLink[];
  copyright?: string;
  layout?: FooterLayout;
  className?: string;
}
