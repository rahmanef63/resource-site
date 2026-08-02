import Image from "next/image";
import { CopyButton } from "./CopyButton";
import type { LibraryCopy, LibraryItem } from "../lib/types";

// Switches on `item.kind` to render the kind-specific payload. Video
// embeds YouTube (nocookie) / Vimeo when the URL matches, else falls
// back to a native <video>. `prompt`/`snippet` get a CopyButton.
export function PayloadRender({
  item,
  copy,
}: {
  item: LibraryItem;
  copy: LibraryCopy;
}) {
  switch (item.kind) {
    case "prompt":
      return (
        <div className="space-y-3">
          {item.promptModel ? (
            <span className="inline-block border-2 border-current rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider opacity-70">
              Model: {item.promptModel}
            </span>
          ) : null}
          <pre
            className="border-2 border-current rounded-md p-4 text-sm whitespace-pre-wrap break-words leading-relaxed"
            translate="no"
          >
            {item.promptText}
          </pre>
          {item.promptText ? (
            <CopyButton text={item.promptText} label={copy.copyPromptLabel} copiedLabel={copy.copiedLabel} />
          ) : null}
        </div>
      );
    case "image":
      return item.imageUrl ? (
        <figure className="space-y-2">
          <div className="relative w-full border-2 border-current rounded-md overflow-hidden">
            <Image
              src={item.imageUrl}
              alt={item.imageAlt ?? item.title}
              width={1200}
              height={800}
              className="w-full h-auto"
              unoptimized
            />
          </div>
          {item.imageAlt ? (
            <figcaption className="text-xs opacity-60">{item.imageAlt}</figcaption>
          ) : null}
        </figure>
      ) : null;
    case "video": {
      const url = item.videoUrl ?? "";
      const yt = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/)?.[1];
      const vm = url.match(/vimeo\.com\/(\d+)/)?.[1];
      const frame = "aspect-video border-2 border-current rounded-md overflow-hidden";
      if (yt)
        return (
          <div className={frame}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${yt}`}
              title={item.title}
              className="w-full h-full"
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      if (vm)
        return (
          <div className={frame}>
            <iframe
              src={`https://player.vimeo.com/video/${vm}`}
              title={item.title}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        );
      return <video src={url} controls className="w-full border-2 border-current rounded-md" />;
    }
    case "link":
      return item.linkUrl ? (
        <a
          href={item.linkUrl}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          className="inline-flex items-center gap-2 border-2 border-current rounded-md bg-foreground text-background hover:bg-background hover:text-foreground transition-colors px-4 py-2 text-sm uppercase tracking-wider font-medium"
        >
          {copy.openLinkLabel}
        </a>
      ) : null;
    case "download":
      return item.fileStorageId ? (
        <a
          href={item.fileStorageId}
          download={item.fileName ?? item.slug}
          className="inline-flex items-center gap-2 border-2 border-current rounded-md bg-foreground text-background hover:bg-background hover:text-foreground transition-colors px-4 py-2 text-sm uppercase tracking-wider font-medium"
        >
          {copy.downloadLabel} {item.fileName ?? "file"}
          {item.fileSize ? ` · ${Math.round(item.fileSize / 1024)} KB` : ""}
        </a>
      ) : null;
    case "snippet":
      return (
        <div className="space-y-3">
          {item.snippetLang ? (
            <span className="inline-block border-2 border-current rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider opacity-70">
              {item.snippetLang}
            </span>
          ) : null}
          <pre
            className="border-2 border-current rounded-md p-4 text-xs leading-relaxed overflow-x-auto"
            translate="no"
          >
            <code translate="no" className="notranslate">
              {item.snippetCode}
            </code>
          </pre>
          {item.snippetCode ? (
            <CopyButton text={item.snippetCode} label={copy.copyCodeLabel} copiedLabel={copy.copiedLabel} />
          ) : null}
        </div>
      );
  }
}
