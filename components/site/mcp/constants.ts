export const CLAUDE_CONFIG = `{
  "mcpServers": {
    "rahman-resources": {
      "command": "npx",
      "args": ["-y", "rahman-resources-mcp"]
    }
  }
}`;

export const CURSOR_CONFIG = `// Cursor: Settings → MCP → New MCP Server
{
  "name": "rahman-resources",
  "command": "npx",
  "args": ["-y", "rahman-resources-mcp"],
  "transport": "stdio"
}`;

export const BRIDGE_CMD = `npx -y supergateway \\
  --stdio "npx -y rahman-resources-mcp" \\
  --outputTransport streamableHttp \\
  --port 8000
# endpoint: http://localhost:8000/mcp`;

export const TUNNEL_CMD = `# pick one — terminal stays open while connector is in use
npx -y cloudflared tunnel --url http://localhost:8000
# or
ngrok http 8000`;
