<script lang="ts">
  import type { Block } from "@/features/notion-ui/shared/block-core";
  let { block, readOnly=false, onUpdate, onNavigatePage } = $props<{ block: Block; readOnly?: boolean; onUpdate: (patch: Partial<Block>) => void; onNavigatePage?: (id:string)=>void }>();
  const field="w-full rounded-md border bg-background px-2 py-1.5 text-sm";
  function rows(value:string){ return value.split("\n").map((r)=>r.split("|").map((c)=>c.trim())); }
</script>
{#if block.type === "divider"}<hr class="my-3 border-border" />
{:else if block.type === "image"}
  <div class="space-y-2">{#if block.url}<img src={block.url} alt={block.caption ?? ""} class="max-h-80 max-w-full rounded-lg object-contain" />{/if}{#if !readOnly}<input class={field} value={block.url??""} placeholder="Image URL" oninput={(e)=>onUpdate({url:e.currentTarget.value})}/>{/if}{#if block.caption || !readOnly}<input class={field} value={block.caption??""} placeholder="Caption" disabled={readOnly} oninput={(e)=>onUpdate({caption:e.currentTarget.value})}/>{/if}</div>
{:else if block.type === "video"}<div class="space-y-2">{#if block.url}<video src={block.url} controls class="max-h-80 w-full rounded-lg"><track kind="captions" label="Captions" /></video>{/if}{#if !readOnly}<input class={field} value={block.url??""} placeholder="Video URL" oninput={(e)=>onUpdate({url:e.currentTarget.value})}/>{/if}</div>
{:else if block.type === "audio"}<div class="space-y-2">{#if block.url}<audio src={block.url} controls class="w-full"></audio>{/if}{#if !readOnly}<input class={field} value={block.url??""} placeholder="Audio URL" oninput={(e)=>onUpdate({url:e.currentTarget.value})}/>{/if}</div>
{:else if block.type === "embed"}<div class="rounded-lg border bg-muted/20 p-3"><p class="truncate text-xs">Embed: {block.url || "No URL"}</p>{#if !readOnly}<input class={`${field} mt-2`} value={block.url??""} placeholder="https://…" oninput={(e)=>onUpdate({url:e.currentTarget.value})}/>{/if}</div>
{:else if block.type === "code"}<textarea class="min-h-28 w-full resize-y rounded-lg border bg-muted/30 p-3 font-mono text-xs" value={block.text} disabled={readOnly} oninput={(e)=>onUpdate({text:e.currentTarget.value})}></textarea>
{:else if block.type === "equation"}<div class="rounded-lg border bg-muted/20 p-3 text-center font-mono">{block.text || "E = mc²"}</div>
{:else if block.type === "table"}
  <div class="overflow-x-auto rounded-lg border"><table class="w-full text-xs"><tbody>{#each (block.tableRows??rows(block.text||"A | B\n1 | 2")) as row,ri (ri)}<tr>{#each row as cell,ci (`${ri}-${ci}`)}<td class="border-b border-r p-2">{cell}</td>{/each}</tr>{/each}</tbody></table></div>
  {#if !readOnly}<textarea class={`${field} mt-2 min-h-16 font-mono text-xs`} value={block.text} placeholder="A | B\n1 | 2" oninput={(e)=>onUpdate({text:e.currentTarget.value,tableRows:rows(e.currentTarget.value)})}></textarea>{/if}
{:else if block.type === "page"}<button class="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left hover:bg-muted" onclick={()=>block.pageId&&onNavigatePage?.(block.pageId)}>▤ <span>{block.text || "Untitled page"}</span></button>
{:else if block.type === "database"}<div class="rounded-lg border bg-muted/20 p-4 text-sm"><strong>Database</strong><p class="text-xs text-muted-foreground">{block.databaseId || "Connect a database renderer in the host."}</p></div>
{:else if block.type === "button"}<a href={block.url||"#"} class="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">{block.text||"Button"}</a>
{:else if block.type === "toggle"}<details open={!block.collapsed} class="rounded-md border px-3 py-2"><summary class="cursor-pointer font-medium">{block.text||"Toggle"}</summary><div class="mt-2 space-y-1 text-sm text-muted-foreground">{#each block.children??[] as child (child.id)}<div>{child.text||child.type}</div>{/each}</div></details>
{:else if block.type.startsWith("columns")}<div class="grid gap-2" style={`grid-template-columns:repeat(${Number(block.type.slice(-1))||2},minmax(0,1fr))`}>{#each block.columns??[] as col,ci (ci)}<div class="min-h-16 rounded border p-2">{#each col as child (child.id)}<p class="text-sm">{child.text||child.type}</p>{/each}</div>{/each}</div>
{:else}<textarea class={field} value={block.text} disabled={readOnly} oninput={(e)=>onUpdate({text:e.currentTarget.value})}></textarea>{/if}
