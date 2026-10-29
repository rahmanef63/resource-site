import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

// Client component cannot export metadata — this route stays a server
// component so the auth surface is never indexable.
export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-sm flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Restricted area. Editors only.
          </p>
        </div>
        {/* The form reads `useSearchParams`, so it needs its own boundary. */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
