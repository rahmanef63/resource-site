import type { FsEntry } from "./types";

// In-memory tree helpers for the mock adapter. The fs is a flat map of
// dir-path → child entries; every folder owns its own key. Pure-ish operations
// on a passed `tree` object so the adapter file stays small.

export const GiB = 1024 ** 3;

export const file = (name: string, size: number, ext: string): FsEntry => ({
  name,
  kind: "file",
  size,
  ext,
});
export const dir = (name: string): FsEntry => ({ name, kind: "dir", size: 0 });

// "~"/"" map to the root "/" so the portable home token works the same as live.
export const norm = (p: string) =>
  p === "/" || p === "~" || p === "" ? "/" : p.replace(/\/+$/, "");
export const parentOf = (p: string) => {
  const n = norm(p);
  const i = n.lastIndexOf("/");
  return i <= 0 ? "/" : n.slice(0, i);
};
export const baseOf = (p: string) => norm(p).slice(norm(p).lastIndexOf("/") + 1);
export const join = (base: string, name: string) =>
  base === "/" ? "/" + name : base + "/" + name;
export const extOf = (name: string): string => {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
};

export type Tree = Record<string, FsEntry[]>;

export const entryIn = (tree: Tree, d: string, name: string) =>
  (tree[d] ?? []).find((e) => e.name === name);

// Recursively move every key under an old dir path to a new one.
export function rekey(tree: Tree, oldDir: string, newDir: string) {
  if (oldDir === newDir) return;
  for (const k of Object.keys(tree)) {
    if (k === oldDir || k.startsWith(oldDir + "/")) {
      tree[newDir + k.slice(oldDir.length)] = tree[k];
      delete tree[k];
    }
  }
}

export function cloneSubtree(tree: Tree, srcDir: string, destDir: string) {
  tree[destDir] = (tree[srcDir] ?? []).map((e) => ({ ...e }));
  for (const child of tree[srcDir] ?? []) {
    if (child.kind === "dir")
      cloneSubtree(tree, join(srcDir, child.name), join(destDir, child.name));
  }
}

export function dropSubtree(tree: Tree, d: string) {
  for (const k of Object.keys(tree)) {
    if (k === d || k.startsWith(d + "/")) delete tree[k];
  }
}

// Move OR copy a single entry from `from` to the full destination path `to`.
export function transfer(tree: Tree, from: string, to: string, mode: "move" | "copy") {
  from = norm(from);
  to = norm(to);
  const srcDir = parentOf(from);
  const destDir = parentOf(to);
  const srcName = baseOf(from);
  const destName = baseOf(to);
  const src = entryIn(tree, srcDir, srcName);
  if (!src) throw new Error("not found: " + from);
  if (!tree[destDir]) throw new Error("no such dir: " + destDir);
  if (src.kind === "dir" && (to === from || to.startsWith(from + "/")))
    throw new Error("cannot move into itself");

  const moved: FsEntry =
    src.kind === "dir"
      ? { ...src, name: destName }
      : { ...src, name: destName, ext: extOf(destName) || src.ext };
  tree[destDir] = [...(tree[destDir] ?? []).filter((e) => e.name !== destName), moved];

  if (mode === "move") {
    tree[srcDir] = (tree[srcDir] ?? []).filter((e) => e.name !== srcName);
    if (src.kind === "dir") rekey(tree, join(srcDir, srcName), join(destDir, destName));
  } else if (src.kind === "dir") {
    cloneSubtree(tree, join(srcDir, srcName), join(destDir, destName));
  }
}

// A believable, full home directory so the explorer looks live out of the box
// (mirrors the os-vps seed: Desktop / Documents / Pictures / Music / Projects /
// Downloads, nested folders, mixed file types). CRUD really mutates this.
export function seedTree(): Tree {
  return {
    "/": [
      dir("Desktop"),
      dir("Documents"),
      dir("Downloads"),
      dir("Music"),
      dir("Pictures"),
      dir("Projects"),
      file("readme.md", 1840, "md"),
      file("notes.txt", 612, "txt"),
      file(".bashrc", 480, ""),
    ],
    "/Desktop": [
      file("Getting Started.pdf", 142_000, "pdf"),
      file("screenshot.png", 884_000, "png"),
    ],
    "/Documents": [
      dir("Invoices"),
      dir("Contracts"),
      file("hello.pdf", 394, "pdf"),
      file("resume.pdf", 320_000, "pdf"),
      file("plan.md", 2300, "md"),
      file("budget.csv", 18_400, "csv"),
      file("meeting-notes.txt", 4_200, "txt"),
    ],
    "/Documents/Invoices": [
      file("2026-01.pdf", 88_000, "pdf"),
      file("2026-02.pdf", 91_000, "pdf"),
      file("2026-03.pdf", 87_500, "pdf"),
    ],
    "/Documents/Contracts": [
      file("nda.pdf", 64_000, "pdf"),
      file("msa-v2.docx", 38_000, "docx"),
    ],
    "/Music": [
      dir("Playlists"),
      file("beep.wav", 1004, "wav"),
      file("track-01.mp3", 6_200_000, "mp3"),
      file("track-02.mp3", 5_800_000, "mp3"),
    ],
    "/Music/Playlists": [file("focus.m3u", 1_240, "m3u")],
    "/Pictures": [
      dir("Camera"),
      dir("Wallpapers"),
      file("logo.svg", 380, "svg"),
      file("avatar.jpg", 240_000, "jpg"),
    ],
    "/Pictures/Camera": [
      file("IMG_0001.jpg", 3_100_000, "jpg"),
      file("IMG_0002.jpg", 2_900_000, "jpg"),
      file("IMG_0003.heic", 1_700_000, "heic"),
    ],
    "/Pictures/Wallpapers": [
      file("aurora.png", 4_400_000, "png"),
      file("mountain.jpg", 3_600_000, "jpg"),
    ],
    "/Projects": [
      dir("file-explorer"),
      dir("website"),
      file("TODO.md", 980, "md"),
    ],
    "/Projects/file-explorer": [
      dir("src"),
      file("package.json", 2040, "json"),
      file("README.md", 4120, "md"),
      file("tsconfig.json", 640, "json"),
      file("data.json", 74, "json"),
    ],
    "/Projects/file-explorer/src": [
      file("index.ts", 3200, "ts"),
      file("app.tsx", 5600, "tsx"),
      file("styles.css", 1400, "css"),
    ],
    "/Projects/website": [
      // Seeded with metadata so Properties shows a live example (custom icon +
      // endpoint). The 🌐 glyph replaces the generic icon in the explorer.
      { ...file("index.html", 180, "html"), meta: { icon: "🌐", endpoint: "https://api.example.com/site" } },
      file("main.js", 7800, "js"),
    ],
    "/Downloads": [
      file("invoice.pdf", 240_000, "pdf"),
      file("backup.zip", 156_000_000, "zip"),
      file("photo.jpg", 2_400_000, "jpg"),
      file("archive.tar.gz", 64_000_000, "gz"),
      file("installer.dmg", 412_000_000, "dmg"),
    ],
    "/.Trash": [],
  };
}

export const MOCK_ROOTS = [
  { label: "Home", path: "~" },
  { label: "Desktop", path: "/Desktop" },
  { label: "Documents", path: "/Documents" },
  { label: "Pictures", path: "/Pictures" },
  { label: "Projects", path: "/Projects" },
  { label: "Downloads", path: "/Downloads" },
];
