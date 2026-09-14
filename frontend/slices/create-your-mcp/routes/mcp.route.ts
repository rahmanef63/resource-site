// Next.js App Router adapter. Copy to app/api/mcp/route.ts.
// The transport/auth/JSON-RPC behavior lives in framework-neutral lib/*.
import { getEnvConvexMcpBackend } from "@/features/create-your-mcp/lib/backend";
import { handleMcpGet, handleMcpPost } from "@/features/create-your-mcp/lib/mcp-http";
import { exampleTools } from "@/features/create-your-mcp/lib/tools/example";

export const runtime = "nodejs";

const serverInfo = { name: "your-app-mcp", version: "0.1.0" };
const instructions =
  "Replace this with workflow guidance, domain rules, and pitfalls for your AI clients.";

export const POST = (req: Request) =>
  handleMcpPost(req, {
    backend: getEnvConvexMcpBackend(),
    tools: exampleTools,
    serverInfo,
    instructions,
  });

export const GET = (req: Request) => handleMcpGet(req);
