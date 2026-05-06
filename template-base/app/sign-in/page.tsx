"use client";

import * as React from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      formData.append("flow", "signIn");
      await signIn("password", formData);
      router.push("/dashboard/overview");
    } catch (e: any) {
      toast.error(e?.message ?? "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Welcome back.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 grid gap-2">
            <Button variant="outline" className="w-full" onClick={() => signIn("github")}>
              Continue with GitHub
            </Button>
            <Button variant="outline" className="w-full" onClick={() => signIn("google")}>
              Continue with Google
            </Button>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account? <Link href="/sign-up" className="underline">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
