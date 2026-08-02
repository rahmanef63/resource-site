// Slice config (rr: frontend.configExport = "startHereConfig").
export type StartHereConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const startHereConfig: StartHereConfig = {
  slug: "start-here",
  title: "Start Here — guided OS onboarding tour",
  category: "os",
};

export default startHereConfig;
