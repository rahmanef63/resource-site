export type AuthResult = { ok: true } | { ok: false; error: string };

export interface PasswordCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends PasswordCredentials {
  name?: string;
}

export type AuthProvider = "password" | "magic-link" | "google" | "anonymous";

export type AuthMethod = AuthProvider | "github" | "phone";
export type PasswordMode = "signin" | "signup";

export interface SignInLabels {
  title: string;
  description: string;
  divider: string;
  loginTab: string;
  registerTab: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholderLogin: string;
  passwordPlaceholderRegister: string;
  passwordHint: string;
  nameLabel: string;
  namePlaceholder: string;
  forgotPassword: string;
  loginButton: string;
  loginButtonLoading: string;
  registerButton: string;
  registerButtonLoading: string;
  googleButton: string;
  googleButtonLoading: string;
  anonymousButton: string;
  anonymousButtonLoading: string;
  anonymousHint: string;
  anonymousTryHint: string;
  magicLinkButton: string;
  magicLinkButtonLoading: string;
  magicLinkHint: string;
  autofillEmailInPasswordError: string;
  genericError: string;
}

export interface SignInPageCoreProps {
  appName?: string;
  redirectTo?: string;
  forgotPasswordHref?: string | null;
  providers?: ReadonlyArray<AuthProvider>;
  labels?: Partial<SignInLabels>;
  onSuccess?: (provider: AuthProvider) => void | Promise<void>;
}
