import { afterEach, describe, expect, it, vi } from "vitest";
import { configureResendNewsletter, newsletterPublicApi, resetResendNewsletter } from "./host";

afterEach(() => resetResendNewsletter());

describe("resend-newsletter host", () => {
  it("fails explicitly while unconfigured", async () => {
    await expect(newsletterPublicApi.subscribe({ email: "a@example.com" })).rejects.toThrow(
      "Newsletter adapter is not configured.",
    );
  });

  it("normalizes input before calling the host adapter", async () => {
    const subscribe = vi.fn(async () => ({ ok: true, already: false }));
    configureResendNewsletter({ subscribe });
    await newsletterPublicApi.subscribe({ email: " USER@Example.com ", website: "  " });
    expect(subscribe).toHaveBeenCalledWith({ email: "user@example.com", website: undefined });
  });
});
