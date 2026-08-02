// Slice config (rr: frontend.configExport = "profileConfig").
export type ProfileConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const profileConfig: ProfileConfig = {
  slug: "profile",
  title: "Profile — CV + identity card",
  category: "os",
};

export default profileConfig;
