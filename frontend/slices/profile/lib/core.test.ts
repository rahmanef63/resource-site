import { describe, expect, it } from "vitest";
import {
  configureAbout,
  configureResume,
  createMockAboutProfile,
  createMockResumeProfile,
  initials,
  readAboutProfile,
  readResumeProfile,
} from "./core";

describe("profile portable core", () => {
  it("keeps resume configuration behind one framework-neutral singleton", () => {
    const next = { ...createMockResumeProfile(), name: "Ada Lovelace" };
    configureResume(next);
    expect(readResumeProfile()).toBe(next);
    configureResume(createMockResumeProfile());
  });

  it("keeps about-card configuration and initials portable", () => {
    const next = { ...createMockAboutProfile(), name: "Grace Brewster Murray Hopper" };
    configureAbout(next);
    expect(readAboutProfile()).toBe(next);
    expect(initials(next.name)).toBe("GB");
    configureAbout(createMockAboutProfile());
  });
});
