/**
 * settings-page adapter contract.
 *
 * The slice is persistence-agnostic. The consumer owns where settings live
 * (Convex, REST, localStorage, …) by implementing `SettingsAdapter`. The slice
 * only ever calls `load()` once on mount and `save(patch)` on each section
 * save. A `createMemoryAdapter()` is shipped for demos and tests.
 */

export type ThemePref = "light" | "dark" | "system";
export type DensityPref = "compact" | "comfortable";

export interface SettingsProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

export interface SettingsPreferences {
  theme: ThemePref;
  language: string;
  density: DensityPref;
}

export interface SettingsNotifications {
  emailDigest: boolean;
  productUpdates: boolean;
  mentions: boolean;
  sms: boolean;
}

export interface SettingsValues {
  profile: SettingsProfile;
  preferences: SettingsPreferences;
  notifications: SettingsNotifications;
}

export interface SettingsAdapter {
  load(): Promise<SettingsValues>;
  save(patch: Partial<SettingsValues>): Promise<void>;
}

/** Sensible empty defaults — used as the memory adapter seed fallback. */
export const DEFAULT_SETTINGS: SettingsValues = {
  profile: { name: "", email: "", avatarUrl: undefined, bio: "" },
  preferences: { theme: "system", language: "en", density: "comfortable" },
  notifications: {
    emailDigest: true,
    productUpdates: true,
    mentions: true,
    sms: false,
  },
};

/**
 * In-memory adapter for demos/tests. Holds a single mutable record; `save`
 * shallow-merges each section so partial patches don't clobber siblings.
 */
export function createMemoryAdapter(seed?: Partial<SettingsValues>): SettingsAdapter {
  let store: SettingsValues = {
    profile: { ...DEFAULT_SETTINGS.profile, ...seed?.profile },
    preferences: { ...DEFAULT_SETTINGS.preferences, ...seed?.preferences },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...seed?.notifications },
  };

  return {
    async load() {
      return {
        profile: { ...store.profile },
        preferences: { ...store.preferences },
        notifications: { ...store.notifications },
      };
    },
    async save(patch) {
      store = {
        profile: { ...store.profile, ...patch.profile },
        preferences: { ...store.preferences, ...patch.preferences },
        notifications: { ...store.notifications, ...patch.notifications },
      };
    },
  };
}
