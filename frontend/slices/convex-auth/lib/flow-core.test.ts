import { describe, expect, it, vi } from "vitest";
import { createAuthFlow } from "./flow-core";

describe("convex-auth flow core", () => {
  it("normalizes password sign-in into provider form data", async () => {
    const signIn = vi.fn(async (_provider: string, _form?: FormData) => undefined);
    const flow = createAuthFlow({ signIn, signOut: async () => undefined });
    await expect(flow.signInWithPassword({ email: "a@example.com", password: "Pass1234" })).resolves.toEqual({ ok: true });
    const [provider, form] = signIn.mock.calls[0];
    expect(provider).toBe("password");
    expect(form?.get("email")).toBe("a@example.com");
    expect(form?.get("flow")).toBe("signIn");
  });

  it("normalizes provider errors for every framework adapter", async () => {
    const flow = createAuthFlow({
      signIn: async () => { throw new Error("[Request ID: 123] Server Error\nUncaught Error: Wrong password"); },
      signOut: async () => undefined,
    });
    await expect(flow.signInWithGoogle()).resolves.toEqual({ ok: false, error: "Wrong password" });
  });
});
