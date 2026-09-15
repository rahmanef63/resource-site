import { describe, expect, it } from "vitest";
import type { Block, Page } from "@notion/shared/types";
import type { EditorDataAdapter } from "./dataAdapter";
import { createPageEditorCore } from "./page-core";

function fixture() {
  let page: Page = { id:"p1", parentId:null, title:"Notes", icon:"📝", favorite:false, trashed:false, createdAt:1, updatedAt:1, blocks:[{id:"a",type:"paragraph",text:"Hello"},{id:"b",type:"todo",text:"Ship",checked:false}] };
  const data: EditorDataAdapter = {
    user:{id:"u",name:"U",email:"",icon:"",color:"",bio:""}, pages:[page], getPage:()=>page, childrenOf:()=>[],
    addBlock: async(_p,after,type="paragraph",init={})=>{const id=`n${page.blocks.length}`;const blocks=[...page.blocks];blocks.splice(after+1,0,{id,type,text:"",...init} as Block);page={...page,blocks};return id;},
    updateBlock: async(_p,id,patch)=>{page={...page,blocks:page.blocks.map(b=>b.id===id?{...b,...patch}:b)};},
    deleteBlock: async(_p,id)=>{page={...page,blocks:page.blocks.filter(b=>b.id!==id)};},
    duplicateBlock: async(_p,id)=>{const src=page.blocks.find(b=>b.id===id)!;const next={...src,id:`d${page.blocks.length}`};const i=page.blocks.findIndex(b=>b.id===id);const blocks=[...page.blocks];blocks.splice(i+1,0,next);page={...page,blocks};return next.id;},
    reorderBlocks: async(_p,ids)=>{const by=new Map(page.blocks.map(b=>[b.id,b]));page={...page,blocks:ids.map(id=>by.get(id)!).filter(Boolean)};},
    setBlockType: async()=>{}, replaceBlock:async()=>{}, createPage:async()=>({id:"child"}),
    updatePage: async(_id,patch)=>{page={...page,...patch};}, deletePage:async()=>{}, duplicatePage:async()=>null,
  };
  return { data, getPage:()=>page };
}

describe("page editor core",()=>{
  it("keeps local CRUD and adapter state aligned",async()=>{const f=fixture();const c=createPageEditorCore({pageId:"p1",data:f.data});await c.updateBlock("a",{text:"Hi"});await c.addBlock(0,"quote",{text:"Q"});await c.move("b",-1);expect(c.getSnapshot().page?.blocks.map(b=>b.type)).toEqual(["paragraph","todo","quote"]);expect(f.getPage().blocks.map(b=>b.type)).toEqual(["paragraph","todo","quote"]);});
  it("round-trips markdown through the shared bridge",async()=>{const f=fixture();const c=createPageEditorCore({pageId:"p1",data:f.data});await c.importMarkdown("# Title\n\n- item");expect(c.getSnapshot().page?.blocks.map(b=>b.type)).toEqual(["h1","bullet"]);expect(c.exportMarkdown()).toContain("# Title");});
  it("undoes and redoes page snapshots",async()=>{const f=fixture();const c=createPageEditorCore({pageId:"p1",data:f.data});await c.updateTitle("Next");expect(c.getSnapshot().page?.title).toBe("Next");await c.undo();expect(c.getSnapshot().page?.title).toBe("Notes");await c.redo();expect(c.getSnapshot().page?.title).toBe("Next");});
});
