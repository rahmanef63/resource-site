"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/content/site";

const HIDE_PREFIXES = ["/preview", "/admin", "/admin-login"];

export function SiteFooter() {
  const pathname = usePathname() || "";
  if (HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <footer className="border-t py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
        <Link href="/" className="flex items-center gap-3" aria-label={site.name}>
          <Image
            src="/brand-assets/logo-wordmark-light.svg"
            alt={site.name}
            width={120}
            height={24}
            className="hidden h-6 w-auto dark:block"
          />
          <Image
            src="/brand-assets/logo-wordmark-dark.svg"
            alt={site.name}
            width={120}
            height={24}
            className="h-6 w-auto dark:hidden"
          />
        </Link>
        <p>
          Built by{" "}
          <a
            href={site.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            {site.author}
          </a>
          . Self-hosted on Dokploy via si-coder.
        </p>
        <div className="flex items-center gap-4">
          <a
            href={site.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <Link href="/llms.txt" className="hover:text-foreground">
            llms.txt
          </Link>
          <Link href="/api/knowledge" className="hover:text-foreground">
            API
          </Link>
        </div>
      </div>
    </footer>
  );
}
