"use client"; import { useEffect,useSyncExternalStore } from "react"; import { inspectorStore,publishInspector,clearInspector,type InspectorInfo } from "./inspector-core"; export * from "./inspector-core";
export function useInspectorInfo(appId:string|null|undefined){useSyncExternalStore(inspectorStore.subscribe,inspectorStore.version,inspectorStore.version);return inspectorStore.get(appId)}
export function usePublishInspector(appId:string,info:InspectorInfo,deps:unknown[]){useEffect(()=>{publishInspector(appId,info);return()=>clearInspector(appId)},[appId,...deps])}
