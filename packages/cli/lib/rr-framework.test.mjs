// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildRr, addSlice } from "./rr.mjs";

describe("rr project framework metadata", () => {
  it("keeps Next as the backward-compatible default", () => {
    const rr = buildRr({ packageManager: "npm" });
    expect(rr.framework).toBe("next-16");
    expect(rr.packageManager).toBe("npm");
    expect(rr.rsc).toBe(true);
  });

  it("builds a truthful SvelteKit project manifest", () => {
    const rr = buildRr({ framework: "sveltekit", packageManager: "bun" });
    expect(rr.framework).toBe("sveltekit");
    expect(rr.packageManager).toBe("bun");
    expect(rr.rsc).toBe(false);
    expect(rr.tailwind.css).toBe("src/app.css");
    expect(rr.layout.publicRoute).toBe("src/routes");
    expect(rr.aliases.features).toBe("@/features");
  });

  it("records the framework distribution of installed slices", () => {
    const rr = buildRr({ framework: "sveltekit" });
    addSlice(rr, "appshell", { version: "1.7.1", framework: "svelte-sveltekit" });
    expect(rr.slices[0].framework).toBe("svelte-sveltekit");
  });
});
