// audit-allow-hex: the dock-icon gradient is the app's brand mark (appshell
// AppDescriptor contract), not themable chrome.
import { UserCircle } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//   1. <AboutProfile /> — mount directly; unwired it renders a generic mock
//      person (avatar/monogram, name, roles, links, FAQ) with zero backend.
//   2. `aboutProfileApp` — appshell-style descriptor (lazy `load`) for hosts
//      that mount apps via a dock/launcher manifest.
export { default as AboutProfile } from "./app";

export const aboutProfileApp: AppDescriptor = {
  id: "about-profile",
  title: "About",
  icon: UserCircle,
  gradient: "linear-gradient(160deg,#6366f1,#8b5cf6)",
  load: () => import("./app"),
  defaultSize: { w: 420, h: 600 },
};

// Host wiring seam (inject your real identity data).
export { configureAbout, useAboutProfile } from "./lib/host";
export type {
  AboutProfile as AboutProfileData,
  AboutLink,
  AboutFaq,
} from "./lib/host";

export { aboutProfileConfig } from "./config";
export type { AboutProfileConfig } from "./config";
