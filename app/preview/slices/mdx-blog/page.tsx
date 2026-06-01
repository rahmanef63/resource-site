"use client";

import * as React from "react";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  return (
    <SlicePreviewLayout
      title="MDX Blog"
      kind="ui"
      description="Markdown-with-JSX blog. File-based content under content/blog/*.mdx. Auto ToC, reading time, syntax highlight."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/mdx-blog"
    >
      <PreviewSection title="Rendered post">
        <article className="prose prose-sm dark:prose-invert mx-auto max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">tutorial</Badge>
            <span>· 5 min read</span>
            <span>· 2026-05-11</span>
          </div>
          <h1>Setup Convex Self-Hosted di Dokploy</h1>
          <p className="lead">
            Cara minimal untuk menjalankan Convex sendiri di VPS dengan Dokploy.
            Tidak butuh akun cloud — semua kontrol di tangan Anda.
          </p>
          <h2>Prasyarat</h2>
          <ul>
            <li>VPS Linux dengan Docker + Dokploy</li>
            <li>Domain root + wildcard DNS</li>
            <li>Email untuk Let's Encrypt</li>
          </ul>
          <h2>Langkah 1 — siapkan docker-compose</h2>
          <pre>
            <code>{`services:
  convex-backend:
    image: ghcr.io/get-convex/convex-backend:latest
    env_file: ../.env.convex.deploy`}</code>
          </pre>
          <p>
            Konfigurasi minimum di atas sudah cukup untuk development. Untuk
            production tambahkan volume mount + restart policy.
          </p>
          <h2>Langkah 2 — provision domain</h2>
          <p>
            Tambahkan A-record wildcard <code>*.yourdomain.com</code> ke IP VPS.
            Dokploy akan auto-issue cert via Caddy.
          </p>
          <blockquote>
            <p>
              <strong>Tip:</strong> Kalau pakai Cloudflare, set <em>SSL/TLS mode = Full</em>
              supaya Caddy bisa handshake langsung ke origin.
            </p>
          </blockquote>
          <h2>Selesai</h2>
          <p>
            Reload <code>npx convex dev</code> dan deployment baru langsung
            aktif. Selamat ngoding!
          </p>
        </article>
      </PreviewSection>

      <PreviewSection title="What's special">
        <div className="grid gap-2 text-xs sm:grid-cols-3">
          <Feature label="Auto ToC" desc="Remark plugin extract headings → sidebar nav." />
          <Feature label="Reading time" desc="reading-time npm; ditampilkan di header post." />
          <Feature label="Syntax highlight" desc="rehype-pretty-code dengan theme tweakable." />
          <Feature label="Inline JSX" desc="Embed React components langsung di MDX body." />
          <Feature label="Frontmatter" desc="gray-matter parse title/date/tags/cover." />
          <Feature label="No DB" desc="File-based — git diff = audit log." />
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function Feature({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs font-medium">{label}</div>
      <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}
