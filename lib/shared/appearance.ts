"use client";
/* Appearance store — barrel. The real implementation lives in sibling files
   (extract-and-re-export split, behaviour unchanged):
     - appearance-store.ts      ← singleton state + public API
     - appearance-wallpaper.ts  ← wallpaper CSS helpers
     - appearance-brand.ts      ← brand-accent DOM helpers
   See appearance-store.ts for the full module docs. */
export * from "./appearance-store";
