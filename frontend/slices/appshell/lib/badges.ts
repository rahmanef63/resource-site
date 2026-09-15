"use client";
import { useSyncExternalStore } from "react"; import { badgeStore } from "./badges-core"; export * from "./badges-core";
export function useBadge(appId:string){return useSyncExternalStore(badgeStore.subscribe,()=>badgeStore.getOne(appId),()=>badgeStore.getOne(appId))}
export function useBadges(){return useSyncExternalStore(badgeStore.subscribe,badgeStore.get,badgeStore.get)}
