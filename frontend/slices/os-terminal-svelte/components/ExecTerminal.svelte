<script lang="ts">
  import { onMount, tick } from "svelte";
  import { NEOFETCH, run, seedFs, type Line } from "../../os-terminal/lib/commands";
  import {
    getOsApi,
    getTerminalMode,
    subscribeTerminal,
  } from "../../os-terminal/lib/host-core";

  const fs = seedFs();
  let mode = $state(getTerminalMode());
  let cwd = $state(getTerminalMode() === "live" ? "~" : "/");
  let lines = $state<Line[]>([{ t: "sys", v: 'topside shell · type "help" for commands' }]);
  let input = $state("");
  let history = $state<string[]>([]);
  let historyPointer = $state(-1);
  let body = $state<HTMLDivElement>();
  let inputElement = $state<HTMLInputElement>();

  const lineColor = (kind: Line["t"]) =>
    kind === "err" ? "#ff7a7a" : kind === "sys" ? "#7a8aff" : "#cfd4de";

  function scrollEnd() {
    void tick().then(() => {
      if (body) body.scrollTop = body.scrollHeight;
    });
  }

  function append(next: Line[]) {
    lines = [...lines, ...next];
    scrollEnd();
  }

  onMount(() => {
    inputElement?.focus();
    return subscribeTerminal(() => {
      const next = getTerminalMode();
      if (next === mode) return;
      mode = next;
      cwd = next === "live" ? "~" : "/";
      append([
        {
          t: "sys",
          v: next === "live"
            ? "● switched to LIVE — real shell on this host"
            : "○ switched to MOCK — demo data",
        },
      ]);
    });
  });

  async function submit() {
    const command = input;
    const commandCwd = cwd;
    append([{ t: "cmd", v: command, cwd: commandCwd }]);
    input = "";
    if (command.trim()) history = [command, ...history];
    historyPointer = -1;
    const output = await run(command, {
      fs,
      cwd: commandCwd,
      setCwd: (next) => (cwd = next),
      api: getOsApi(),
      clear: () => (lines = []),
    });
    if (output.length) append(output);
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === "Enter") {
      void submit();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.min(history.length - 1, historyPointer + 1);
      if (history[next] != null) {
        historyPointer = next;
        input = history[next];
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = historyPointer - 1;
      if (next < 0) {
        historyPointer = -1;
        input = "";
      } else {
        historyPointer = next;
        input = history[next];
      }
    }
  }
</script>

<div
  bind:this={body}
  class="h-full w-full overflow-y-auto bg-[#0d0e12] p-3.5 font-mono text-[12.5px] leading-relaxed text-[#dfe3ea] select-text"
>
  <div
    class="mb-2 select-none rounded px-2 py-1 text-[11px] font-semibold text-[#0d0e12]"
    class:bg-[#5be0c8]={mode === "live"}
    class:bg-[#f5c451]={mode === "mock"}
  >
    {mode === "live"
      ? "● LIVE — commands run on this host"
      : "○ MOCK — demo data (wire configureTerminal to run real commands)"}
  </div>

  {#each lines as line, index (`${index}:${line.t}:${line.v}`)}
    {#if line.t === "fetch"}
      <div class="my-1.5 flex gap-[18px]">
        <pre class="font-bold leading-tight text-[#5be0c8]">{NEOFETCH.logo}</pre>
        <div class="leading-relaxed">
          <div class="text-[#7a8aff]">root@topside</div>
          {#each line.rows ?? NEOFETCH.rows as row (row[0])}
            <div><span class="text-[#5be0c8]">{row[0].padEnd(8, "-")}</span> {row[1]}</div>
          {/each}
        </div>
      </div>
    {:else if line.t === "cmd"}
      <div class="whitespace-pre-wrap">
        <span class="text-[#5be0c8]">root@topside<span class="text-[#7a8aff]">:{line.cwd ?? "/"}</span>$ </span>{line.v}
      </div>
    {:else}
      <div class="whitespace-pre-wrap" style:color={lineColor(line.t)}>{line.v}</div>
    {/if}
  {/each}

  <div class="flex whitespace-pre">
    <span class="text-[#5be0c8]">root@topside<span class="text-[#7a8aff]">:{cwd}</span>$ </span>
    <input
      bind:this={inputElement}
      bind:value={input}
      onkeydown={onKey}
      spellcheck="false"
      aria-label="Terminal command"
      class="flex-1 border-none bg-transparent font-[inherit] text-[length:inherit] text-white outline-none"
    />
  </div>
</div>
