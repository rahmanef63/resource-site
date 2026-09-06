# rahman-resources-mcp — HTTP MCP server for ChatGPT Apps SDK + general clients.
# Stateless Streamable HTTP at /mcp. Read-only kitab manifest, no DB.
#
# Build context = packages/mcp/. Runtime catalog data is a generated snapshot
# under runtime/rahman-resources, verified against the CLI SSOT before release.

FROM node:20-alpine

WORKDIR /app

# Install deps first (cacheable layer). Owned by root so app code can't
# mutate node_modules at runtime even if exploit lands.
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Then code.
COPY bin ./bin
COPY src ./src
COPY runtime ./runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8000
EXPOSE 8000

# Liveness — Dokploy / docker swarm probe.
# Use 127.0.0.1 (not "localhost") — busybox wget resolves localhost to ::1 first
# on alpine, which fails because node's "0.0.0.0" listen binds IPv4 only.
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8000/health > /dev/null || exit 1

# Drop root. node:20-alpine ships a `node` user (uid 1000). Code is owned by
# root so the app cannot tamper with its own binary/deps.
USER node

CMD ["node", "bin/server.mjs", "--http"]
