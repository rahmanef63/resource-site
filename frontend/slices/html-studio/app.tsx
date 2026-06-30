"use client";
/* HTML Studio — a tiny web-page studio. Type HTML / CSS / JS, see it render
   live in a SANDBOXED iframe (opaque origin — lib/util.ts HTML_SANDBOX), then
   Save to get a shareable /p/<slug>. The backend (save / load / list / remove)
   is INJECTED via the host seam (lib/host.ts); unwired it runs on an in-memory
   mock so the editor + live preview + saved list are interactive with zero
   backend. View toggle (Code / Split / Preview) + device-width preview kept. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useHtmlStudioApi } from "./lib/host";
import type { AppProps, PageRow, Visibility } from "./lib/host";
import { DEVICE_ICON, DEVICE_NEXT, SPLIT_MIN, STARTER, shareUrl, payloadSlug } from "./lib/util";
import type { Device, View } from "./lib/util";
import { Toolbar } from "./components/toolbar";
import { Editor, PreviewPane } from "./components/panes";
import { SavedList, ShareStrip } from "./components/saved-list";

// Default export so an os-shell can lazy-load this as a window app.
export default function HtmlStudio({ payload }: AppProps = {}) {
  const api = useHtmlStudioApi();
  const [html, setHtml] = useState(STARTER);
  const [title, setTitle] = useState("Untitled");
  const [slug, setSlug] = useState<string | null>(() => payloadSlug(payload));
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [preview, setPreview] = useState(STARTER);
  const [rows, setRows] = useState<PageRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [view, setView] = useState<View>("split");
  const [device, setDevice] = useState<Device>("full");

  // Container-responsive layout (the window resizes freely).
  const bodyRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    setW(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = w > 0 && w < SPLIT_MIN;
  const v: View = narrow && view === "split" ? "preview" : view;
  const showEditor = v === "code" || v === "split";
  const showPreview = v === "preview" || v === "split";

  // Debounced live preview.
  useEffect(() => {
    const id = setTimeout(() => setPreview(html), 250);
    return () => clearTimeout(id);
  }, [html]);

  const refreshList = useCallback(() => {
    if (!api.hasList) return;
    api.list().then(setRows).catch(() => {});
  }, [api]);

  const openPage = useCallback(
    (s: string) => {
      api
        .load(s)
        .then((p) => {
          if (!p) return;
          setHtml(p.html);
          setPreview(p.html);
          setTitle(p.title);
          setSlug(p.slug);
          setVisibility(p.visibility);
          setListOpen(false);
        })
        .catch(() => {});
    },
    [api],
  );

  // Initial: load the saved list and, if launched with a slug, that page.
  useEffect(() => {
    refreshList();
    const s = payloadSlug(payload);
    if (s) openPage(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyLink = useCallback(
    async (s: string | null = slug) => {
      if (!s) return;
      try {
        await navigator.clipboard.writeText(shareUrl(s));
      } catch {
        /* clipboard blocked — non-fatal */
      }
    },
    [slug],
  );

  async function save() {
    if (!api.canSave || saving) return;
    setSaving(true);
    try {
      const res = await api.save({ slug: slug ?? undefined, title, html, visibility });
      setSlug(res.slug);
      refreshList();
      void copyLink(res.slug);
    } finally {
      setSaving(false);
    }
  }

  function newPage() {
    setSlug(null);
    setTitle("Untitled");
    setHtml(STARTER);
    setPreview(STARTER);
    setVisibility("public");
  }

  async function removePage(s: string) {
    await api.remove(s);
    if (s === slug) newPage();
    refreshList();
  }

  const DeviceIcon = DEVICE_ICON[device];
  const isPrivate = visibility === "private";

  return (
    <div className="relative flex h-full flex-col bg-background text-foreground">
      <Toolbar
        title={title}
        onTitle={setTitle}
        view={v}
        narrow={narrow}
        onView={setView}
        isPrivate={isPrivate}
        onToggleVisibility={() => setVisibility((x) => (x === "public" ? "private" : "public"))}
        onNewPage={newPage}
        listOpen={listOpen}
        rowCount={rows.length}
        onToggleList={() => {
          setListOpen((o) => !o);
          refreshList();
        }}
        onSave={save}
        saving={saving}
        canSave={api.canSave}
        hasList={api.hasList}
        onCopyLink={() => void copyLink()}
        slug={slug}
      />

      {slug && <ShareStrip slug={slug} isPrivate={isPrivate} onCopy={() => void copyLink()} />}

      <div className="flex min-h-0 flex-1">
        {listOpen && api.hasList && (
          <SavedList rows={rows} slug={slug} onOpen={openPage} onRemove={removePage} />
        )}
        <div ref={bodyRef} className="flex min-h-0 min-w-0 flex-1">
          {showEditor && <Editor html={html} onChange={setHtml} showPreview={showPreview} />}
          {showPreview && (
            <PreviewPane
              preview={preview}
              showEditor={showEditor}
              device={device}
              deviceIcon={DeviceIcon}
              onCycleDevice={() => setDevice(DEVICE_NEXT[device])}
            />
          )}
        </div>
      </div>
    </div>
  );
}
