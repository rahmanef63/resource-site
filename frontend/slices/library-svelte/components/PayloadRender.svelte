<script lang="ts">
  import CopyButton from "./CopyButton.svelte";
  import {
    formatLibraryFileSize,
    libraryVideoSource,
  } from "@/features/library/lib/core";
  import type { LibraryCopy, LibraryItem } from "@/features/library/lib/types";

  let { item, copy }: { item: LibraryItem; copy: LibraryCopy } = $props();
  let media = $derived(libraryVideoSource(item.videoUrl));
</script>

{#if item.kind === "prompt"}
  <div class="space-y-3">
    {#if item.promptModel}
      <span class="inline-block rounded-sm border-2 border-current px-2 py-0.5 text-[10px] uppercase tracking-wider opacity-70">
        Model: {item.promptModel}
      </span>
    {/if}
    <pre class="whitespace-pre-wrap break-words rounded-md border-2 border-current p-4 text-sm leading-relaxed" translate="no">{item.promptText}</pre>
    {#if item.promptText}
      <CopyButton text={item.promptText} label={copy.copyPromptLabel} copiedLabel={copy.copiedLabel} />
    {/if}
  </div>
{:else if item.kind === "image" && item.imageUrl}
  <figure class="space-y-2">
    <div class="overflow-hidden rounded-md border-2 border-current">
      <img src={item.imageUrl} alt={item.imageAlt ?? item.title} loading="lazy" class="h-auto w-full" />
    </div>
    {#if item.imageAlt}<figcaption class="text-xs opacity-60">{item.imageAlt}</figcaption>{/if}
  </figure>
{:else if item.kind === "video" && media}
  {#if media.kind === "youtube"}
    <div class="aspect-video overflow-hidden rounded-md border-2 border-current">
      <iframe
        src={media.src}
        title={item.title}
        class="h-full w-full"
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  {:else if media.kind === "vimeo"}
    <div class="aspect-video overflow-hidden rounded-md border-2 border-current">
      <iframe src={media.src} title={item.title} class="h-full w-full" allow="autoplay; fullscreen" allowfullscreen></iframe>
    </div>
  {:else}
    <video src={media.src} controls class="w-full rounded-md border-2 border-current">
      <track kind="captions" src={item.videoCaptionsUrl} />
    </video>
  {/if}
{:else if item.kind === "link" && item.linkUrl}
  <a
    href={item.linkUrl}
    target="_blank"
    rel="noopener noreferrer nofollow ugc"
    class="inline-flex items-center gap-2 rounded-md border-2 border-current bg-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
  >
    {copy.openLinkLabel}
  </a>
{:else if item.kind === "download" && item.fileStorageId}
  <a
    href={item.fileStorageId}
    download={item.fileName ?? item.slug}
    class="inline-flex items-center gap-2 rounded-md border-2 border-current bg-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
  >
    {copy.downloadLabel} {item.fileName ?? "file"}{item.fileSize ? ` · ${formatLibraryFileSize(item.fileSize)}` : ""}
  </a>
{:else if item.kind === "snippet"}
  <div class="space-y-3">
    {#if item.snippetLang}
      <span class="inline-block rounded-sm border-2 border-current px-2 py-0.5 text-[10px] uppercase tracking-wider opacity-70">
        {item.snippetLang}
      </span>
    {/if}
    <pre class="overflow-x-auto rounded-md border-2 border-current p-4 text-xs leading-relaxed" translate="no"><code translate="no" class="notranslate">{item.snippetCode}</code></pre>
    {#if item.snippetCode}
      <CopyButton text={item.snippetCode} label={copy.copyCodeLabel} copiedLabel={copy.copiedLabel} />
    {/if}
  </div>
{/if}
