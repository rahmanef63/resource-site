"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { EditorAdapter } from "./adapter";

/**
 * React context carrying the host's {@link EditorAdapter}. Defaults to `{}`
 * so any editor subtree renders standalone (uploads/comments/database/etc.
 * simply absent). The host wraps its editor in <EditorAdapterProvider> to
 * light up capabilities. This is the runtime half of the decoupling seam.
 */
const EditorAdapterContext = createContext<EditorAdapter>({});

export function EditorAdapterProvider({
  adapter,
  children,
}: {
  adapter: EditorAdapter;
  children: ReactNode;
}) {
  return (
    <EditorAdapterContext.Provider value={adapter}>
      {children}
    </EditorAdapterContext.Provider>
  );
}

export function useEditorAdapter(): EditorAdapter {
  return useContext(EditorAdapterContext);
}
