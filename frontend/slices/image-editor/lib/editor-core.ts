import type Konva from "konva";
import type { EditorCtx } from "../commands/types";
import { createImageHistory } from "./history-core";
import { blankDoc, createLayer } from "./model";
import { initMaskCanvas, maskKey } from "./mask-core";
import { buildProject, restorePaint, type Project } from "./project-core";
import type { Adjustments, Doc, DropShadow, Layer, LayerStyle, OuterGlow, Pan, Stroke, Tool } from "./types";

export type Brush = { size: number; color: string; opacity: number; hardness: number };
export type EditorSnapshot = {
  doc: Doc; selectedId: string | null; tool: Tool; zoom: number; pan: Pan; brush: Brush;
  fg: string; bg: string; recentColors: string[]; canUndo: boolean; canRedo: boolean;
  version: number; maskEditId: string | null;
};
export type BrowserEditorCore = EditorCtx & {
  getSnapshot: () => EditorSnapshot; subscribe: (listener: () => void) => () => void;
  setZoom: (value: number) => void; setPan: (value: Pan) => void; setMaskEdit: (id: string | null) => void; setBackground: (value: string) => void;
  canvasFor: (id: string, w: number, h: number) => HTMLCanvasElement;
  recordPaint: (id: string, before: string, after: string) => void;
  exportProject: () => Project; loadProject: (project: Project) => void; reset: (doc?: Doc) => void;
};

