import * as React from "react";
import { SlicePreviewLayout } from "@/components/slice-previews/preview-layout";
import { Card } from "@/components/ui/card";
import { MarqueeMock, KineticMock, MagneticMock, SpotlightMock } from "./mocks-text";
import { CounterMock, ReadingMock, GrainMock, LightboxMock } from "./mocks-visual";

/**
 * 8 motion primitives demo. The actual implementations live in
 * template-base/frontend/shared/ui/motion/ (framer-motion). Here we render
 * lightweight CSS-only mocks of each so the preview can stay framer-free.
 */

export default function Page() {
  return (
    <SlicePreviewLayout
      title="Motion Primitives (8)"
      kind="ui"
      description="Eight independently-importable motion components. Tree-shakeable."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/template-base/frontend/shared/ui/motion"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Tile title="Marquee" hint="Infinite scroll strip"><MarqueeMock /></Tile>
        <Tile title="KineticHeading" hint="Letter-by-letter reveal"><KineticMock /></Tile>
        <Tile title="Magnetic" hint="Cursor-pulled CTA"><MagneticMock /></Tile>
        <Tile title="CursorSpotlight" hint="Hover-reveal radial"><SpotlightMock /></Tile>
        <Tile title="StatCounter" hint="Count-up on view"><CounterMock /></Tile>
        <Tile title="ReadingProgress" hint="Scroll progress bar"><ReadingMock /></Tile>
        <Tile title="Grain" hint="Film-grain overlay"><GrainMock /></Tile>
        <Tile title="Lightbox" hint="Image gallery zoom"><LightboxMock /></Tile>
      </div>
    </SlicePreviewLayout>
  );
}

function Tile({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b bg-muted/30 px-3 py-2">
        <div className="text-xs font-medium">{title}</div>
        <div className="text-[10px] text-muted-foreground">{hint}</div>
      </div>
      <div className="flex min-h-[140px] items-center justify-center p-4">{children}</div>
    </Card>
  );
}
