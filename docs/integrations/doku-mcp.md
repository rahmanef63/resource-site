# DOKU MCP Integration

DOKU MCP is an optional agentic-payment surface. It is separate from the `doku-payment` slice and from DOKU's REST payment `Secret Key`.

## SSOT and credential boundary

Rahman Resources owns **public setup definitions only**. It never stores DOKU credential values.

- RR: field labels, official endpoints, setup steps, validation rules, security guidance.
- MSO Integrations: private named DOKU Payment and DOKU MCP credential authority. Payment uses Client ID + HMAC Secret Key; MCP uses Client ID + MCP API Key. The methods never substitute for each other.
- Deployment secret store: runtime destination for DOKU Payment credentials when a consumer backend needs them; it is not the credential source of truth.
- Baton: project binding, inheritance/override choice, setup status, blocker, and verification evidence.
- Project/deployment: only the runtime secret reference/injection required by the consumer; never a copied RR/Baton credential value.

Do not paste DOKU keys into chat, project notes, `rr.json`, MCP resources, Git, or a committed `.mcp.json`.

## Official endpoints

DOKU currently documents Streamable HTTP MCP endpoints as:

| Environment | Endpoint |
|---|---|
| Sandbox | `https://api-sandbox.doku.com/doku-mcp-server/mcp` |
| Production | `https://mcp.doku.com/mcp` |

The DOKU MCP form requires a DOKU Client ID and DOKU API Key. Keep the API Key private. The MCP API Key is a different field from the HMAC `DOKU_SECRET_KEY` used by Checkout/Direct REST signing.

## Setup flow

1. Open the official DOKU MCP Server guide and choose Sandbox first.
2. Obtain/enable the DOKU Client ID and MCP API Key for the intended environment.
3. Create or select a **named DOKU MCP connection in MSO Integrations**. Enter credentials only through the private setup surface; never through Baton/RR/chat arguments.
4. In Baton, bind that named connection to the project that needs agentic payments. A workspace/global account may be inherited by children; a child can override its resource/connection when it uses a different merchant/environment.
5. Configure the MCP client using the official endpoint and runtime-injected headers from the private connection.
6. Verify with a bounded non-destructive MCP capability/tool-list check before enabling payment mutations.
7. Record only sanitized verification evidence/status in Baton.

## Payment API vs MCP

For ordinary application checkout, use the `payment doku` slice. Its REST credentials are owned by the named DOKU Payment connection in MSO Integrations and injected server-side into the consumer deployment when needed:

- `DOKU_CLIENT_ID`
- `DOKU_SECRET_KEY`
- `DOKU_IS_PRODUCTION` (explicit environment switch; Sandbox by default)

DOKU Checkout currently documents Sandbox `https://api-sandbox.doku.com/checkout/v1/payment` and Production `https://api.doku.com/checkout/v1/payment`.

For AI-agent direct payment tools, use DOKU MCP with its Client ID + MCP API Key and the MCP endpoint above. Do not assume the REST Secret Key and MCP API Key are interchangeable.

## Safe helper

`node scripts/setup-doku-mcp.mjs` now creates a **credential-free example** only. It never reads DOKU secrets and never writes an active `.claude/mcp.json`. Its output is documentation for the client/integration layer; private values must still come from MSO Integrations at runtime.

## Security

- Start in Sandbox and require human approval for payment-creating/refund tools until the project has explicit production policy.
- Keep the MCP tool allowlist narrow; read/status tools can be enabled before mutation tools.
- Payment notification/webhook handlers remain authoritative for final payment status and must verify signatures/idempotency.
- Use separate named connections when different projects use different DOKU merchants or environments.
- Never encode a secret merely to make it "safe"; Base64 is not encryption.

## Sources

- DOKU MCP Server: https://developers.doku.com/accept-payments/doku-mcp-server
- Retrieve Payment Credential: https://developers.doku.com/get-started-with-doku-api/retrieve-payment-credential
- DOKU Checkout Integration Guide: https://developers.doku.com/accept-payments/doku-checkout/integration-guide