const DEFAULT_FG="#111827", DEFAULT_BG="#ffffff";
export function createBrowserEditor(initial=blankDoc()): BrowserEditorCore {
  let doc=initial, selectedId=doc.layers.at(-1)?.id??null, tool:Tool="move", zoom=1, pan:Pan={x:0,y:0};
  let brush:Brush={size:28,color:DEFAULT_FG,opacity:1,hardness:.8}, fg=DEFAULT_FG, bg=DEFAULT_BG, recentColors:string[]=[], maskEditId:string|null=null;
  const stageRef:{current:Konva.Stage|null}={current:null}, canvases=new Map<string,HTMLCanvasElement>(), listeners=new Set<()=>void>(); let snapshot!:EditorSnapshot;
  const canvasFor=(id:string,w:number,h:number)=>{let c=canvases.get(id);if(!c){c=document.createElement("canvas");c.width=w;c.height=h;canvases.set(id,c);}return c;};
  const applyPaint=(id:string,url:string)=>{const c=canvases.get(id);if(!c)return;const img=new Image();img.onload=()=>{const x=c!.getContext("2d");x?.clearRect(0,0,c!.width,c!.height);x?.drawImage(img,0,0);stageRef.current?.draw();};img.src=url;};
  const history=createImageHistory({doc:(next)=>{doc=next;},paint:applyPaint});
  const refresh=()=>{const h=history.getSnapshot();snapshot={doc,selectedId,tool,zoom,pan,brush,fg,bg,recentColors,canUndo:h.canUndo,canRedo:h.canRedo,version:h.rev,maskEditId};};
  const emit=()=>{refresh();listeners.forEach((l)=>l());}; history.subscribe(emit); refresh();
  const setDoc=(next:Doc|((d:Doc)=>Doc),track=true)=>{const before=doc,after=typeof next==="function"?next(doc):next;if(after===before)return;doc=after;if(track)history.push({type:"doc",before,after});else emit();};
  const map=(id:string,fn:(l:Layer)=>Layer)=>setDoc((d)=>({...d,layers:d.layers.map((l)=>l.id===id?fn(l):l)}));
  const move=(id:string,dir:1|-1)=>setDoc((d)=>{const i=d.layers.findIndex((l)=>l.id===id),j=i+dir;if(i<0||j<0||j>=d.layers.length)return d;const ls=[...d.layers];[ls[i],ls[j]]=[ls[j],ls[i]];return{...d,layers:ls};});
  const update=(id:string,p:Partial<Layer>)=>map(id,(l)=>({...l,...p}));
  const core:BrowserEditorCore={
    get doc(){return doc;},get selectedId(){return selectedId;},get selected(){return doc.layers.find((l)=>l.id===selectedId)??null;},get tool(){return tool;},get brush(){return brush;},get fg(){return fg;},get bg(){return bg;},get canUndo(){return history.getSnapshot().canUndo;},get canRedo(){return history.getSnapshot().canRedo;},stageRef,
    getSnapshot:()=>snapshot,subscribe:(l)=>{listeners.add(l);return()=>listeners.delete(l);},select:(id)=>{selectedId=id;if(maskEditId&&maskEditId!==id)maskEditId=null;emit();},setTool:(v)=>{tool=v;emit();},setBrush:(p)=>{brush={...brush,...p};emit();},
    setFg:(c)=>{fg=c;brush={...brush,color:c};recentColors=[c,...recentColors.filter((x)=>x!==c)].slice(0,12);emit();},setBg:(c)=>{bg=c;emit();},swapColors:()=>{const f=fg;fg=bg;bg=f;brush={...brush,color:fg};emit();},resetColors:()=>{fg=DEFAULT_FG;bg=DEFAULT_BG;brush={...brush,color:fg};emit();},
    setZoom:(v)=>{zoom=v;emit();},setPan:(v)=>{pan=v;emit();},setMaskEdit:(id)=>{maskEditId=id;if(id)selectedId=id;emit();},setBackground:(value)=>setDoc((d)=>({...d,bg:value})),setDocSize:(w,h)=>setDoc((d)=>({...d,width:w,height:h})),update,
    patchStyle:(id,p:Partial<LayerStyle>)=>map(id,(l)=>({...l,style:{...l.style,...p}})),patchShadow:(id,p:Partial<DropShadow>)=>map(id,(l)=>({...l,style:{...l.style,shadow:{...l.style.shadow,...p}}})),patchGlow:(id,p:Partial<OuterGlow>)=>map(id,(l)=>({...l,style:{...l.style,glow:{...l.style.glow,...p}}})),patchStroke:(id,p:Partial<Stroke>)=>map(id,(l)=>({...l,style:{...l.style,stroke:{...l.style.stroke,...p}}})),patchAdj:(id,p:Partial<Adjustments>)=>map(id,(l)=>({...l,adj:{...l.adj,...p}})),
    addLayer:(layer,opts)=>{setDoc((d)=>({...d,layers:[...d.layers,layer]}));if(opts?.select!==false)selectedId=layer.id;emit();},removeLayer:(id)=>{canvases.delete(id);canvases.delete(maskKey(id));setDoc((d)=>({...d,layers:d.layers.filter((l)=>l.id!==id)}));if(selectedId===id)selectedId=null;emit();},
    duplicateLayer:(id)=>setDoc((d)=>{const i=d.layers.findIndex((l)=>l.id===id);if(i<0)return d;const src=d.layers[i],copy=createLayer(src.kind,{...src,name:`${src.name} copy`,t:{...src.t,x:src.t.x+24,y:src.t.y+24}});return{...d,layers:[...d.layers.slice(0,i+1),copy,...d.layers.slice(i+1)]};}),
    reorder:(from,to)=>setDoc((d)=>{const ls=[...d.layers],m=ls.splice(from,1)[0];if(!m)return d;ls.splice(to,0,m);return{...d,layers:ls};}),raise:(id)=>move(id,1),lower:(id)=>move(id,-1),
    applyCrop:(x,y,w,h)=>setDoc((d)=>{for(const l of d.layers){if(l.kind!=="paint")continue;const old=canvases.get(l.id);if(!old)continue;const next=document.createElement("canvas");next.width=w;next.height=h;next.getContext("2d")?.drawImage(old,-x,-y);canvases.set(l.id,next);}return{...d,width:Math.round(w),height:Math.round(h),layers:d.layers.map((l)=>({...l,t:{...l.t,x:l.t.x-x,y:l.t.y-y}}))};}),
    addMask:(id)=>{initMaskCanvas(canvasFor(maskKey(id),doc.width,doc.height));update(id,{mask:true});},removeMask:(id)=>{canvases.delete(maskKey(id));update(id,{mask:false});maskEditId=null;emit();},undo:history.undo,redo:history.redo,
    canvasFor,recordPaint:(id,before,after)=>history.push({type:"paint",id,before,after}),exportProject:()=>buildProject(doc,canvases),loadProject:(p)=>{doc=p.doc;selectedId=doc.layers.at(-1)?.id??null;history.clear();restorePaint(p,canvasFor,()=>stageRef.current?.draw());emit();},reset:(next=blankDoc())=>{doc=next;selectedId=doc.layers.at(-1)?.id??null;canvases.clear();history.clear();emit();},
  };
  return core;
}
