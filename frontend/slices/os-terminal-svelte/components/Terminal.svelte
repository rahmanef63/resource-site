<script lang="ts">
  import { onMount } from "svelte";
  import {
    getTerminalMode,
    subscribeTerminal,
    type TerminalOsApi,
  } from "../../os-terminal/lib/host-core";
  import { hasPty, subscribePty } from "../../os-terminal/lib/use-pty";
  import ExecTerminal from "./ExecTerminal.svelte";
  import PtyTerminal from "./PtyTerminal.svelte";

  let mode = $state<TerminalOsApi["mode"]>(getTerminalMode());
  let ptyConfigured = $state(hasPty());
  let ptyError = $state<string | null>(null);

  onMount(() => {
    const unsubscribeMode = subscribeTerminal(() => {
      mode = getTerminalMode();
      ptyError = null;
    });
    const unsubscribePty = subscribePty(() => {
      ptyConfigured = hasPty();
      ptyError = null;
    });
    return () => {
      unsubscribeMode();
      unsubscribePty();
    };
  });
</script>

<div class="flex h-full w-full flex-col">
  {#if mode === "live" && ptyConfigured && ptyError === null}
    <PtyTerminal onFallback={(message) => (ptyError = message)} />
  {:else}
    {#if mode === "live" && ptyConfigured && ptyError !== null}
      <div class="flex items-center gap-2 px-2 py-1 text-[11px] font-semibold text-white bg-[#a14545]">
        <span class="min-w-0 flex-1 truncate">PTY unavailable: {ptyError} — basic exec mode</span>
        <button type="button" onclick={() => (ptyError = null)} class="rounded bg-white/15 px-2 py-0.5 hover:bg-white/25">Retry PTY</button>
      </div>
    {/if}
    <div class="min-h-0 flex-1">
      <ExecTerminal />
    </div>
  {/if}
</div>
