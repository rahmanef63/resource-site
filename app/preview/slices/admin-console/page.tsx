"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminConsole } from "@/features/admin-console";
import type { AdminAccess } from "@/features/admin-console";

// Public preview: all adapters are in-memory mocks, so a full-admin mock access
// is safe here. Never wire a real backend adapter into a preview page.
const ACCESS: Record<string, AdminAccess> = {
  "platform-admin": { isLoading: false, level: "platform_admin", permissions: ["*"], email: "owner@demo.dev" },
  "content-owner": { isLoading: false, level: "delegated_admin", permissions: ["content.manage"], email: "editor@demo.dev" },
  denied: { isLoading: false, level: "denied", permissions: [], email: null },
};

function Preview() {
  const scenario = useSearchParams().get("scenario") ?? "platform-admin";
  const access = ACCESS[scenario] ?? ACCESS["platform-admin"];
  return (
    <main className="h-screen bg-background">
      <AdminConsole access={access} />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Preview />
    </Suspense>
  );
}
