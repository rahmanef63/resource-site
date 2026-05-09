"use client";

// Sign-in page stub. Replace with the canonical pattern from
// superspace/frontend/slices/auth/components/sign-in-form.tsx via:
//
//   npx rahman-resources lift superspace:frontend/slices/auth/components .

import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
      <Card className="p-6">
        <h1 className="mb-2 text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Stub form — wire to <code>useAuthActions().signIn(&quot;resend&quot;, ...)</code>.
        </p>
      </Card>
    </main>
  );
}
