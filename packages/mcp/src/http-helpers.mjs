// HTTP helpers — body reading + bearer auth for the streamable HTTP transport.

import { timingSafeEqual } from "node:crypto";

// Cap body size to prevent memory DoS via large POST. 1 MiB is far more than
// any legit JSON-RPC request needs (tools/list responses are ~5 KiB).
export const MAX_BODY_BYTES = 1 * 1024 * 1024;

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let bytes = 0;
    let killed = false;
    req.on("data", (chunk) => {
      if (killed) return;
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        killed = true;
        const err = new Error("body too large");
        err.statusCode = 413;
        req.destroy();
        reject(err);
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      if (killed) return;
      if (!raw) { resolve(undefined); return; }
      try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

// Constant-time bearer compare to defeat timing attacks. Length check first
// avoids leaking length via early-return timing.
export function bearerMatches(provided, expected) {
  if (typeof provided !== "string" || !provided.startsWith("Bearer ")) return false;
  const token = provided.slice(7);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function getArg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
