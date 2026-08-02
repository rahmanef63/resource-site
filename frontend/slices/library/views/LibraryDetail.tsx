import Link from "next/link";
import type { LibraryDetailProps } from "../lib/types";
import { DEFAULT_COPY, DEFAULT_KIND_LABELS } from "../lib/defaults";
import { PayloadRender } from "../components/PayloadRender";
import { UpvotePanel } from "../components/UpvotePanel";

// Single library item — header, payload (via PayloadRender), optional
// description, and an attribution footer. Upvoting is opt-in: pass
// `onUpvote` to enable it, else the count renders read-only.
export function LibraryDetail({
  item,
  onUpvote,
  copy: copyOverride,
  kindLabels: kindLabelsOverride,
}: LibraryDetailProps) {
  const copy = { ...DEFAULT_COPY, ...copyOverride };
  const kindLabels = { ...DEFAULT_KIND_LABELS, ...kindLabelsOverride };

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-8">
        <div className="space-y-3">
          <Link href="/library" className="text-[11px] uppercase tracking-wider opacity-60 hover:opacity-100">
            {copy.backLabel}
          </Link>
          <div className="text-[10px] uppercase tracking-wider opacity-60">
            {kindLabels[item.kind] ?? item.kind}
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl leading-tight">{item.title}</h1>
          <p className="text-base opacity-70">{item.excerpt}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <UpvotePanel
            itemId={item._id}
            initial={item.upvotes ?? 0}
            onUpvote={onUpvote}
            label={copy.upvoteLabel}
          />
          {(item.tools ?? []).map((t) => (
            <span
              key={t}
              className="text-[11px] uppercase tracking-wider border-2 border-current/40 rounded px-2 py-0.5"
            >
              {t}
            </span>
          ))}
        </div>

        <PayloadRender item={item} copy={copy} />

        {item.description ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{item.description}</p>
          </div>
        ) : null}

        <footer className="border-t-2 border-current/30 pt-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider">{copy.attributionHeading}</h2>
          <dl className="text-sm grid gap-1.5 sm:grid-cols-[120px_1fr]">
            {item.sourceName ? (
              <>
                <dt className="opacity-60">{copy.sourceLabel}</dt>
                <dd>
                  {item.sourceUrl ? (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="underline underline-offset-4"
                    >
                      {item.sourceName} ↗
                    </a>
                  ) : (
                    item.sourceName
                  )}
                </dd>
              </>
            ) : null}
            {item.license ? (
              <>
                <dt className="opacity-60">{copy.licenseLabel}</dt>
                <dd>{item.license}</dd>
              </>
            ) : null}
            {(item.tags ?? []).length > 0 ? (
              <>
                <dt className="opacity-60">{copy.tagsLabel}</dt>
                <dd className="flex flex-wrap gap-1">
                  {(item.tags ?? []).map((t) => (
                    <span key={t} className="text-xs">
                      #{t}
                    </span>
                  ))}
                </dd>
              </>
            ) : null}
          </dl>
        </footer>
      </div>
    </section>
  );
}
