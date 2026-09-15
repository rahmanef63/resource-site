"use client";

import { useCallback } from "react";
import { toast } from "./host";
import { createMediaRef, SAMPLES } from "./import-core";
import type { MediaRef, MediaType } from "./mock-timeline";

export { SAMPLES } from "./import-core";

export function useImport(onAdd: (media: MediaRef, name: string) => void) {
  const add = useCallback(async (url: string, type: MediaType, name: string) => {
    try {
      onAdd(await createMediaRef(url, type), name);
      toast(`Added ${name}`, { tone: "success" });
    } catch (error) {
      toast(error instanceof Error ? error.message : "Import failed", { tone: "error" });
    }
  }, [onAdd]);

  const onFile = useCallback((type: MediaType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void add(URL.createObjectURL(file), type, file.name);
    event.target.value = "";
  }, [add]);

  return { add, onFile };
}
