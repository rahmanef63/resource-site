export { default as AdminPage } from "./page";
export { AdminShell } from "./components/AdminShell";
export { AccessGate } from "./components/AccessGate";
export { useAdminAccess, type AdminAccess, type AdminAccessLevel } from "./hooks/useAdminAccess";
export { ADMIN_SECTIONS, type AdminSection } from "./config";

// Event tracking SDK
export {
  initEventTracking,
  trackEvent,
  trackPageView,
  trackSignupStart,
  trackSignupComplete,
  trackLogin,
  trackLogout,
  type TrackEventInput,
} from "./slices/events/lib/track-event";
