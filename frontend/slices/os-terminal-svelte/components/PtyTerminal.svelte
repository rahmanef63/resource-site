<script lang="ts">
  import { onMount } from "svelte";
  import {
    createPtyScreen,
    startPty,
    type PtyHandle,
    type PtyScreen,
    type PtyStatus,
  } from "../../os-terminal/lib/use-pty";
  import KeyBar, { type KeyInterceptor } from "./KeyBar.svelte";

  type Props = { onFallback: (message: string) => void };
  let { onFallback }: Props = $props();
  let host = $state<HTMLDivElement>();
  let status = $state<PtyStatus>({ kind: "connecting" });
  let handle: PtyHandle | null = null;
  let screen: PtyScreen | null = null;
  let observer: ResizeObserver | null = null;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  let interceptor: KeyInterceptor | null = null;
  let generation = 0;

  function statusLabel(value: PtyStatus): string {
    if (value.kind === "exited") {
      return `shell exited${value.code !== null ? ` (code ${value.code})` : ""}`;
    }
    if (value.kind === "error") return value.message;
    return value.kind;
  }

  function disposeSession() {
    generation += 1;
    clearTimeout(resizeTimer);
    observer?.disconnect();
    observer = null;
    handle?.dispose();
    handle = null;
    screen?.dispose();
    screen = null;
  }

  function fail(cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    status = { kind: "error", message };
    onFallback(message);
  }

  async function openSession() {
    if (!host) return;
    const token = ++generation;
    status = { kind: "connecting" };
    let nextScreen: PtyScreen;
    try {
      nextScreen = await createPtyScreen(host);
    } catch (cause) {
      fail(cause);
      return;
    }
    if (token !== generation) return nextScreen.dispose();
    screen = nextScreen;
    screen.fit();

    try {
      handle = await startPty({
        cols: screen.cols,
        rows: screen.rows,
        onData: (bytes) => screen?.write(bytes),
        onStatus: (next) => {
          if (token === generation) status = next;
        },
      });
    } catch (cause) {
      fail(cause);
      return;
    }
    if (token !== generation) return handle.dispose();

    screen.onData((data) => handle?.write(interceptor ? interceptor(data) : data));
    observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!screen || !handle) return;
        screen.fit();
        handle.resize(screen.cols, screen.rows);
      }, 80);
    });
    observer.observe(host);
    screen.focus();
  }

  function restart() {
    disposeSession();
    void openSession();
  }

  onMount(() => {
    void openSession();
    return disposeSession;
  });
</script>

<div class="flex h-full w-full flex-col bg-[#0d0e12]">
  {#if status.kind === "live"}
    <div class="px-2 py-1 text-[11px] font-semibold text-[#0d0e12] bg-[#5be0c8]">
      ● LIVE PTY — interactive shell on this host
    </div>
  {:else if status.kind === "connecting"}
    <div class="px-2 py-1 text-[11px] font-semibold text-[#0d0e12] bg-[#f5c451]">
      ● connecting to the host shell…
    </div>
  {:else}
    <div class="flex items-center gap-2 px-2 py-1 text-[11px] font-semibold text-white bg-[#a14545]">
      <span class="min-w-0 flex-1 truncate">○ {statusLabel(status)}</span>
      <button type="button" onclick={restart} class="rounded bg-white/15 px-2 py-0.5 hover:bg-white/25">Restart</button>
      <button type="button" onclick={() => onFallback(statusLabel(status))} class="rounded bg-white/15 px-2 py-0.5 hover:bg-white/25">Basic mode</button>
    </div>
  {/if}
  <div class="min-h-0 flex-1 p-1.5">
    <div bind:this={host} class="h-full w-full"></div>
  </div>
  <KeyBar
    sendInput={(data) => handle?.write(data)}
    setInterceptor={(next) => (interceptor = next)}
  />
</div>
