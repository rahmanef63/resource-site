<script lang="ts">
  import { newCommentId, openCount, type MdComment } from "../../markdown/lib/comments";
  import { normalizeMarkdownTabs, MARKDOWN_TAB_LABEL, type MarkdownTab } from "../../markdown/lib/page-core";
  import { parseMarkdown } from "../../markdown/lib/parse";
  import MarkdownReader from "./MarkdownReader.svelte";
  import WriteTab from "./WriteTab.svelte";
  import ReviewTab from "./ReviewTab.svelte";

  let {
    content,
    onContentChange,
    tabs = ["read"],
    comments,
    onAddComment,
    onResolveComment,
    commentAuthor,
    title,
    icon,
    className = "",
  }: {
    content: string;
    onContentChange?: (next: string) => void;
    tabs?: MarkdownTab[];
    comments?: MdComment[];
    onAddComment?: (comment: MdComment) => void;
    onResolveComment?: (id: string) => void;
    commentAuthor?: string;
    title?: string;
    icon?: string;
    className?: string;
  } = $props();

  const initialContent = () => content;
  const initialTab = () => normalizeMarkdownTabs(tabs)[0] ?? "read";
  let localContent = $state(initialContent());
  let localComments = $state<MdComment[]>([]);
  let activeTab = $state<MarkdownTab>(initialTab());
  let lastExternalContent = $state(initialContent());

  const tabList = $derived(normalizeMarkdownTabs(tabs));
  const markdown = $derived(onContentChange ? content : localContent);
  const allComments = $derived(comments ?? localComments);
  const nodes = $derived(parseMarkdown(markdown));
  const open = $derived(openCount(allComments));

  $effect(() => {
    if (content !== lastExternalContent) {
      lastExternalContent = content;
      if (!onContentChange) localContent = content;
    }
  });

  $effect(() => {
    if (!tabList.includes(activeTab)) activeTab = tabList[0] ?? "read";
  });

  function setMarkdown(next: string) {
    if (onContentChange) onContentChange(next);
    else localContent = next;
  }

  function addComment(anchor: number | null, text: string) {
    const comment: MdComment = {
      id: newCommentId(),
      anchor,
      text,
      author: commentAuthor,
      createdAt: Date.now(),
    };
    if (onAddComment) onAddComment(comment);
    else localComments = [...localComments, comment];
  }

  function resolveComment(id: string) {
    if (onResolveComment) onResolveComment(id);
    else localComments = localComments.map((comment) => comment.id === id ? { ...comment, resolved: true } : comment);
  }
</script>

<article class={`mx-auto w-full ${tabList.length === 1 ? "max-w-3xl" : "max-w-4xl"} px-4 py-6 ${className}`}>
  {#if title}
    <header class="mb-4 flex items-center gap-2">
      {#if icon}<span class="text-2xl leading-none">{icon}</span>{/if}
      <h1 class="text-3xl font-bold tracking-tight">{title}</h1>
    </header>
  {/if}

  {#if tabList.length > 1}
    <div class="mb-4 inline-flex rounded-md bg-muted p-1" role="tablist" aria-label="Markdown surfaces">
      {#each tabList as tab}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === tab}
          class={`rounded px-3 py-1.5 text-xs font-medium ${activeTab === tab ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          onclick={() => (activeTab = tab)}
        >
          {MARKDOWN_TAB_LABEL[tab]}
          {#if tab === "review" && open > 0}<span class="ml-1 rounded-full bg-amber-500/20 px-1.5 text-[10px] font-semibold text-amber-700">{open}</span>{/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if activeTab === "read"}
    <MarkdownReader nodes={nodes} maxWidth="none" className="px-0 py-0" />
  {:else if activeTab === "write"}
    <WriteTab value={markdown} onChange={setMarkdown} />
  {:else}
    <ReviewTab nodes={nodes} comments={allComments} onAdd={addComment} onResolve={resolveComment} />
  {/if}
</article>
