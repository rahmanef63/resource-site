// Framework-neutral marketing chrome contracts + deterministic link/layout helpers.

export interface BrandBase {
  name: string;
  href?: string;
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Cta {
  label: string;
  href: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export type SocialKind = "github" | "x" | "linkedin" | "youtube" | "instagram";

export interface SocialLink {
  kind: SocialKind;
  href: string;
}

export interface LegalLink {
  label: string;
  href: string;
}

export type HeaderLayout = "split" | "centered" | "minimal";
export type FooterLayout = "columns" | "slim";

export type ExternalLinkAttrs =
  | { target: "_blank"; rel: "noreferrer noopener" }
  | Record<string, never>;

export function externalLinkAttrs(external?: boolean): ExternalLinkAttrs {
  return external ? { target: "_blank", rel: "noreferrer noopener" } : {};
}

export function headerShowsInlineNav(layout: HeaderLayout): boolean {
  return layout !== "minimal";
}

/** Secondary CTA renders before primary CTA in both desktop and mobile chrome. */
export function orderedCtas(secondary?: Cta, primary?: Cta): Cta[] {
  return [secondary, primary].filter((cta): cta is Cta => Boolean(cta));
}

export const SOCIAL_TEXT: Record<SocialKind, string> = {
  github: "GH",
  x: "X",
  linkedin: "in",
  youtube: "YT",
  instagram: "IG",
};
