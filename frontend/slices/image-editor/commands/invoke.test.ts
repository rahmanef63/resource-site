import { describe, expect, it } from "vitest";
import { blankDoc } from "../lib/model";
import { createBrowserEditor } from "../lib/editor-core";
import { invokeEditorCommand } from "./invoke";

describe("image editor command invoke",()=>{
  it("returns structured failure for unknown tools",async()=>{const editor=createBrowserEditor(blankDoc(100,100));expect(await invokeEditorCommand(editor,{name:"missing",input:{}})).toEqual({ok:false,result:'unknown command "missing"'});});
  it("runs the shared command registry against structural editor context",async()=>{const editor=createBrowserEditor(blankDoc(100,100));const out=await invokeEditorCommand(editor,{name:"doc.resize",input:{width:200,height:150}});expect(out.ok).toBe(true);expect(editor.doc.width).toBe(200);expect(editor.doc.height).toBe(150);});
});
