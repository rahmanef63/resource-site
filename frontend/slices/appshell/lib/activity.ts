"use client";
import { useSyncExternalStore } from "react"; import { activityStore } from "./activity-core"; export * from "./activity-core";
export function useActivities(){return useSyncExternalStore(activityStore.subscribe,activityStore.get,activityStore.get)}
