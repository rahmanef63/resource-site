import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./adapter";
import { mergeSettingsValues, settingsProfileInitials } from "./core";

const values = () => ({
  profile: { ...DEFAULT_SETTINGS.profile, name: "Rahman Fakhrul", email: "r@example.com" },
  preferences: { ...DEFAULT_SETTINGS.preferences, language: "id" },
  notifications: { ...DEFAULT_SETTINGS.notifications },
});

describe("settings core", () => {
  it("merges one section without clobbering siblings", () => {
    const current = values();
    const next = mergeSettingsValues(current, {
      preferences: { ...current.preferences, theme: "dark" },
    });
    expect(next.preferences.theme).toBe("dark");
    expect(next.profile).toEqual(current.profile);
    expect(next.notifications).toEqual(current.notifications);
  });

  it("merges partial nested values within every section", () => {
    const current = values();
    const next = mergeSettingsValues(current, {
      profile: { ...current.profile, bio: "Builder" },
      notifications: { ...current.notifications, sms: true },
    });
    expect(next.profile).toMatchObject({ name: "Rahman Fakhrul", bio: "Builder" });
    expect(next.notifications).toMatchObject({ emailDigest: true, sms: true });
  });

  it("derives stable two-letter profile initials", () => {
    expect(settingsProfileInitials({ name: "Rahman Fakhrul" })).toBe("RF");
    expect(settingsProfileInitials({ name: "" })).toBe("?");
  });
});
