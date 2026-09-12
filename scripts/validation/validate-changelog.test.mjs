// @vitest-environment node
// Unit tests for the changelog data gate — both failure modes have
// actually shipped (future-dated entries, and the dup-id risk that comes
// with hand-prepended literals).
import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(__dirname, "validate-changelog.mjs");

function runOn(parts, root) {
  const dir = mkdtempSync(path.join(tmpdir(), "rr-changelog-"));
  for (const [name, content] of Object.entries(parts)) {
    writeFileSync(path.join(dir, name), content);
  }
  const args = [SCRIPT, dir];
  if (root !== undefined) {
    const rootPath = path.join(dir, "CHANGELOG.md");
    writeFileSync(rootPath, root);
    args.push(rootPath);
  }
  return spawnSync("node", args, { encoding: "utf8" });
}

const entry = (id, date, overrides = {}) => {
  const body = overrides.body
    ? overrides.body
    : `
  "body": "",
`;
  return `
  {
    "id": "${id}",
    "date": ${date},
${body}  },
`;
};

const governedBody =
  "    \"body\": \"Related: https://resource.rahmanef.com/slices/x — [before: old behavior] → [after: new behavior]\",";
const governedBodyNoRelated =
  "    \"body\": \"[before: old behavior] → [after: new behavior]\",";
const governedBodyNoTransform =
  "    \"body\": \"Related: https://resource.rahmanef.com/slices/x\",";

describe("validate-changelog", () => {
  it("passes clean data", () => {
    const r = runOn({
      "part-01.ts":
        `\n  {\n    \"id\": \"A\",\n    \"date\": 1780790400000,\n  },\n` +
        `\n  {\n    \"id\": \"B\",\n    \"date\": 1700000000000,\n  },\n`,
    });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("2 entries");
  });

  it("fails future-dated entries", () => {
    const farFuture = Date.now() + 90 * 86_400_000;
    const r = runOn({ "part-01.ts": entry("A", farFuture) });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("future-dated");
  });

  it("fails duplicate ids across part files", () => {
    const r = runOn({
      "part-01.ts": entry("DUP", 1780790400000),
      "part-02.ts": entry("DUP", 1700000000000),
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('duplicate id "DUP"');
  });

  it("fails pre-2020 dates (wrong epoch unit)", () => {
    const r = runOn({ "part-01.ts": entry("A", 1780790400) }); // seconds, not ms
    expect(r.status).toBe(1);
  });

  it("fails an unmarked root entry on or after the public changelog cutoff", () => {
    const r = runOn(
      { "part-01.ts": entry("PUBLIC", 1788912000000) },
      "## [Unreleased]\n\n### 2026-09-09 — Missing marker\n",
    );
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("root changelog entry is missing a public-changelog marker");
  });

  it("fails a marked root entry when its public entry is missing", () => {
    const r = runOn(
      { "part-01.ts": entry("PUBLIC", 1780790400000) },
      "## [Unreleased]\n\n### 2026-09-09 — Missing public entry\n<!-- public-changelog:MISSING -->\n",
    );
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('root changelog references missing public entry "MISSING"');
  });

  it("passes a marked root entry when its public entry exists", () => {
    const r = runOn(
      { "part-01.ts": entry("PUBLIC", 1780790400000) },
      "## [Unreleased]\n\n### 2026-09-09 — Public entry\n<!-- public-changelog:PUBLIC -->\n",
    );
    expect(r.status).toBe(0);
  });

  it("passes an unmarked root entry before the public changelog cutoff", () => {
    const r = runOn(
      { "part-01.ts": entry("PUBLIC", 1780790400000) },
      "## [Unreleased]\n\n### 2026-09-08 — Legacy entry\n",
    );
    expect(r.status).toBe(0);
  });

  it("fails duplicate public changelog marker ids in root entries", () => {
    const r = runOn(
      { "part-01.ts": entry("PUBLIC", 1780790400000) },
      "## [Unreleased]\n\n### 2026-09-09 — First entry\n<!-- public-changelog:PUBLIC -->\n\n### 2026-09-10 — Second entry\n<!-- public-changelog:PUBLIC -->\n",
    );
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('duplicate public-changelog marker "PUBLIC"');
  });

  it("fails a governed 2026-09-12 structured entry when Related is absent", () => {
    const r = runOn({
      "part-01.ts": entry(
        "GOV-TEST",
        1789171200000,
        { body: governedBodyNoRelated },
      ),
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("missing Related public URL");
    expect(r.stderr).toContain("public entry \"GOV-TEST\"");
  });

  it("fails a governed 2026-09-12 structured entry when transformation is absent", () => {
    const r = runOn({
      "part-01.ts": entry("GOV-TEST", 1789171200000, { body: governedBodyNoTransform }),
    });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("missing [before] → [after] transformation");
    expect(r.stderr).toContain("public entry \"GOV-TEST\"");
  });

  it("passes a governed 2026-09-12 entry when root and public data contain both fields", () => {
    const parts = {
      "part-01.ts": entry("GOV-TEST", 1789171200000, { body: governedBody }),
    };
    const root =
      "## [Unreleased]\n\n### 2026-09-12 — Governed entry\n<!-- public-changelog:GOV-TEST -->\n\n**Slices:**\n- Related: https://resource.rahmanef.com/slices/gov-test\n- [before: old behavior] → [after: new behavior]\n";

    const r = runOn(parts, root);
    expect(r.status).toBe(0);
  });

  it("requires retrofit-governance fields for 2026-09-11 explicit IDs", () => {
    const parts = {
      "part-01.ts": entry(
        "SVELTE-FULL-WIDTH-TOGGLE-DISTRIBUTION",
        1789084800000,
        { body: governedBodyNoTransform },
      ),
    };
    const root =
      "## [Unreleased]\n\n### 2026-09-11 — SvelteKit Full Width Toggle slice distribution\n<!-- public-changelog:SVELTE-FULL-WIDTH-TOGGLE-DISTRIBUTION -->\n\n**Slices:**\n- Related: https://resource.rahmanef.com/slices/full-width-toggle\n";

    const r = runOn(parts, root);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("missing [before] → [after] transformation");
    expect(r.stderr).toContain('public-changelog marker "SVELTE-FULL-WIDTH-TOGGLE-DISTRIBUTION"');
  });

  it("validates the real changelog", () => {
    const r = spawnSync("node", [SCRIPT], { encoding: "utf8" });
    expect(r.status).toBe(0);
  });
});
