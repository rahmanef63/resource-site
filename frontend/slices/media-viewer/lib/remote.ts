export type MediaKind = "image" | "video" | "audio" | "pdf";
export type RemoteFile = { path: string; name: string; kind: MediaKind };

/** Extract a validated remote-file payload from a host window payload. */
export function remoteFile(payload: unknown): RemoteFile | null {
  if (!payload || typeof payload !== "object") return null;
  const candidate = payload as Partial<RemoteFile>;
  if (typeof candidate.path !== "string" || !candidate.path) return null;
  const allowed = ["image", "video", "audio", "pdf"] as const;
  const kind: MediaKind = allowed.includes(candidate.kind as MediaKind)
    ? (candidate.kind as MediaKind)
    : "image";
  return {
    path: candidate.path,
    name: candidate.name ?? candidate.path,
    kind,
  };
}
