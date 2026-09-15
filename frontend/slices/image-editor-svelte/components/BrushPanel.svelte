<script lang="ts">
  import type { BrowserEditorCore, EditorSnapshot } from "@/features/image-editor/lib/editor-core";
  let { editor, snapshot } = $props<{ editor: BrowserEditorCore; snapshot: EditorSnapshot }>();
</script>
<div class="grid grid-cols-2 gap-2 border-b p-2 text-xs">
  <label class="space-y-1"><span>Size {Math.round(snapshot.brush.size)}px</span><input class="w-full" type="range" min="1" max="200" value={snapshot.brush.size} oninput={(e)=>editor.setBrush({size:Number(e.currentTarget.value)})}/></label>
  <label class="space-y-1"><span>Opacity {Math.round(snapshot.brush.opacity*100)}%</span><input class="w-full" type="range" min="0.05" max="1" step="0.05" value={snapshot.brush.opacity} oninput={(e)=>editor.setBrush({opacity:Number(e.currentTarget.value)})}/></label>
  <label class="space-y-1"><span>Hardness {Math.round(snapshot.brush.hardness*100)}%</span><input class="w-full" type="range" min="0" max="1" step="0.05" value={snapshot.brush.hardness} oninput={(e)=>editor.setBrush({hardness:Number(e.currentTarget.value)})}/></label>
  <label class="space-y-1"><span>Color</span><input class="h-7 w-full rounded border" type="color" value={snapshot.fg} oninput={(e)=>editor.setFg(e.currentTarget.value)}/></label>
</div>
