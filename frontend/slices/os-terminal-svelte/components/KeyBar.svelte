<script lang="ts">
  export type KeyInterceptor = (data: string) => string;

  type Props = {
    sendInput: (data: string) => void;
    setInterceptor?: (interceptor: KeyInterceptor | null) => void;
  };

  type KeyDef = { label: string; aria: string; seq: string };
  let { sendInput, setInterceptor }: Props = $props();
  let ctrl = $state(false);
  let alt = $state(false);

  const keys: KeyDef[] = [
    { label: "Esc", aria: "Escape", seq: "\x1b" },
    { label: "Tab", aria: "Tab", seq: "\t" },
    { label: "↑", aria: "Arrow up", seq: "\x1b[A" },
    { label: "↓", aria: "Arrow down", seq: "\x1b[B" },
    { label: "←", aria: "Arrow left", seq: "\x1b[D" },
    { label: "→", aria: "Arrow right", seq: "\x1b[C" },
    { label: "^C", aria: "Control C — interrupt", seq: "\x03" },
    { label: "^D", aria: "Control D — end of input", seq: "\x04" },
    { label: "^L", aria: "Control L — clear screen", seq: "\x0c" },
    { label: "|", aria: "Pipe", seq: "|" },
    { label: "~", aria: "Tilde", seq: "~" },
    { label: "/", aria: "Slash", seq: "/" },
  ];

  const printable = (data: string) => data.length === 1 && data >= " " && data !== "\x7f";

  function applyMods(data: string, useCtrl: boolean, useAlt: boolean) {
    let output = data;
    if (useCtrl && /^[a-z]$/i.test(output)) {
      output = String.fromCharCode(output.toUpperCase().charCodeAt(0) & 0x1f);
    }
    return useAlt ? `\x1b${output}` : output;
  }

  function consume(data: string) {
    if ((!ctrl && !alt) || !printable(data)) return data;
    const output = applyMods(data, ctrl, alt);
    ctrl = false;
    alt = false;
    return output;
  }

  $effect(() => {
    setInterceptor?.(consume);
    return () => setInterceptor?.(null);
  });

  function press(sequence: string) {
    sendInput(ctrl || alt ? applyMods(sequence, ctrl && printable(sequence), alt && printable(sequence)) : sequence);
    ctrl = false;
    alt = false;
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) sendInput(text);
    } catch {
      // Clipboard permission is optional.
    }
  }
</script>

<div
  role="toolbar"
  aria-label="Terminal keys"
  class="flex shrink-0 items-center gap-1 overflow-x-auto border-t border-white/10 px-1.5 py-1.5 [scrollbar-width:none]"
>
  {#each keys as key (key.label)}
    <button
      type="button"
      aria-label={key.aria}
      title={key.aria}
      onpointerdown={(event) => event.preventDefault()}
      onclick={() => press(key.seq)}
      class="h-9 min-w-9 shrink-0 rounded-md bg-white/10 px-2 font-mono text-xs text-[#dfe3ea] hover:bg-white/20"
    >{key.label}</button>
  {/each}
  <button
    type="button"
    aria-pressed={ctrl}
    onclick={() => (ctrl = !ctrl)}
    class={`h-9 rounded-md px-2 font-mono text-xs ${ctrl ? "bg-[#5be0c8] text-[#0d0e12]" : "bg-white/10 text-[#dfe3ea]"}`}
  >Ctrl</button>
  <button
    type="button"
    aria-pressed={alt}
    onclick={() => (alt = !alt)}
    class={`h-9 rounded-md px-2 font-mono text-xs ${alt ? "bg-[#5be0c8] text-[#0d0e12]" : "bg-white/10 text-[#dfe3ea]"}`}
  >Alt</button>
  <button
    type="button"
    onclick={() => void paste()}
    class="h-9 rounded-md bg-white/10 px-2 font-mono text-xs text-[#dfe3ea] hover:bg-white/20"
  >Paste</button>
</div>
