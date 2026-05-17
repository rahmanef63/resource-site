// Per-flag mutation ops for modify-slice.mjs. Each op:
//   - mutates sliceJson in place
//   - returns the updated entryBody string (after applying the corresponding patch)
//   - pushes a human-readable label to `ops` for the summary

import {
  csv, uniqMerge, mergeBy, bumpSemver,
  patchArrayField, patchObjectArrayField, patchStringField,
} from "./modify-slice-helpers.mjs";

export function applyOps({ args, sliceJson, entryBody, ops, fail }) {
  if (args["add-npm"]) {
    const pkgs = csv(args["add-npm"]);
    sliceJson.deps = sliceJson.deps ?? {};
    sliceJson.deps.npm = uniqMerge(sliceJson.deps.npm ?? [], pkgs);
    entryBody = patchArrayField(entryBody, "npm", sliceJson.deps.npm);
    ops.push(`npm += ${pkgs.join(", ")}`);
  }

  if (args["add-shadcn"]) {
    const names = csv(args["add-shadcn"]);
    sliceJson.deps = sliceJson.deps ?? {};
    sliceJson.deps.shadcn = uniqMerge(sliceJson.deps.shadcn ?? [], names);
    entryBody = patchArrayField(entryBody, "shadcn", sliceJson.deps.shadcn);
    ops.push(`shadcn += ${names.join(", ")}`);
  }

  if (args["add-tag"]) {
    const tags = csv(args["add-tag"]);
    sliceJson.tags = uniqMerge(sliceJson.tags ?? [], tags);
    entryBody = patchArrayField(entryBody, "tags", sliceJson.tags);
    ops.push(`tags += ${tags.join(", ")}`);
  }

  if (args["add-peer"]) {
    const peers = csv(args["add-peer"]).map((p) => {
      const [pSlug, range] = p.split("@");
      if (!pSlug || !range) fail(`--add-peer expects slug@range (got "${p}")`);
      return { slug: pSlug, range };
    });
    sliceJson.deps = sliceJson.deps ?? {};
    sliceJson.deps.peers = mergeBy(sliceJson.deps.peers ?? [], peers, "slug");
    entryBody = patchObjectArrayField(entryBody, "peers", sliceJson.deps.peers);
    ops.push(`peers += ${peers.map((p) => `${p.slug}@${p.range}`).join(", ")}`);
  }

  if (args["add-env"]) {
    const [name, scope, req] = String(args["add-env"]).split(":");
    if (!name || !scope) fail(`--add-env expects NAME:scope[:required]`);
    const required = req === "required";
    const envEntry = { name, scope, ...(required ? { required: true } : {}) };
    sliceJson.deps = sliceJson.deps ?? {};
    sliceJson.deps.env = mergeBy(sliceJson.deps.env ?? [], [envEntry], "name");
    entryBody = patchObjectArrayField(entryBody, "env", sliceJson.deps.env);
    ops.push(`env += ${name}(${scope}${required ? ",required" : ""})`);
  }

  if (args["add-provider"]) {
    const p = String(args["add-provider"]);
    sliceJson.providers = uniqMerge(sliceJson.providers ?? [], [p]);
    entryBody = patchArrayField(entryBody, "providers", sliceJson.providers);
    ops.push(`providers += ${p}`);
  }

  if (args.bump) {
    const next = bumpSemver(sliceJson.version, args.bump, fail);
    sliceJson.version = next;
    entryBody = patchStringField(entryBody, "version", next);
    ops.push(`version → ${next}`);
  }

  if (args["set-description"]) {
    sliceJson.description = String(args["set-description"]);
    entryBody = patchStringField(entryBody, "description", sliceJson.description);
    ops.push(`description set`);
  }
  if (args["set-docs"]) {
    entryBody = patchStringField(entryBody, "docsUrl", String(args["set-docs"]));
    ops.push(`docsUrl set`);
  }
  if (args["set-install"]) {
    entryBody = patchStringField(entryBody, "install", String(args["set-install"]));
    ops.push(`install set`);
  }

  return entryBody;
}
