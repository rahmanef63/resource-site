// sha256 → base64url, for hashing a bearer before it is sent to Convex.
//
// DELIBERATE DUPLICATE of `sha256Base64Url` in
// convex/features/create_your_mcp/_pkce.ts. The two halves of this slice
// install independently and neither may import across the boundary, so the
// digest function is defined on both sides. They MUST stay byte-compatible:
// the Convex half hashes the token it mints, this half hashes the token a
// client presents, and a mismatch makes every bearer fail to validate.
//
// Uses the Web Crypto global — present in Node 18+, the Edge runtime and
// the Convex isolate alike, so the slice stays portable across all three.

const toBase64Url = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const sha256Base64Url = async (input: string): Promise<string> => {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return toBase64Url(buf);
};
