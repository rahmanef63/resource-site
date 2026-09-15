<script lang="ts">
  let { x, y, readonly = false, onOpen, onRename, onMove, onCopy, onCut, onTrash, onRemove, onProperties, onClose } = $props<{
    x: number; y: number; readonly?: boolean;
    onOpen: () => void; onRename: () => void; onMove: () => void; onCopy: () => void; onCut: () => void; onTrash: () => void; onRemove: () => void; onProperties: () => void; onClose: () => void;
  }>();
</script>
<div class="fixed inset-0 z-40" aria-hidden="true" onclick={onClose}></div>
<div class="fixed z-50 min-w-40 rounded-lg border bg-popover p-1 text-popover-foreground shadow-xl" style={`left:${x}px;top:${y}px`} role="menu">
  <button class="block w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted" role="menuitem" onclick={onOpen}>Open</button>
  <button class="block w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted disabled:opacity-40" disabled={readonly} role="menuitem" onclick={onRename}>Rename</button>
  <button class="block w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted disabled:opacity-40" disabled={readonly} role="menuitem" onclick={onMove}>Move…</button>
  <button class="block w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted" role="menuitem" onclick={onCopy}>Copy</button>
  <button class="block w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted disabled:opacity-40" disabled={readonly} role="menuitem" onclick={onCut}>Cut</button>
  <button class="block w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted disabled:opacity-40" disabled={readonly} role="menuitem" onclick={onTrash}>Move to Trash</button>
  <button class="block w-full rounded px-3 py-1.5 text-left text-xs hover:bg-muted" role="menuitem" onclick={onProperties}>Properties</button>
  <div class="my-1 h-px bg-border"></div>
  <button class="block w-full rounded px-3 py-1.5 text-left text-xs text-destructive hover:bg-muted disabled:opacity-40" disabled={readonly} role="menuitem" onclick={onRemove}>Delete permanently</button>
</div>
