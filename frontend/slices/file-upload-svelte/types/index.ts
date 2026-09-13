export type FileRef = string;

export interface ParsedFileRef {
  kind: "storage" | "url" | "name";
  storageId?: string;
  filename: string;
  raw: string;
}
