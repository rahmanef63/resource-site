import { SignIn } from "@/frontend/shared/foundation/auth"

export function SignInForm() {
  return (
    <SignIn routing="hash" fallbackRedirectUrl="/dashboard/overview" />
  );
}
