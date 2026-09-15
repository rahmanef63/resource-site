// @vitest-environment node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root=process.cwd();
const read=(file:string)=>readFileSync(join(root,file),"utf8");
const slice=JSON.parse(read("frontend/slices/notion-ui/slice.json"));
function walk(dir:string,suffix:string):string[]{return readdirSync(dir).flatMap(name=>{const f=join(dir,name);return statSync(f).isDirectory()?walk(f,suffix):f.endsWith(suffix)?[f]:[]})}
function dry(variant?:string,framework?:string){const args=["packages/cli/bin/cli.js","add","notion-ui"];if(variant)args.push(variant);args.push("--target",`/tmp/rr-notion-ui-${framework??"react"}-${variant??"all"}`,"--dry-run");if(framework)args.push("--framework",framework);return spawnSync(process.execPath,args,{cwd:root,encoding:"utf8"})}
function ok(r:ReturnType<typeof dry>){expect(r.status,`${r.stdout}\n${r.stderr}`).toBe(0)}

describe("notion-ui framework + variant distribution",()=>{
  it("keeps React default and declares native SvelteKit",()=>{
    expect(slice.version).toBe("0.25.0"); expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({path:"frontend/slices/notion-ui-svelte",aliases:["svelte","sveltekit"],deps:{npm:["svelte@^5"],shadcn:[]}});
    expect(slice.variants.items.map((x:{id:string})=>x.id)).toEqual(["page","database","sidebar"]);
  });

  it("keeps every Svelte surface renderer-clean and compiler-clean",()=>{
    const dir=join(root,"frontend/slices/notion-ui-svelte"),files=walk(dir,".svelte"),source=[...files,...walk(dir,".ts")].map(f=>readFileSync(f,"utf8")).join("\n");
    expect(files.length).toBe(17);
    for(const bad of ['from "react"','from "next','lucide-react','@dnd-kit/','recharts','@/components/ui/'])expect(source).not.toContain(bad);
    for(const file of files){const text=readFileSync(file,"utf8");for(const generate of ["client","server"] as const)expect(compile(text,{filename:file,generate,dev:false}).warnings).toEqual([])}
  });

  it("keeps all eleven database view kinds native",()=>{
    const db=read("frontend/slices/notion-ui-svelte/variants/database/components/NotionDatabase.svelte");
    const router=read("frontend/slices/notion-ui-svelte/variants/database/components/views/ViewRouter.svelte");
    for(const kind of ["table","board","list","gallery","calendar","feed","chart","dashboard","form","map","timeline"]) expect(db+router).toContain(`\"${kind}\"`);
  });

  it("routes React and Svelte variants with truthful dependency closures",()=>{
    for(const variant of ["page","database","sidebar"]){
      const react=dry(variant);ok(react);expect(react.stdout).toContain(`frontend/slices/notion-ui/variants/${variant} → frontend/slices/notion-ui`);expect(react.stdout).toContain("@dnd-kit/core@^6.3.1");expect(react.stdout).toContain("lucide-react@^1.16.0");
      const svelte=dry(variant,"sveltekit");ok(svelte);expect(svelte.stdout).toContain(`frontend/slices/notion-ui-svelte/variants/${variant} → frontend/slices/notion-ui-svelte`);expect(svelte.stdout).toContain("npm: svelte@^5");expect(svelte.stdout).not.toContain("lucide-react");expect(svelte.stdout).not.toContain("recharts");expect(svelte.stdout).not.toContain("@dnd-kit/core");expect(svelte.stdout).not.toContain("shadcn:");
      if(variant==="database"){expect(svelte.stdout).toContain("variants/database/lib/viewData.ts");expect(svelte.stdout).toContain("formulaEngine/evaluator.ts");expect(svelte.stdout).toContain("lib/io/csv.ts");}
      if(variant==="page")expect(svelte.stdout).toContain("variants/page/lib/block-catalog.ts");
      if(variant==="sidebar")expect(svelte.stdout).toContain("variants/sidebar/lib/tree.ts");
    }
  });

  it("keeps portable SSOTs free of renderer runtime imports",()=>{
    const files=["frontend/slices/notion-ui/shared/block-core.ts","frontend/slices/notion-ui/shared/types.ts","frontend/slices/notion-ui/variants/database/types.ts","frontend/slices/notion-ui/variants/sidebar/lib/tree.ts","frontend/slices/notion-ui/variants/sidebar/lib/types-core.ts"];
    const src=files.map(read).join("\n"); for(const bad of ['from "react"','@dnd-kit/','lucide-react','recharts'])expect(src).not.toContain(bad);
    expect(read("frontend/slices/notion-ui/variants/page/lib/blockSpecs.ts")).toContain("BLOCK_CATALOG");
  });
});
