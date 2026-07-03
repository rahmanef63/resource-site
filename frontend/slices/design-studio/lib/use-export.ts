"use client";

import { useMemo, useState } from "react";
import type { Adjustments } from "./filters";
import { buildDoc, downloadText, type Layer } from "./model";
import { buildHTML, importFile } from "./serialize";
import { canSaveToHost, saveDocToHost } from "./host";
import type { ExportTab } from "../components/export-modal";

const MIME: Record<ExportTab, string> = {
  json: "application/json",
  html: "text/html",
};

type ImportApply = (r: {
  layers: Layer[];
  aspect?: string;
  adjustments?: Adjustments;
}) => void;

// Export/Import modal state + handlers: serialize the current composition to
// the os-rr/layers@1 JSON doc or a standalone HTML page, download/copy it,
// optionally persist via the host seam, and re-import a dropped file.
export function useExport({
  layers,
  aspect,
  adjustments,
  onImport,
  notify,
}: {
  layers: Layer[];
  aspect: string;
  adjustments: Adjustments;
  onImport: ImportApply;
  notify: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ExportTab>("json");

  const text = useMemo(
    () =>
      tab === "json"
        ? JSON.stringify(buildDoc(layers, aspect, adjustments), null, 2)
        : buildHTML(layers, aspect),
    [tab, layers, aspect, adjustments],
  );

  const download = () => downloadText(`design.${tab}`, text, MIME[tab]);

  const copy = () => {
    void navigator.clipboard?.writeText(text).then(
      () => notify("Copied to clipboard"),
      () => notify("Copy failed"),
    );
  };

  // Persist through the host adapter (no-op button unless wired — see host.ts).
  const saveToHost = () => {
    void saveDocToHost(text, `design.${tab}`, MIME[tab])
      .then((path) => notify(path ? `Saved → ${path}` : "No host writer wired"))
      .catch((e: unknown) =>
        notify(e instanceof Error ? e.message : "save failed"),
      );
  };

  const doImport = (file: File) => {
    importFile(file)
      .then((r) => {
        onImport(r);
        setOpen(false);
        notify(`Imported ${file.name}`);
      })
      .catch((e: unknown) =>
        notify(e instanceof Error ? e.message : "import failed"),
      );
  };

  return {
    open,
    setOpen,
    tab,
    setTab,
    text,
    download,
    copy,
    doImport,
    hostWired: canSaveToHost(),
    saveToHost,
  };
}
