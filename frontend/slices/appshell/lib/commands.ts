"use client";
import { useSyncExternalStore } from "react";
import { commandStore } from "./commands-core";
export * from "./commands-core";
export function useCommands(){ return useSyncExternalStore(commandStore.subscribe, commandStore.get, commandStore.get) }
