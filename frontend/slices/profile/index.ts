// profile — one owner's identity in two renderings. Two co-located variants
// (they export different components, so this root is a barrel, not a variant=
// switcher): `resume` (a formal one-column printable CV) and `card` (a compact
// avatar + links + FAQ identity card). Install one with
// `npx rr add profile resume|card`, or both with `npx rr add profile` and
// mount the component you want — both render a populated placeholder unwired,
// and read injected data via configureResume() / configureAbout().
export * from "./variants/resume";
export * from "./variants/card";
export { profileConfig } from "./config";
export type { ProfileConfig } from "./config";
