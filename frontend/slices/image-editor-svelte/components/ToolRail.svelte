<script lang="ts">
  import type { BrowserEditorCore, EditorSnapshot } from "@/features/image-editor/lib/editor-core";
  import { createLayer } from "@/features/image-editor/lib/model";
  import type { Tool } from "@/features/image-editor/lib/types";
  let { editor, snapshot } = $props<{ editor: BrowserEditorCore; snapshot: EditorSnapshot }>();
  const tools:{tool:Tool;label:string;glyph:string}[]=[
    {tool:"move",label:"Move",glyph:"↖"},{tool:"brush",label:"Brush",glyph:"✎"},{tool:"eraser",label:"Eraser",glyph:"⌫"},{tool:"hand",label:"Hand",glyph:"✋"},{tool:"eyedropper",label:"Eyedropper",glyph:"◉"}
  ];
  const center=(w:number,h:number)=>({x:(snapshot.doc.width-w)/2,y:(snapshot.doc.height-h)/2,width:w,height:h,rotation:0,scaleX:1,scaleY:1});
  function add(kind:"text"|"shape"|"paint"|"adjustment",shape?:"rect"|"ellipse"){
    const extra=kind==="text"?{fill:snapshot.fg,t:center(400,90)}:kind==="shape"?{shape,fillColor:snapshot.fg,t:center(shape==="ellipse"?260:320,shape==="ellipse"?260:220)}:kind==="paint"?{t:center(snapshot.doc.width,snapshot.doc.height)}:{};
    editor.addLayer(createLayer(kind,extra)); editor.setTool("move");
  }
</script>
<aside class="flex w-14 shrink-0 flex-col items-center gap-1 border-r bg-muted/20 py-2">
  {#each tools as item (item.tool)}<button class={`grid size-9 place-items-center rounded text-base ${snapshot.tool===item.tool?"bg-primary text-primary-foreground":"hover:bg-muted"}`} title={item.label} aria-label={item.label} aria-pressed={snapshot.tool===item.tool} onclick={()=>editor.setTool(item.tool)}>{item.glyph}</button>{/each}
  <div class="my-1 h-px w-8 bg-border"></div>
  <button class="grid size-9 place-items-center rounded hover:bg-muted" title="Add text" aria-label="Add text" onclick={()=>add("text")}>T</button>
  <button class="grid size-9 place-items-center rounded hover:bg-muted" title="Add rectangle" aria-label="Add rectangle" onclick={()=>add("shape","rect")}>□</button>
  <button class="grid size-9 place-items-center rounded hover:bg-muted" title="Add ellipse" aria-label="Add ellipse" onclick={()=>add("shape","ellipse")}>○</button>
  <button class="grid size-9 place-items-center rounded hover:bg-muted" title="Add paint layer" aria-label="Add paint layer" onclick={()=>add("paint")}>🎨</button>
  <button class="grid size-9 place-items-center rounded hover:bg-muted" title="Add adjustment layer" aria-label="Add adjustment layer" onclick={()=>add("adjustment")}>☼</button>
  <div class="mt-auto flex flex-col items-center gap-1">
    <button class="size-8 rounded border" style={`background:${snapshot.fg}`} title="Foreground" aria-label="Foreground color" onclick={()=>{const c=window.prompt("Foreground color",snapshot.fg);if(c)editor.setFg(c);}}></button>
    <button class="size-6 rounded border" style={`background:${snapshot.bg}`} title="Background" aria-label="Background color" onclick={()=>{const c=window.prompt("Background color",snapshot.bg);if(c)editor.setBg(c);}}></button>
    <button class="text-[10px]" onclick={editor.swapColors}>Swap</button>
  </div>
</aside>
