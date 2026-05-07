/**
 * Shared System Entry Point
 *
 * Expose domain-specific facades via namespaced exports to avoid symbol collisions.
 *
 * Usage:
 *   import { builder, ui } from "@/frontend/shared"
 *   builder.SharedCanvasProvider(...)
 */

export * as ai from "./ai";
export * as builder from "./builder";
export * as communications from "./communications";
export * as context from "./context";
export * as foundation from "./foundation";
export * as settings from "./settings";
export * as ui from "./ui";
export * as workspace from "./workspace";
