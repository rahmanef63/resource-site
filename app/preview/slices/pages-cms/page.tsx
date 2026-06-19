"use client";

import * as React from "react";
import { LocalPagesProvider, PagesView, PageEditorView, usePagesStore, defaultPages } from "@/features/pages-cms";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";

/**
 * Live demo for the pages-cms slice. Runs entirely on the bundled
 * localStorage adapter (LocalPagesProvider) with a GENERIC Home/About/
 * Pricing seed — no Convex, no env (Hard Rule 6). The slice's PagesView
 * links to `${adminBase}/pages/[id]`; in this iframe we intercept that
 * by holding the "open editor" id in local React state instead of
 * routing, so list ↔ editor both render in one page.
 */

const PUBLIC_BASE = "/p";
const ADMIN_BASE = "/admin";

function Demo() {
  const { pages } = usePagesStore();
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // The slice navigates via window.location to `${ADMIN_BASE}/pages/<id>`.
  // Intercept clicks on those links so the demo stays in-iframe.
  const onClick = React.useCallback((e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    if (!a) return;
    const href = a.getAttribute("href") ?? "";
    const m = href.match(new RegExp(`^${ADMIN_BASE}/pages/(.+)$`));
    if (m) {
      e.preventDefault();
      setEditingId(m[1]);
    }
  }, []);

  const editing = editingId ? pages.find((p) => p.id === editingId) ?? null : null;

  return (
    <div onClick={onClick}>
      {editing ? (
        <div className="space-y-3">
          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
            ← Back to list
          </Button>
          <PageEditorView id={editing.id} publicBase={PUBLIC_BASE} adminBase={ADMIN_BASE} />
        </div>
      ) : (
        <PagesView publicBase={PUBLIC_BASE} adminBase={ADMIN_BASE} />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <SlicePreviewLayout title="Pages CMS" kind="ui" maxWidth="none">
      <PreviewSection title="Live demo" hint="localStorage · generic Home/About/Pricing seed">
        <LocalPagesProvider storageKey="pages-cms:preview" seed={defaultPages()}>
          <Demo />
        </LocalPagesProvider>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
