import { describe,expect,it } from "vitest";
import { beforeIdAfterDrop, flatten, getProjection, removeDescendantsOf } from "./tree";
const pages=[{id:"a",title:"A",icon:"",parentId:null},{id:"b",title:"B",icon:"",parentId:"a"},{id:"c",title:"C",icon:"",parentId:null}];
describe("notion-ui sidebar tree core",()=>{
  it("flattens depth and hides descendant subtrees",()=>{const flat=flatten(pages);expect(flat.map(x=>[x.id,x.depth])).toEqual([["a",0],["b",1],["c",0]]);expect(removeDescendantsOf(flat,["a"]).map(x=>x.id)).toEqual(["a","c"])});
  it("projects native drag reorder without dnd-kit runtime",()=>{const flat=flatten(pages);const p=getProjection(flat,"c","b",0);expect(p.depth).toBeGreaterThanOrEqual(0);expect(beforeIdAfterDrop(flat,"c","b",p.parentId)).not.toBe("c")});
});
