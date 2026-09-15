// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { augmentConsumerEnv } from "./env-augment.mjs";

const dirs=[];
const make=()=>{const d=mkdtempSync(path.join(tmpdir(),"rr-env-"));dirs.push(d);writeFileSync(path.join(d,".env.example"),"");return d};
afterEach(()=>dirs.splice(0).forEach(d=>rmSync(d,{recursive:true,force:true})));
const slice={slug:"demo",env:[{name:"API_URL",scope:"next-public",required:true},{name:"SECRET",scope:"server",required:true}]};

describe("framework-aware env augment",()=>{
  it("uses NEXT_PUBLIC_ for React/Next",()=>{const d=make();augmentConsumerEnv(slice,d,"react-next");const s=readFileSync(path.join(d,".env.example"),"utf8");expect(s).toContain("NEXT_PUBLIC_API_URL=");expect(s).toContain("SECRET=");});
  it("uses PUBLIC_ for SvelteKit",()=>{const d=make();augmentConsumerEnv(slice,d,"svelte-sveltekit");const s=readFileSync(path.join(d,".env.example"),"utf8");expect(s).toContain("PUBLIC_API_URL=");expect(s).not.toContain("NEXT_PUBLIC_API_URL=");});
});
