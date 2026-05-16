// Socials slice — single source of truth for profile links.
// Drives JSON-LD Person.sameAs + IndieWeb <link rel="me"> tags +
// footer/contact/about UI surfaces. Convex schema/queries/mutations
// at convex/features/socials/.

export { socialsFeature } from "./config";

export type SocialLink = {
  _id: string;
  platform: string;
  url: string;
  handle?: string;
  label?: string;
  order: number;
  visible: boolean;
  featured?: boolean;
  relMe?: boolean;
  sameAs?: boolean;
  createdAt: number;
};
