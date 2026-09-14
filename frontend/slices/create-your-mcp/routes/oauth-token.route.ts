// Next.js App Router adapter. Copy to app/api/oauth/token/route.ts.
import { getEnvConvexMcpBackend } from "@/features/create-your-mcp/lib/backend";
import {
  handleOauthTokenGet,
  handleOauthTokenPost,
} from "@/features/create-your-mcp/lib/oauth-http";

export const runtime = "nodejs";

export const POST = (req: Request) => handleOauthTokenPost(req, getEnvConvexMcpBackend());
export const GET = () => handleOauthTokenGet();
