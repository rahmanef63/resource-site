import type { ReactNode } from "react";
import type { SignInPageCoreProps } from "./core";

export type {
  AuthMethod,
  AuthProvider,
  AuthResult,
  PasswordCredentials,
  PasswordMode,
  RegisterCredentials,
  SignInLabels,
  SignInPageCoreProps,
} from "./core";

export interface SignInPageProps extends SignInPageCoreProps {
  /** Optional React footer; Svelte exposes an equivalent footer snippet. */
  footer?: ReactNode;
}
