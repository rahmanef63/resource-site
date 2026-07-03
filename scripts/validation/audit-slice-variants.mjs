// audit-slice-variants.mjs — variant-block gate for slice.json (shadcn-style).
// Extracted so audit-slice.mjs stays ≤200 LOC. Contract:
// docs/slice-architecture.md#variants-shadcn-style.

import { existsSync } from "node:fs";
import path from "node:path";

// Every declared variant id needs a variants/<id>/ folder; `default` must be
// one of the ids; shared/ (if named) must exist. Guards author error before
// the CLI silently treats a missing variant as a target dir. Returns error
// strings — empty array for slices without a `variants` block.
export function variantErrors(slice) {
  const v = slice.variants;
  if (!v) return [];
  const out = [];
  const ids = (v.items ?? []).map((x) => x.id);
  for (const id of ids)
    if (!existsSync(path.join(slice.dir, "variants", id)))
      out.push(`[${slice.folder}] declares variant "${id}" but variants/${id}/ is missing`);
  if (v.default && !ids.includes(v.default))
    out.push(`[${slice.folder}] variants.default "${v.default}" not in items [${ids.join(", ")}]`);
  if (v.shared && !existsSync(path.join(slice.dir, v.shared)))
    out.push(`[${slice.folder}] variants.shared "${v.shared}" folder is missing`);
  return out;
}
