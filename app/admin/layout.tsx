import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { readSession, SESSION_COOKIE } from "@/lib/admin-auth";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Session guard. Reading the cookie makes the segment request-time, so an
 *  unauthenticated visitor gets a 307 to /admin-login on a document request
 *  instead of a prerendered shell plus a `__next-page-redirect` meta refresh.
 *  The guard renders inline — a streaming boundary here flushed the shell
 *  before the session check ran. `dynamic = "force-dynamic"` and
 *  `dynamicParams` are rejected under `nextConfig.cacheComponents`. */
async function Guard({ children }: { children: React.ReactNode }) {
  const c = await cookies();
  const email = readSession(c.get(SESSION_COOKIE)?.value);
  if (!email) redirect("/admin-login");
  return <AdminShell email={email}>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Guard>{children}</Guard>;
}
