import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

export type TokenLookup = { _id: string; scope: string | null } | null;
export type ExchangeCodeArgs = {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  clientId: string;
};
export type ExchangeCodeResult = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
};

export type McpBackend = {
  findToken: (tokenHash: string) => Promise<TokenLookup>;
  touchToken: (tokenHash: string) => Promise<unknown>;
  exchangeCode: (args: ExchangeCodeArgs) => Promise<ExchangeCodeResult>;
};

const findTokenRef = makeFunctionReference<
  "query",
  { tokenHash: string },
  TokenLookup
>("features/create_your_mcp/query:findToken");
const touchTokenRef = makeFunctionReference<
  "mutation",
  { tokenHash: string },
  unknown
>("features/create_your_mcp/mutation:touchToken");
const exchangeCodeRef = makeFunctionReference<
  "mutation",
  ExchangeCodeArgs,
  ExchangeCodeResult
>("features/create_your_mcp/mutation:exchangeCode");

export function createConvexMcpBackend(deploymentUrl: string): McpBackend {
  if (!deploymentUrl) {
    throw new Error(
      "Missing Convex URL. Set CONVEX_URL, NEXT_PUBLIC_CONVEX_URL, or PUBLIC_CONVEX_URL.",
    );
  }
  const client = new ConvexHttpClient(deploymentUrl);
  return {
    findToken: (tokenHash) => client.query(findTokenRef, { tokenHash }),
    touchToken: (tokenHash) => client.mutation(touchTokenRef, { tokenHash }),
    exchangeCode: (args) => client.mutation(exchangeCodeRef, args),
  };
}

let cached: { url: string; backend: McpBackend } | null = null;
export function getEnvConvexMcpBackend(): McpBackend {
  const url =
    process.env.CONVEX_URL ??
    process.env.NEXT_PUBLIC_CONVEX_URL ??
    process.env.PUBLIC_CONVEX_URL ??
    "";
  if (!cached || cached.url !== url) cached = { url, backend: createConvexMcpBackend(url) };
  return cached.backend;
}
