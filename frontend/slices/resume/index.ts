// audit-allow-hex: the dock-icon gradient is the app's brand mark (appshell
// AppDescriptor contract), not themable chrome.
import { FileText } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//   1. <Resume /> — mount directly; unwired it renders a generic placeholder
//      profile so the CV is fully populated with zero backend.
//   2. `resumeApp` — appshell-style descriptor (lazy `load`) for hosts that
//      mount apps via a dock/launcher manifest.
export { default as Resume } from "./app";

export const resumeApp: AppDescriptor = {
  id: "resume",
  title: "Resume",
  icon: FileText,
  gradient: "linear-gradient(160deg,#0ea5e9,#6366f1)",
  load: () => import("./app"),
  defaultSize: { w: 720, h: 760 },
};

// Host wiring seam (inject your own profile data).
export { configureResume, useResumeProfile } from "./lib/host";
export type {
  ResumeProfile,
  ResumeContact,
  ResumeExperience,
  ResumeProject,
  AppDescriptor,
} from "./lib/host";

export { resumeConfig } from "./config";
export type { ResumeConfig } from "./config";
