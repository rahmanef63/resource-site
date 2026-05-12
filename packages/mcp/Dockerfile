# rahman-resources-mcp — HTTP MCP server for ChatGPT Apps SDK + general clients.
# Stateless Streamable HTTP at /mcp. Read-only kitab manifest, no DB.
#
# Build context = packages/mcp/. The dep `rahman-resources` (npm) ships the
# manifest, so the container is tiny — no monorepo copy needed.

FROM node:20-alpine

WORKDIR /app

# Install deps first (cacheable layer).
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Then code.
COPY bin ./bin
COPY src ./src

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8000
EXPOSE 8000

# Liveness — Dokploy / docker swarm probe.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8000/health > /dev/null || exit 1

CMD ["node", "bin/server.mjs", "--http"]
