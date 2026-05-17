"use client";

import * as React from "react";
import { SlicePreviewLayout, PreviewSection, CodeBlock } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import {
  Frame, PageMock, Dialog, Seg, VariantCard, type Mobile, type Variant,
} from "./parts";

export default function Page() {
  const [open, setOpen] = React.useState(false);
  const [viewport, setViewport] = React.useState<"mobile" | "desktop">("desktop");
  const [variant, setVariant] = React.useState<Variant>("modal");
  const [mobile, setMobile] = React.useState<Mobile>("drawer-bottom");

  return (
    <SlicePreviewLayout
      title="Responsive Dialog"
      kind="ui"
      description="Same API, two presentations: bottom Sheet on mobile, centered Modal on desktop."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/template-base/frontend/shared/ui/components/ResponsiveDialog.tsx"
    >
      <PreviewSection
        title="Live demo"
        hint={
          <span className="flex items-center gap-1.5 text-xs">
            Toggle viewport, variant, mobile placement
          </span>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Seg label="Viewport" value={viewport} options={["mobile", "desktop"]} onChange={(v) => setViewport(v as never)} />
          <Seg label="Variant" value={variant} options={["modal", "panel", "alert"]} onChange={(v) => setVariant(v as Variant)} />
          {viewport === "mobile" && (
            <Seg label="Mobile" value={mobile} options={["drawer-bottom", "drawer-right"]} onChange={(v) => setMobile(v as Mobile)} />
          )}
          <Button onClick={() => setOpen(true)} className="ml-auto">
            Open dialog
          </Button>
        </div>

        <Frame viewport={viewport}>
          {open && (
            <Dialog
              onClose={() => setOpen(false)}
              viewport={viewport}
              variant={variant}
              mobile={mobile}
            />
          )}
          {!open && <PageMock />}
        </Frame>
      </PreviewSection>

      <PreviewSection title="Variants" hint="modal · panel · alert">
        <div className="grid gap-3 sm:grid-cols-3">
          <VariantCard title="modal" desc="Standard centered dialog with backdrop." />
          <VariantCard title="panel" desc="Edge-anchored sheet on both viewports — for settings, filters." />
          <VariantCard title="alert" desc="Tighter, destructive-confirm flavor. Disable backdrop dismiss." />
        </div>
      </PreviewSection>

      <PreviewSection title="Wiring">
        <CodeBlock>{`import {
  ResponsiveDialog,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/features/responsive-dialog";

<ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
  <ResponsiveDialogHeader>
    <ResponsiveDialogTitle>Konfirmasi</ResponsiveDialogTitle>
  </ResponsiveDialogHeader>
  <ResponsiveDialogBody>…</ResponsiveDialogBody>
  <ResponsiveDialogFooter>
    <Button onClick={onSubmit}>Lanjut</Button>
  </ResponsiveDialogFooter>
</ResponsiveDialog>`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
