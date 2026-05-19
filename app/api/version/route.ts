import { NextResponse } from "next/server";

/** Always-fresh build identifier. VersionWatcher polls this and prompts
 *  reload when the value differs from the build it loaded with. Cache
 *  headers explicit so no intermediate proxy (Traefik / Dokploy /
 *  Cloudflare) serves a stale copy. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  const buildId =
    process.env.NEXT_PUBLIC_BUILD_ID ||
    process.env.NEXT_DEPLOYMENT_ID ||
    "unknown";
  return NextResponse.json(
    { buildId, deployedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
