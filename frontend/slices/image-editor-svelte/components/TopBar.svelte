<script lang="ts">
  import type { BrowserEditorCore, EditorSnapshot } from "@/features/image-editor/lib/editor-core";
  import { createLayer, blankDoc, ASPECT_PRESETS } from "@/features/image-editor/lib/model";
  import { loadImage } from "@/features/image-editor/lib/konva-helpers";
  import { removeImageBackground } from "@/features/image-editor/lib/bg-removal";
  import { downloadDataURL, stageToDataURL, type ExportFormat } from "@/features/image-editor/lib/export";
  import { downloadProject, parseProject } from "@/features/image-editor/lib/project-core";

  let { editor, snapshot, onAi } = $props<{ editor: BrowserEditorCore; snapshot: EditorSnapshot; onAi: () => void }>();
  let imageInput = $state<HTMLInputElement>();
  let projectInput = $state<HTMLInputElement>();
  let busy = $state(false);
  let exportFormat = $state<ExportFormat>("png");
  function attachImageInput(node: HTMLInputElement) {
    imageInput=node; return()=>{if(imageInput===node)imageInput=undefined;};
  }
  function attachProjectInput(node: HTMLInputElement) {
    projectInput=node; return()=>{if(projectInput===node)projectInput=undefined;};
  }

  async function importImage(file: File) {
    const url=URL.createObjectURL(file);
    try {
      const img=await loadImage(url); const max=Math.min(snapshot.doc.width,snapshot.doc.height)*.9; const k=Math.min(1,max/Math.max(img.width,img.height)); const w=Math.round(img.width*k),h=Math.round(img.height*k);
      editor.addLayer(createLayer("image",{name:file.name,src:url,t:{x:Math.round((snapshot.doc.width-w)/2),y:Math.round((snapshot.doc.height-h)/2),width:w,height:h,rotation:0,scaleX:1,scaleY:1}})); editor.setTool("move");
    } catch { URL.revokeObjectURL(url); }
  }
  async function openProject(file: File) { const project=parseProject(await file.text()); if(project) editor.loadProject(project); }
  async function removeBg() { const selected=editor.selected; if(!selected||selected.kind!=="image"||!selected.src)return; busy=true; try{const src=await removeImageBackground(selected.src);editor.update(selected.id,{src,name:`${selected.name} (cutout)`});}finally{busy=false;} }
  function exportImage() { const stage=editor.stageRef.current; if(!stage)return; const url=stageToDataURL(stage,{format:exportFormat,pixelRatio:1});downloadDataURL(url,`image-editor.${exportFormat==="jpeg"?"jpg":exportFormat}`); }
  function newDoc() { if(window.confirm("Start a new document?")) editor.reset(blankDoc()); }
</script>
<header class="flex flex-wrap items-center gap-1 border-b bg-background px-2 py-1.5 text-xs">
  <strong class="mr-2">Image Editor</strong>
  <button class="rounded border px-2 py-1" onclick={newDoc}>New</button>
  <button class="rounded border px-2 py-1" onclick={()=>imageInput?.click()}>Open image</button>
  <button class="rounded border px-2 py-1" onclick={()=>projectInput?.click()}>Open project</button>
  <button class="rounded border px-2 py-1" onclick={()=>downloadProject(editor.exportProject(),"image-editor")}>Save project</button>
  <span class="mx-1 h-5 w-px bg-border"></span>
  <button class="rounded border px-2 py-1 disabled:opacity-40" disabled={!snapshot.canUndo} onclick={editor.undo}>Undo</button>
  <button class="rounded border px-2 py-1 disabled:opacity-40" disabled={!snapshot.canRedo} onclick={editor.redo}>Redo</button>
  <span class="mx-1 h-5 w-px bg-border"></span>
  <select class="rounded border bg-background px-2 py-1" aria-label="Canvas preset" onchange={(e)=>{const p=ASPECT_PRESETS[Number(e.currentTarget.value)];if(p)editor.setDocSize(p.w,p.h);}}><option value="">Canvas</option>{#each ASPECT_PRESETS as preset,i (preset.label)}<option value={i}>{preset.label}</option>{/each}</select>
  <button class="rounded border px-2 py-1 disabled:opacity-40" disabled={editor.selected?.kind!=="image"||busy} onclick={()=>void removeBg()}>{busy?"Removing…":"Remove BG"}</button>
  <button class="rounded border px-2 py-1" onclick={onAi}>AI</button>
  <span class="ml-auto"></span>
  <select class="rounded border bg-background px-2 py-1" value={exportFormat} onchange={(e)=>exportFormat=e.currentTarget.value as ExportFormat}><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select>
  <button class="rounded bg-primary px-3 py-1 text-primary-foreground" onclick={exportImage}>Export</button>
  <input class="hidden" type="file" accept="image/*" {@attach attachImageInput} onchange={(e)=>{const f=e.currentTarget.files?.[0];if(f)void importImage(f);e.currentTarget.value="";}} />
  <input class="hidden" type="file" accept=".json,application/json" {@attach attachProjectInput} onchange={(e)=>{const f=e.currentTarget.files?.[0];if(f)void openProject(f);e.currentTarget.value="";}} />
</header>
