<script lang="ts">
  import { highlight, type Lang } from "../../code-editor/lib/highlight";
  import { lineCol } from "../../code-editor/lib/util";

  type Props = {
    value: string;
    lang: Lang;
    onChange: (value: string) => void;
    onCursor: (pos: { ln: number; col: number }) => void;
  };
  let { value, lang, onChange, onCursor }: Props = $props();
  let pre = $state<HTMLPreElement>();
  let gutter = $state<HTMLDivElement>();
  let html = $derived(highlight(value, lang));
  let lines = $derived(value.split("\n").length);

  function syncScroll(event: Event) {
    const area = event.currentTarget as HTMLTextAreaElement;
    if (pre) { pre.scrollTop = area.scrollTop; pre.scrollLeft = area.scrollLeft; }
    if (gutter) gutter.style.transform = `translateY(${-area.scrollTop}px)`;
  }
  function report(area: HTMLTextAreaElement) { onCursor(lineCol(value, area.selectionStart)); }
  function keydown(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key !== "Tab") return;
    event.preventDefault();
    const area = event.currentTarget as HTMLTextAreaElement;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    onChange(`${value.slice(0, start)}  ${value.slice(end)}`);
    requestAnimationFrame(() => { area.selectionStart = area.selectionEnd = start + 2; });
  }
</script>

<div class="editor relative flex-1 overflow-hidden bg-[#1e1e22] font-mono text-[12.5px] leading-5">
  <div class="absolute inset-y-0 left-0 w-[54px] overflow-hidden border-r border-[#2a2a30] bg-[#1a1a1e]">
    <div bind:this={gutter} class="py-2.5 will-change-transform">
      {#each Array(lines) as _, index (index)}
        <div class="h-5 px-2.5 text-right tabular-nums text-[#565c66]">{index + 1}</div>
      {/each}
    </div>
  </div>
  <div class="absolute inset-y-0 right-0 left-[54px]">
    <pre bind:this={pre} aria-hidden="true" class="ce-pre pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre px-3.5 py-2.5 text-[#d4d4d4]" style="tab-size:2">{@html html}</pre>
    <textarea
      {value}
      spellcheck="false"
      wrap="off"
      aria-label="Code editor"
      class="absolute inset-0 m-0 h-full w-full resize-none overflow-auto whitespace-pre border-0 bg-transparent px-3.5 py-2.5 font-mono text-[12.5px] leading-5 text-transparent caret-white outline-none"
      style="tab-size:2"
      oninput={(event) => onChange(event.currentTarget.value)}
      onscroll={syncScroll}
      onclick={(event) => report(event.currentTarget)}
      onkeyup={(event) => report(event.currentTarget)}
      onkeydown={keydown}
    ></textarea>
  </div>
</div>

<style>
  :global(.ce-pre .tok-cmt){color:#6a9955;font-style:italic}
  :global(.ce-pre .tok-str){color:#ce9178}
  :global(.ce-pre .tok-num){color:#b5cea8}
  :global(.ce-pre .tok-kw){color:#569cd6}
  :global(.ce-pre .tok-fn){color:#dcdcaa}
  :global(.ce-pre .tok-h){color:#569cd6;font-weight:600}
</style>
