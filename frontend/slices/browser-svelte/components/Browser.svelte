<script lang="ts">
  import { onMount } from "svelte";
  import AiPanel from "./AiPanel.svelte";
  import ChromeBar from "./ChromeBar.svelte";
  import HistoryPanel from "./HistoryPanel.svelte";
  import RemoteView from "./RemoteView.svelte";
  import {
    getBrowserMode,
    subscribeBrowserConfig,
    type BrowserMode,
  } from "../../browser/lib/host-core";
  import {
    createBrowserSession,
    type BrowserSession,
    type BrowserSnapshot,
  } from "../../browser/lib/session-core";
  import {
    readStored,
    writeStored,
    type Bookmark,
    type HistoryEntry,
  } from "../../browser/lib/storage-core";
  import { browserTools, type BrowserToolCtx } from "../../browser/lib/tools";
  import { hostOf, toTarget } from "../../browser/lib/url";

  type Props = {
    registerTools?: (
      collection: typeof browserTools,
      getCtx: () => BrowserToolCtx,
    ) => void | (() => void);
  };
  let { registerTools }: Props = $props();

  const HOME = "https://en.wikipedia.org/wiki/Web_browser";
  const DEFAULT_BOOKMARKS: Bookmark[] = [
    { url: "https://en.wikipedia.org/wiki/Main_Page", title: "Wikipedia" },
    { url: "https://news.ycombinator.com", title: "Hacker News" },
  ];
  const session: BrowserSession = createBrowserSession();
  let snap = $state<BrowserSnapshot>(session.getSnapshot());
  let mode = $state<BrowserMode>(getBrowserMode());
  let bookmarks = $state<Bookmark[]>(DEFAULT_BOOKMARKS);
  let history = $state<HistoryEntry[]>([]);
  let historyOpen = $state(false);
  let aiOpen = $state(false);
  let saving = $state(false);
  let savedPath = $state<string | null>(null);
  let lastHistoryKey = "";

  const toolCtx = (): BrowserToolCtx => {
    const current = session.getSnapshot();
    return {
      state: current.state,
      tabs: current.tabs,
      activeId: current.activeId,
      busy: current.busy,
      navigate: session.navigate,
      newTab: session.newTab,
      closeTab: session.closeTab,
      back: session.back,
      forward: session.forward,
      reload: session.reload,
      scroll: session.scroll,
      click: session.click,
      type: session.type,
      key: session.key,
    };
  };

  onMount(() => {
    bookmarks = readStored("os-vps:browser.bookmarks", DEFAULT_BOOKMARKS);
    history = readStored("os-vps:browser.history", []);
    const stopSnapshot = session.subscribe(() => (snap = session.getSnapshot()));
    let stopSession: (() => void) | null = null;
    const syncMode = () => {
      mode = getBrowserMode();
      if (mode.live && !stopSession) stopSession = session.start();
      else if (!mode.live && stopSession) {
        stopSession();
        stopSession = null;
      }
    };
    syncMode();
    const stopConfig = subscribeBrowserConfig(syncMode);
    const stopTools = registerTools?.(browserTools, toolCtx);
    return () => {
      stopSnapshot();
      stopConfig();
      stopSession?.();
      stopTools?.();
    };
  });

  $effect(() => {
    const url = snap.state.url;
    if (!url || typeof window === "undefined") return;
    const title = snap.state.title || hostOf(url);
    const key = `${url}|${title}`;
    if (key === lastHistoryKey) return;
    lastHistoryKey = key;
    history = [{ url, title, time: Date.now() }, ...history.filter((item) => item.url !== url)].slice(0, 120);
    writeStored("os-vps:browser.history", history);
  });

  const navigate = (value: string) => {
    historyOpen = false;
    void session.navigate(toTarget(value));
  };
  const toggleBookmark = () => {
    const url = snap.state.url;
    if (!url) return;
    bookmarks = bookmarks.some((item) => item.url === url)
      ? bookmarks.filter((item) => item.url !== url)
      : [...bookmarks, { url, title: snap.state.title || hostOf(url) }];
    writeStored("os-vps:browser.bookmarks", bookmarks);
  };
  const clearHistory = () => {
    history = [];
    writeStored("os-vps:browser.history", history);
  };
  async function saveScreenshot() {
    saving = true;
    savedPath = null;
    try {
      const result = await session.saveShot();
      savedPath = result.path ?? result.error ?? "save failed";
    } catch (cause) {
      savedPath = cause instanceof Error ? cause.message : String(cause);
    } finally {
      saving = false;
    }
  }
</script>

{#if !mode.live}
  <div class="grid h-full min-h-0 place-items-center bg-background p-6">
    <div class="max-w-md rounded-xl border bg-card p-6 text-center">
      <p class="text-sm font-semibold">Browser backend is paused</p>
      <p class="mt-2 text-xs text-muted-foreground">Enable live mode through <code>configureBrowserMode()</code>. {mode.demo ? "The bundled demo renderer is available when live mode is enabled." : "Wire your authenticated remote browser adapter before enabling live mode."}</p>
    </div>
  </div>
{:else}
  <div class="flex h-full min-h-0 flex-col bg-card">
    <ChromeBar
      tabs={snap.tabs}
      activeId={snap.activeId}
      url={snap.state.url}
      busy={snap.busy}
      bookmarked={bookmarks.some((item) => item.url === snap.state.url)}
      {bookmarks}
      {aiOpen}
      onSwitch={session.switchTab}
      onClose={session.closeTab}
      onNew={session.newTab}
      onSubmit={navigate}
      onBack={() => void session.back()}
      onForward={() => void session.forward()}
      onReload={() => void session.reload()}
      onHome={() => navigate(HOME)}
      onToggleBookmark={toggleBookmark}
      onHistory={() => (historyOpen = true)}
      onToggleAi={() => (aiOpen = !aiOpen)}
    />
    <div class="relative min-h-0 flex-1 overflow-hidden bg-background">
      <RemoteView
        shot={snap.shot}
        busy={snap.busy}
        live={snap.live}
        {saving}
        savedPath={savedPath}
        onClick={(x, y) => void session.click(x, y)}
        onType={(text) => void session.type(text)}
        onKey={(key) => void session.key(key)}
        onScroll={(dy) => void session.scroll(dy)}
        onSave={() => void saveScreenshot()}
      />
      <AiPanel open={aiOpen} fetchLog={session.agentLog} onClose={() => (aiOpen = false)} />
      <HistoryPanel open={historyOpen} {history} onOpen={navigate} onClear={clearHistory} onClose={() => (historyOpen = false)} />
    </div>
  </div>
{/if}
