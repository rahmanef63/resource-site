"use client";

import * as React from "react";
import preview from "@/features/marketing-chrome/preview";
import type { FooterLayout, HeaderLayout } from "@/features/marketing-chrome";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HeaderPreview = preview.MarketingHeader;
const FooterPreview = preview.MarketingFooter;
const HEADER_LAYOUTS: HeaderLayout[] = ["split", "centered", "minimal"];
const FOOTER_LAYOUTS: FooterLayout[] = ["columns", "slim"];

function Toggle<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div className="mb-4 inline-flex rounded-md border border-input p-0.5">
      {options.map((v) => (
        <Button
          key={v}
          variant="ghost"
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "h-auto rounded px-3 py-1 text-xs capitalize",
            value === v ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {v}
        </Button>
      ))}
    </div>
  );
}

export default function Page() {
  const [headerLayout, setHeaderLayout] = React.useState<HeaderLayout>("split");
  const [footerLayout, setFooterLayout] = React.useState<FooterLayout>("columns");
  return (
    <SlicePreviewLayout
      title="Marketing Chrome"
      kind="ui"
      maxWidth="none"
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/marketing-chrome"
    >
      <PreviewSection title="Full page" hint={`header="${headerLayout}" · footer="${footerLayout}"`}>
        <div className="flex flex-wrap gap-6">
          <Toggle value={headerLayout} options={HEADER_LAYOUTS} onChange={setHeaderLayout} />
          <Toggle value={footerLayout} options={FOOTER_LAYOUTS} onChange={setFooterLayout} />
        </div>

        <div className="overflow-hidden rounded-lg border">
          <HeaderPreview variant={{ layout: headerLayout }} />
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 bg-muted/30 px-6 py-20 text-center">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Ship faster with slices</h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Placeholder hero. Header sits above, footer below — both fully config-driven.
            </p>
            <Button asChild><a href="#">Get started</a></Button>
          </div>
          <FooterPreview variant={{ layout: footerLayout }} />
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
