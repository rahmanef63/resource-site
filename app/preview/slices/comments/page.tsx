import { MoreHorizontal, CornerDownRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SlicePreviewLayout,
  PreviewSection,
} from "@/components/slice-previews/preview-layout";

const COMMENTS = [
  {
    id: "c1", author: "Alice", initials: "A", color: "from-violet-500 to-fuchsia-500",
    text: "Should we split this section out? It's reading long.", ts: "2h",
    replies: [
      { id: "r1", author: "Bob", initials: "B", color: "from-sky-500 to-emerald-500", text: "Agree — let's pull it into its own page.", ts: "1h" },
      { id: "r2", author: "Carol", initials: "C", color: "from-amber-500 to-rose-500", text: "Could hide it behind a disclosure too.", ts: "55m" },
    ],
  },
  { id: "c2", author: "Bob", initials: "B", color: "from-sky-500 to-emerald-500", text: 'Typo in the heading — "protable" → portable.', ts: "30m", resolved: true, replies: [] },
  { id: "c3", author: "Carol", initials: "C", color: "from-amber-500 to-rose-500", text: "Love the diagram. Add caption text for screen readers?", ts: "8m", replies: [] },
];

function Avatar({ initials, color, size = "size-7" }: { initials: string; color: string; size?: string }) {
  return <div className={`${size} grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${color} text-[10px] font-bold text-white`}>{initials}</div>;
}

/** Comments preview — mobile-first thread (defaultView: "mobile"). Renders the
 *  buildThread() nesting the slice now ships. Responsive: tight gutters on
 *  phone, roomier on desktop. */
export default function Page() {
  return (
    <SlicePreviewLayout
      title="Comments — Threaded"
      kind="full"
      description="Polymorphic target, real reply nesting (parentId + buildThread tree), renderless adapter API."
      maxWidth="6xl"
    >
      <PreviewSection title="Thread" hint="oldest-first, replies nested by parentId">
        <div className="mx-auto max-w-2xl space-y-3">
          {COMMENTS.map((c) => (
            <article key={c.id} className={`rounded-xl border bg-card p-3 sm:p-4 ${c.resolved ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-2 sm:gap-3">
                <Avatar initials={c.initials} color={c.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{c.author}</span>
                    <span className="text-[10px] text-muted-foreground">{c.ts} ago</span>
                    {c.resolved && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3" /> Resolved
                      </span>
                    )}
                    {!c.resolved && (
                      <Button variant="ghost" size="icon" type="button" className="ml-auto size-auto p-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-1.5 break-words text-sm">{c.text}</p>
                  {c.replies.length > 0 && (
                    <div className="mt-3 space-y-2.5 border-l-2 border-border/40 pl-3 sm:pl-4">
                      {c.replies.map((r) => (
                        <div key={r.id} className="flex items-start gap-2">
                          <CornerDownRight className="mt-1 size-3 shrink-0 text-muted-foreground/60" />
                          <Avatar initials={r.initials} color={r.color} size="size-6" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs">
                              <span className="font-semibold">{r.author}</span>{" "}
                              <span className="text-muted-foreground">{r.ts} ago</span>
                            </div>
                            <p className="break-words text-xs">{r.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!c.resolved && (
                    <div className="mt-3 flex items-center gap-3">
                      <Button variant="ghost" type="button" className="h-auto p-0 text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground">Reply</Button>
                      <Button variant="ghost" type="button" className="h-auto p-0 text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground">Resolve</Button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
