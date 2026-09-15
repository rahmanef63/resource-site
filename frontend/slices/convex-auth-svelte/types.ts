import type { Snippet } from "svelte";
import type {
  AuthFlow,
} from "../convex-auth/lib/flow-core";
import type {
  AuthMethod,
  AuthProvider,
  AuthResult,
  PasswordMode,
  SignInLabels,
} from "../convex-auth/types/core";

export type { AuthFlow, AuthMethod, AuthProvider, AuthResult, PasswordMode, SignInLabels };

export interface AuthCardProps {
  methods?: ReadonlyArray<AuthMethod>;
  defaultPasswordMode?: PasswordMode;
  title?: string;
  description?: string;
  labels?: Partial<SignInLabels>;
  footer?: Snippet;
  class?: string;
  forgotPasswordHref?: string | null;
  flow?: Partial<AuthFlow>;
  onGithub?: () => Promise<AuthResult>;
  onPhoneSend?: (phone: string) => Promise<AuthResult>;
  onPhoneVerify?: (phone: string, code: string) => Promise<AuthResult>;
  onSuccess?: (method: AuthMethod) => void | Promise<void>;
}

export interface SignInPageProps {
  flow: AuthFlow;
  appName?: string;
  redirectTo?: string;
  forgotPasswordHref?: string | null;
  providers?: ReadonlyArray<AuthProvider>;
  labels?: Partial<SignInLabels>;
  footer?: Snippet;
  onSuccess?: (provider: AuthProvider) => void | Promise<void>;
}
