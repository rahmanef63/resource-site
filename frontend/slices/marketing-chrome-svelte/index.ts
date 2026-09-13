export { default as MarketingHeader } from "./components/MarketingHeader.svelte";
export { default as MarketingFooter } from "./components/MarketingFooter.svelte";
export { marketingChromeFeature } from "./config";
export {
  externalLinkAttrs,
  headerShowsInlineNav,
  orderedCtas,
  SOCIAL_TEXT,
} from "../marketing-chrome/lib/core";
export type {
  BrandBase,
  Cta,
  FooterColumn,
  FooterLayout,
  FooterLink,
  HeaderLayout,
  LegalLink,
  NavLink,
  SocialKind,
  SocialLink,
} from "../marketing-chrome/lib/core";
export { marketingChromeTools, type MarketingChromeConfigureCtx } from "../marketing-chrome/lib/tools";
