"use client";
import { useSyncExternalStore } from "react"; import { toastStore,notificationStore } from "./toast-core"; export * from "./toast-core";
export function useToasts(){return useSyncExternalStore(toastStore.subscribe,toastStore.get,toastStore.get)}
export function useNotifications(){return useSyncExternalStore(notificationStore.subscribe,notificationStore.get,notificationStore.get)}
