"use client";

import * as React from "react";
import { RichEditor, type Mode } from "@/shared/ui/rich-editor";

type Props = {
  value: string;
  onChange: (next: string) => void;
  /** Optional refiner hook — passed through to RichEditor's refiner mode. */
  onRefine?: (html: string, prompt: string) => Promise<string>;
  /** Initial editor mode. Auto-picks "html" when content already has tags
   *  that TipTap's StarterKit would strip (iframe, script, etc.). */
  initialMode?: Mode;
};

const HTML_MARKERS = /<(iframe|script|video|audio|svg|canvas|object|embed|template)\b/i;

function pickInitialMode(value: string): Mode {
  if (!value) return "richtext";
  // If the existing content has tags TipTap would silently drop, default
  // to HTML mode so the user sees + keeps everything.
  return HTML_MARKERS.test(value) ? "html" : "richtext";
}

/**
 * AdminCrud field renderer for `type: "richeditor"`. Owns the local
 * editor-mode state so multiple richeditor fields in the same form keep
 * independent toggles. Output is a plain HTML string written back to the
 * parent's draft via `onChange`.
 */
export function AdminRichEditorField({
  value,
  onChange,
  onRefine,
  initialMode,
}: Props) {
  const [mode, setMode] = React.useState<Mode>(
    () => initialMode ?? pickInitialMode(value),
  );

  return (
    <RichEditor
      value={value ?? ""}
      onChange={onChange}
      mode={mode}
      onModeChange={setMode}
      onRefine={onRefine}
    />
  );
}
