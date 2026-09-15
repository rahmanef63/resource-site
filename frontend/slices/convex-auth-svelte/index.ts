export { default as AuthCard } from "./components/AuthCard.svelte";
export { default as SignInPage } from "./components/SignInPage.svelte";
export { convexAuthConfig } from "./config";
export type { AuthCardProps, SignInPageProps } from "./types";
export type {
  AuthFlow,
  AuthMethod,
  AuthProvider,
  AuthResult,
  PasswordMode,
  SignInLabels,
} from "./types";
export { createAuthFlow, createMockAuthFlow } from "../convex-auth/lib/flow-core";
export { extractAuthError, looksLikeAutofillBug, validatePassword } from "../convex-auth/lib";
export { DEFAULT_LABELS } from "../convex-auth/lib/labels";
