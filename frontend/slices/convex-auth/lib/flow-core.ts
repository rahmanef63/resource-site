import { extractAuthError } from "./index";
import type {
  AuthResult,
  PasswordCredentials,
  RegisterCredentials,
} from "../types/core";

export type AuthSignIn = (provider: string, params?: FormData) => Promise<unknown>;
export type AuthSignOut = () => Promise<unknown>;

export interface AuthFlow {
  signInWithPassword: (credentials: PasswordCredentials) => Promise<AuthResult>;
  signUpWithPassword: (credentials: RegisterCredentials) => Promise<AuthResult>;
  signInAnonymous: () => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  sendMagicLink: (email: string) => Promise<AuthResult>;
  signOut: AuthSignOut;
}

export function createAuthFlow(actions: {
  signIn: AuthSignIn;
  signOut: AuthSignOut;
}): AuthFlow {
  const wrap = async (run: () => Promise<unknown>): Promise<AuthResult> => {
    try {
      await run();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: extractAuthError(error) };
    }
  };

  return {
    signInWithPassword: (credentials) =>
      wrap(() => {
        const form = new FormData();
        form.set("email", credentials.email);
        form.set("password", credentials.password);
        form.set("flow", "signIn");
        return actions.signIn("password", form);
      }),
    signUpWithPassword: (credentials) =>
      wrap(() => {
        const form = new FormData();
        form.set("email", credentials.email);
        form.set("password", credentials.password);
        if (credentials.name) form.set("name", credentials.name);
        form.set("flow", "signUp");
        return actions.signIn("password", form);
      }),
    signInAnonymous: () => wrap(() => actions.signIn("anonymous")),
    signInWithGoogle: () => wrap(() => actions.signIn("google")),
    sendMagicLink: (email) =>
      wrap(() => {
        const form = new FormData();
        form.set("email", email);
        return actions.signIn("resend", form);
      }),
    signOut: actions.signOut,
  };
}

export function createMockAuthFlow(): AuthFlow {
  const ok = async (): Promise<AuthResult> => ({ ok: true });
  return {
    signInWithPassword: ok,
    signUpWithPassword: ok,
    signInAnonymous: ok,
    signInWithGoogle: ok,
    sendMagicLink: ok,
    signOut: async () => undefined,
  };
}
