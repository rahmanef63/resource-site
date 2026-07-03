// settings — two adapter-driven settings shells behind one slug. They ship
// different components + incompatible adapter shapes, so this root is a barrel
// (not a variant= switcher):
//   account     — profile / preferences / notifications / danger-zone over an
//                 async load+save SettingsAdapter (<SettingsShell />).
//   appearance  — style / mode / accent / wallpaper / display over a sync
//                 per-setting AppearanceAdapter (<AppearancePanel />), plus the
//                 generic SettingsSection / SettingsRow / Segmented primitives.
// Install one with `npx rr add settings account|appearance`, or both with
// `npx rr add settings` and wire the adapter each shell needs.
export * from "./variants/account";
export * from "./variants/appearance";
export { settingsFeature } from "./config";
