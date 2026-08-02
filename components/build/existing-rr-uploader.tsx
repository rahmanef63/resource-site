"use client";

import * as React from "react";
import { AlertCircle, FileJson, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export type ParsedRr = {
  template?: { slug: string };
  features?: { slug: string }[];
  slices?: { slug: string }[];
  skills?: { slug: string }[];
};

export function ExistingRrUploader({ onParsed }: { onParsed: (rr: ParsedRr | null) => void }) {
  const [raw, setRaw] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [parsed, setParsed] = React.useState<ParsedRr | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  function tryParse(input: string) {
    setRaw(input);
    if (!input.trim()) {
      setError(null);
      setParsed(null);
      onParsed(null);
      return;
    }
    try {
      const obj = JSON.parse(input) as ParsedRr;
      setParsed(obj);
      setError(null);
      onParsed(obj);
    } catch (e) {
      setError((e as Error).message);
      setParsed(null);
      onParsed(null);
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <FileJson className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Existing rr.json</h3>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            tryParse(await f.text());
          }}
        />
        <Button
          size="sm"
          variant="outline"
          className="ml-auto h-7 gap-1.5 text-[11px]"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="size-3" />
          Upload
        </Button>
      </div>

      <Textarea
        value={raw}
        onChange={(e) => tryParse(e.target.value)}
        placeholder='Paste your project rr.json here…'
        className="h-32 font-mono text-[11px]"
      />

      {error && (
        <p className="flex items-start gap-1.5 text-[11px] text-destructive">
          <AlertCircle className="mt-0.5 size-3 shrink-0" />
          <span>JSON parse failed: {error}</span>
        </p>
      )}

      {parsed && (
        <div className="rounded-md border bg-muted/30 p-2 text-[11px]">
          <p className="font-medium">Detected:</p>
          <ul className="mt-1 space-y-0.5">
            <li>
              template: {parsed.template?.slug ? <Badge variant="outline" className="rounded-full text-[9px]">{parsed.template.slug}</Badge> : <span className="text-muted-foreground">none</span>}
            </li>
            <li>
              features: {parsed.features?.length ? parsed.features.map((f) => f.slug).join(", ") : <span className="text-muted-foreground">none</span>}
            </li>
            <li>
              skills: {parsed.skills?.length ? parsed.skills.map((s) => s.slug).join(", ") : <span className="text-muted-foreground">none</span>}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
