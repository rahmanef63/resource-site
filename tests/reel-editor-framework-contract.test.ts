// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { compile } from "svelte/compiler";

const root = process.cwd();
const targets: string[] = [];
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
function target() { const dir=mkdtempSync(path.join(os.tmpdir(),"rr-reel-editor-")); targets.push(dir); return dir; }
function runCli(...args: string[]) { return spawnSync(process.execPath,["packages/cli/bin/cli.js",...args],{cwd:root,encoding:"utf8"}); }
function svelteSources(dir: string): string[] { return readdirSync(dir).flatMap((name)=>{const file=path.join(dir,name);return statSync(file).isDirectory()?svelteSources(file):name.endsWith(".svelte")?[file]:[]}); }
afterEach(()=>{for(const dir of targets.splice(0))rmSync(dir,{recursive:true,force:true});});

describe("reel-editor framework distribution",()=>{
  it("keeps React default and selects native Svelte over the shared NLE cores",()=>{
    const slice=JSON.parse(read("frontend/slices/reel-editor/slice.json"));
    expect(slice.version).toBe("1.3.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({path:"frontend/slices/reel-editor-svelte",aliases:["svelte","sveltekit"],deps:{npm:["svelte@^5"],shadcn:[]}});
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toContain("frontend/slices/reel-editor/lib/history-core.ts");
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toContain("frontend/slices/reel-editor/lib/render.ts");
  });

  it("keeps React UI/agent/runtime dependencies out of Svelte and narrows React registration",()=>{
    const dir=path.join(root,"frontend/slices/reel-editor-svelte");
    const joined=[...svelteSources(dir).map((f)=>readFileSync(f,"utf8")),read("frontend/slices/reel-editor-svelte/index.ts")].join("\n");
    for(const bad of ['from "react"','from "next','lucide-react','@/components/ui/','react-resizable-panels','sonner','shared/agentic','shared/ui/FilePicker'])expect(joined).not.toContain(bad);
    expect(read("frontend/slices/reel-editor/app.tsx")).toContain('from "@/shared/agentic/use-agent-tools"');
    expect(read("frontend/slices/reel-editor/lib/tools.ts")).not.toContain('from "@/shared/agentic');
  });

  it("compiles every Svelte editor surface client+server without warnings",()=>{
    for(const filename of svelteSources(path.join(root,"frontend/slices/reel-editor-svelte"))){const source=readFileSync(filename,"utf8");expect(compile(source,{filename,generate:"client",dev:false}).warnings).toEqual([]);expect(compile(source,{filename,generate:"server",dev:false}).warnings).toEqual([]);}
  });

  it("selects truthful CLI dependencies for React and Svelte",()=>{
    const react=runCli("add","reel-editor","--target",target(),"--dry-run");
    expect(react.status).toBe(0); expect(react.stdout).toContain("lucide-react@^1.16.0"); expect(react.stdout).toContain("react-resizable-panels@^4.11.1"); expect(react.stdout).toContain("sonner@^2.0.7"); expect(react.stdout).toContain("components/shared/ui/FilePicker.tsx →"); expect(react.stdout).toContain("lib/shared/agentic/use-agent-tools.ts →");
    const svelte=runCli("add","reel-editor","--framework","sveltekit","--target",target(),"--dry-run");
    expect(svelte.status).toBe(0); expect(svelte.stdout).toContain("frontend/slices/reel-editor-svelte → frontend/slices/reel-editor-svelte"); expect(svelte.stdout).toContain("svelte@^5"); expect(svelte.stdout).toContain("frontend/slices/reel-editor/lib/render.ts →"); for(const bad of ["lucide-react","react-resizable-panels","sonner","shared/agentic","shared/ui/FilePicker","shadcn:"])expect(svelte.stdout).not.toContain(bad);
  });
});
