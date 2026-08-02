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

function runOn(parts) {
  const dir = mkdtempSync(path.join(tmpdir(), "rr-changelog-"));
  for (const [name, content] of Object.entries(parts)) {
    writeFileSync(path.join(dir, name), content);
  }
  return spawnSync("node", [SCRIPT, dir], { encoding: "utf8" });
}

const entry = (id, date) => `
  {
    "id": "${id}",
    "date": ${date},
  },
`;

describe("validate-changelog", () => {
  it("passes clean data", () => {
    const r = runOn({
      "part-01.ts": entry("A", 1780790400000) + entry("B", 1700000000000),
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

  it("validates the real changelog", () => {
    const r = spawnSync("node", [SCRIPT], { encoding: "utf8" });
    expect(r.status).toBe(0);
  });
});
