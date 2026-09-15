// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { compile } from "svelte/compiler";

const root=process.cwd(), targets:string[]=[];
const read=(f:string)=>readFileSync(path.join(root,f),"utf8");
function target(){const d=mkdtempSync(path.join(os.tmpdir(),"rr-image-editor-"));targets.push(d);return d;}
function runCli(...args:string[]){return spawnSync(process.execPath,["packages/cli/bin/cli.js",...args],{cwd:root,encoding:"utf8"});}
function svelteSources(dir:string):string[]{return readdirSync(dir).flatMap(n=>{const f=path.join(dir,n);return statSync(f).isDirectory()?svelteSources(f):n.endsWith(".svelte")?[f]:[]});}
afterEach(()=>{for(const d of targets.splice(0))rmSync(d,{recursive:true,force:true});});

describe("image-editor framework distribution",()=>{
  it("keeps React default and selects native Svelte/Konva over shared editor cores",()=>{
    const slice=JSON.parse(read("frontend/slices/image-editor/slice.json"));
    expect(slice.version).toBe("2.2.0"); expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({path:"frontend/slices/image-editor-svelte",aliases:["svelte","sveltekit"],deps:{npm:["svelte@^5","konva@^10.3.0","@imgly/background-removal@^1.7.0"],shadcn:[]}});
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toContain("frontend/slices/image-editor/lib/editor-core.ts");
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toContain("frontend/slices/image-editor/commands/registry.ts");
  });

  it("keeps React renderer/agent dependencies out of Svelte and narrows React imports",()=>{
    const dir=path.join(root,"frontend/slices/image-editor-svelte");
    const joined=[...svelteSources(dir).map(f=>readFileSync(f,"utf8")),read("frontend/slices/image-editor-svelte/index.ts")].join("\n");
    for(const bad of ['from "react"','from "next','react-konva','lucide-react','@/components/ui/','shared/agentic','shared/ui/FilePicker'])expect(joined).not.toContain(bad);
    expect(read("frontend/slices/image-editor/image-editor.tsx")).toContain('from "@/shared/agentic/use-agent-tools"');
    expect(read("frontend/slices/image-editor/commands/registry.ts")).not.toContain("shared/agentic");
    expect(read("frontend/slices/image-editor/commands/types.ts")).not.toContain("useEditor");
  });

  it("compiles every native Svelte surface client+server without warnings",()=>{
    for(const f of svelteSources(path.join(root,"frontend/slices/image-editor-svelte"))){const s=readFileSync(f,"utf8");expect(compile(s,{filename:f,generate:"client",dev:false}).warnings).toEqual([]);expect(compile(s,{filename:f,generate:"server",dev:false}).warnings).toEqual([]);}
  });

  it("selects truthful CLI dependencies for React and Svelte",()=>{
    const react=runCli("add","image-editor","--target",target(),"--dry-run"); expect(react.status).toBe(0);
    for(const dep of ["@imgly/background-removal@^1.7.0","konva@^10.3.0","lucide-react@^1.16.0","react-konva@^19.2.4"])expect(react.stdout).toContain(dep);
    expect(react.stdout).toContain("components/shared/ui/FilePicker.tsx →"); expect(react.stdout).toContain("lib/shared/agentic/use-agent-tools.ts →"); expect(react.stdout).toContain("shadcn:");
    const svelte=runCli("add","image-editor","--framework","sveltekit","--target",target(),"--dry-run"); expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/image-editor-svelte → frontend/slices/image-editor-svelte"); for(const dep of ["svelte@^5","konva@^10.3.0","@imgly/background-removal@^1.7.0"])expect(svelte.stdout).toContain(dep);
    for(const bad of ["react-konva","lucide-react","shared/agentic","shared/ui/FilePicker","shadcn:"])expect(svelte.stdout).not.toContain(bad);
  });
});
