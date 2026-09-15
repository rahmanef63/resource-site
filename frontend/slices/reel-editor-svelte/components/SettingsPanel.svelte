<script lang="ts">
  import { untrack } from "svelte";
  import { getSettings, saveSettings, type EditorSettings } from "@/features/reel-editor/lib/settings";
  let { onClose } = $props<{ onClose: () => void }>();
  let settings = $state<EditorSettings>(untrack(() => ({ ...getSettings() })));
  function set(patch: Partial<EditorSettings>) { settings = { ...saveSettings(patch) }; }
</script>
<div class="fixed inset-0 z-50 grid place-items-center p-4">
  <button class="absolute inset-0 bg-black/60" aria-label="Close settings" onclick={onClose}></button>
  <div class="relative z-10 w-full max-w-sm rounded-xl border bg-background p-5 shadow-xl" role="dialog" aria-modal="true" aria-label="Editor settings" tabindex="-1">
    <div class="flex items-center"><strong>Editor settings</strong><button class="ml-auto rounded border px-2 py-1 text-xs" onclick={onClose}>Close</button></div>
    <label class="mt-4 block space-y-1 text-xs"><span>Default image duration — {settings.imageDur.toFixed(1)}s</span><input class="w-full" type="range" min="1" max="10" step="0.5" value={settings.imageDur} oninput={(e)=>set({imageDur:Number(e.currentTarget.value)})}/></label>
    <label class="mt-4 block space-y-1 text-xs"><span>Project media folder</span><input class="w-full rounded border bg-background px-2 py-1 font-mono" value={settings.projectDir} onblur={(e)=>e.currentTarget.value.trim() && set({projectDir:e.currentTarget.value.trim()})}/></label>
    <label class="mt-4 flex items-center gap-2 text-xs"><input type="checkbox" checked={settings.autosave} onchange={(e)=>set({autosave:e.currentTarget.checked})}/> Auto-save project draft</label>
    <p class="mt-4 rounded bg-muted p-2 text-[10px] text-muted-foreground">Uploaded object URLs do not survive reload. File-panel or sample URLs can restore from the saved draft.</p>
  </div>
</div>
