import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { readSession, SESSION_COOKIE } from "@/lib/admin-auth";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

async function Guard({ children }: { children: React.ReactNode }) {
  const c = await cookies();
  const email = readSession(c.get(SESSION_COOKIE)?.value);
  if (!email) redirect("/admin-login");
  return <AdminShell email={email}>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
