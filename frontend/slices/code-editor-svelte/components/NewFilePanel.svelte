<script lang="ts">
  type Props = {
    open: boolean;
    onClose: () => void;
    onCreate: (dir: string, name: string) => void;
  };
  let { open, onClose, onCreate }: Props = $props();
  let name = $state("untitled.ts");
  let dir = $state("/Projects");
  const folders = ["/", "/Documents", "/Projects", "/apps"];

  function submit() {
    if (!name.trim()) return;
    onCreate(dir, name.trim());
    onClose();
  }
</script>

{#if open}
  <div class="absolute inset-0 z-30 grid place-items-center bg-black/45 p-4" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-file-title"
      class="w-full max-w-sm rounded-xl border border-white/10 bg-[#1e1e22] p-4 shadow-xl"
    >
      <h2 id="new-file-title" class="text-sm font-semibold text-[#e6e6e6]">New file</h2>
      <p class="mt-1 text-xs text-[#8b929d]">Pick a folder and file name.</p>
      <label class="mt-4 block text-xs text-[#9aa0aa]">
        Folder
        <select bind:value={dir} class="mt-1 w-full rounded-md border border-[#34343c] bg-[#16161a] px-2.5 py-2 text-sm text-[#e6e6e6]">
          {#each folders as folder (folder)}<option value={folder}>{folder}</option>{/each}
        </select>
      </label>
      <label class="mt-3 block text-xs text-[#9aa0aa]">
        File name
        <input bind:value={name} class="mt-1 w-full rounded-md border border-[#34343c] bg-[#16161a] px-2.5 py-2 text-sm text-[#e6e6e6]" onkeydown={(event) => { if (event.key === "Enter") submit(); }} />
      </label>
      <div class="mt-4 flex justify-end gap-2">
        <button type="button" class="rounded-md px-3 py-1.5 text-xs text-[#9aa0aa] hover:bg-white/5" onclick={onClose}>Cancel</button>
        <button type="button" class="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground" onclick={submit}>Create</button>
      </div>
    </div>
  </div>
{/if}
